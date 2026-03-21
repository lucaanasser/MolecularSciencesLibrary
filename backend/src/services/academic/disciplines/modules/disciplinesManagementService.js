/**
 * Responsabilidade: comandos de negocio para criar/atualizar/importar disciplinas.
 * Camada: service.
 * Entradas/Saidas: payload de disciplina; retorna entidades persistidas.
 * Dependencias criticas: AcademicDisciplinesModel, campusMap e logger padronizado.
 */

const { getLogger } = require('../../../../shared/logging/logger');
const { campusPorUnidade } = require('./campusMap');

const log = getLogger(__filename);

/**
 * O que faz: resolve campus por codigo de unidade.
 * Onde e usada: scripts e fluxos de importacao.
 * Dependencias chamadas: mapa local campusPorUnidade.
 * Efeitos colaterais: nenhum.
 */
function getCampusByCodigoUnidade(codigoUnidade) {
    return campusPorUnidade[parseInt(codigoUnidade, 10)] || 'Outro';
}

/**
 * O que faz: cria disciplina manual sem turmas.
 * Onde e usada: handler POST de disciplinas.
 * Dependencias chamadas: model.upsertDiscipline e model.getDisciplineByCodigo.
 * Efeitos colaterais: escrita em DB.
 */
async function createManualDiscipline(data) {
    log.start('Criando disciplina manual', { codigo: data.codigo });

    await this.model.upsertDiscipline({
        codigo: data.codigo,
        nome: data.nome,
        unidade: data.unidade,
        campus: data.campus,
        creditos_aula: data.creditos_aula,
        creditos_trabalho: data.creditos_trabalho,
        is_postgrad: data.is_postgrad,
        ementa: data.ementa,
        objetivos: data.objetivos,
        conteudo_programatico: data.conteudo_programatico,
        has_valid_classes: false
    });

    const created = await this.model.getDisciplineByCodigo(data.codigo);
    log.success('Disciplina manual criada', { codigo: data.codigo, discipline_id: created?.id });
    return created;
}

/**
 * O que faz: salva disciplina completa (disciplina, turmas, horarios e professores).
 * Onde e usada: scripts de scraping/importacao.
 * Dependencias chamadas: model.upsertDiscipline, model.getDisciplineByCodigo, model.deleteClassesByDisciplineId, model.insertClass, model.insertSchedule, model.insertProfessor.
 * Efeitos colaterais: escrita em multiplas tabelas.
 */
async function saveDiscipline(data) {
    log.start('Salvando disciplina completa', { codigo: data.codigo });

    await this.model.upsertDiscipline(data);

    const discipline = await this.model.getDisciplineByCodigo(data.codigo);
    if (!discipline) {
        throw new Error(`Disciplina ${data.codigo} nao encontrada apos upsert`);
    }

    await this.model.deleteClassesByDisciplineId(discipline.id);

    if (Array.isArray(data.turmas)) {
        for (const turma of data.turmas) {
            const insertedClass = await this.model.insertClass({
                discipline_id: discipline.id,
                codigo_turma: turma.codigo,
                codigo_turma_teorica: turma.codigo_teorica,
                tipo: turma.tipo,
                inicio: turma.inicio,
                fim: turma.fim,
                observacoes: turma.observacoes
            });

            if (Array.isArray(turma.horario)) {
                for (const horario of turma.horario) {
                    const insertedSchedule = await this.model.insertSchedule({
                        class_id: insertedClass.id,
                        dia: horario.dia,
                        horario_inicio: horario.inicio,
                        horario_fim: horario.fim
                    });

                    if (Array.isArray(horario.professores)) {
                        for (const professor of horario.professores) {
                            if (professor && professor.trim()) {
                                await this.model.insertProfessor({
                                    class_id: insertedClass.id,
                                    schedule_id: insertedSchedule.id,
                                    nome: professor.trim()
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    log.success('Disciplina completa salva', { codigo: data.codigo, discipline_id: discipline.id });
    return discipline;
}

/**
 * O que faz: deleta disciplina por id.
 * Onde e usada: fluxos administrativos.
 * Dependencias chamadas: model.deleteDiscipline.
 * Efeitos colaterais: escrita em DB.
 */
async function deleteDiscipline(id) {
    await this.model.deleteDiscipline(id);
    return true;
}

/**
 * O que faz: limpa todos os dados de disciplinas.
 * Onde e usada: rotina de reprocessamento de scraping.
 * Dependencias chamadas: model.clearAllData.
 * Efeitos colaterais: escrita em DB.
 */
async function clearAllData() {
    await this.model.clearAllData();
    return true;
}

module.exports = {
    getCampusByCodigoUnidade,
    createManualDiscipline,
    saveDiscipline,
    deleteDiscipline,
    clearAllData
};
