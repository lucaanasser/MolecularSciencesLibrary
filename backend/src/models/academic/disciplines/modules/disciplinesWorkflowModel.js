/**
 * Responsabilidade: operacoes de escrita principal e montagem de disciplina completa.
 * Camada: model.
 * Entradas/Saidas: payload de disciplina e codigo; retorna disciplina agregada.
 * Dependencias criticas: db helpers, modulos de consulta/estrutura e logger.
 */

const { executeQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: upsert da disciplina principal.
 * Onde e usada: criacao manual e fluxo de importacao.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function upsertDiscipline(data) {
    log.start('Upsert de disciplina', { codigo: data.codigo });

    const query = `
        INSERT INTO disciplines (
            codigo, nome, unidade, campus,
            creditos_aula, creditos_trabalho,
            has_valid_classes, is_postgrad, ementa, objetivos, conteudo_programatico, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(codigo) DO UPDATE SET
            nome = excluded.nome,
            unidade = excluded.unidade,
            campus = excluded.campus,
            creditos_aula = excluded.creditos_aula,
            creditos_trabalho = excluded.creditos_trabalho,
            has_valid_classes = excluded.has_valid_classes,
            is_postgrad = excluded.is_postgrad,
            ementa = excluded.ementa,
            objetivos = excluded.objetivos,
            conteudo_programatico = excluded.conteudo_programatico,
            updated_at = CURRENT_TIMESTAMP
    `;

    const params = [
        data.codigo,
        data.nome,
        data.unidade || null,
        data.campus || null,
        data.creditos_aula || 0,
        data.creditos_trabalho || 0,
        data.has_valid_classes ? 1 : 0,
        data.is_postgrad ? 1 : 0,
        data.ementa || null,
        data.objetivos || null,
        data.conteudo_programatico || null
    ];

    const result = await executeQuery(query, params);
    log.success('Upsert de disciplina concluido', { codigo: data.codigo });
    return result;
}

/**
 * O que faz: remove disciplina por id.
 * Onde e usada: manutencao administrativa.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function deleteDiscipline(id) {
    log.start('Removendo disciplina por id', { discipline_id: id });
    const result = await executeQuery('DELETE FROM disciplines WHERE id = ?', [id]);
    log.success('Disciplina removida', { discipline_id: id, changes: result.changes });
    return result;
}

/**
 * O que faz: monta disciplina completa com agrupamento de turmas teoricas/praticas.
 * Onde e usada: endpoint de detalhe completo.
 * Dependencias chamadas: getDisciplineByCodigo, getClassesByDisciplineId, getSchedulesByClassId, getProfessorsByClassId.
 * Efeitos colaterais: consultas em DB.
 */
async function getFullDiscipline(codigo) {
    log.start('Montando disciplina completa', { codigo });

    const discipline = await this.getDisciplineByCodigo(codigo);
    if (!discipline) {
        log.warn('Disciplina nao encontrada para montagem completa', { codigo });
        return null;
    }

    const allClasses = await this.getClassesByDisciplineId(discipline.id);

    for (const cls of allClasses) {
        cls.schedules = await this.getSchedulesByClassId(cls.id);
        cls.professors = await this.getProfessorsByClassId(cls.id);
    }

    const teoricas = allClasses.filter(cls => !cls.codigo_turma_teorica);
    const praticas = allClasses.filter(cls => cls.codigo_turma_teorica);

    const grouped = teoricas.map(teorica => {
        const linkedPractices = praticas.filter(
            pratica => pratica.codigo_turma_teorica === teorica.codigo_turma
        );

        if (!linkedPractices.length) {
            return teorica;
        }

        const mergedSchedules = [...teorica.schedules];
        const mergedProfessors = [...teorica.professors];

        linkedPractices.forEach(pratica => {
            mergedSchedules.push(...pratica.schedules);
            mergedProfessors.push(...pratica.professors);
        });

        return {
            ...teorica,
            schedules: mergedSchedules,
            professors: mergedProfessors,
            has_pratica: true,
            praticas_vinculadas: linkedPractices.map(item => item.codigo_turma)
        };
    });

    discipline.turmas = grouped;
    log.success('Disciplina completa montada', { codigo, turmas: grouped.length });
    return discipline;
}

/**
 * O que faz: limpa todas as tabelas do contexto de disciplinas.
 * Onde e usada: reset para scraping/reimportacao.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita massiva em DB.
 */
async function clearAllData() {
    log.start('Limpando todas as tabelas de disciplinas');

    await executeQuery('DELETE FROM class_professors', []);
    await executeQuery('DELETE FROM class_schedules', []);
    await executeQuery('DELETE FROM discipline_classes', []);
    await executeQuery('DELETE FROM disciplines', []);

    log.success('Limpeza completa de disciplinas concluida');
    return true;
}

module.exports = {
    upsertDiscipline,
    deleteDiscipline,
    getFullDiscipline,
    clearAllData
};
