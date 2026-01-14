// DisciplinesService contém toda a lógica de negócio relacionada a disciplinas da USP
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const disciplinesModel = require('../models/DisciplinesModel');

/**
 * Mapeamento de códigos de unidade para campus
 * Atualizado manualmente dada a baixa frequência de criação de novas unidades
 */
const campusPorUnidade = {
    // São Paulo
    86: "São Paulo", 27: "São Paulo", 39: "São Paulo", 7: "São Paulo",
    22: "São Paulo", 3: "São Paulo", 16: "São Paulo", 9: "São Paulo",
    2: "São Paulo", 12: "São Paulo", 48: "São Paulo", 8: "São Paulo",
    5: "São Paulo", 10: "São Paulo", 67: "São Paulo", 23: "São Paulo",
    6: "São Paulo", 66: "São Paulo", 14: "São Paulo", 26: "São Paulo",
    93: "São Paulo", 41: "São Paulo", 92: "São Paulo", 42: "São Paulo",
    4: "São Paulo", 37: "São Paulo", 43: "São Paulo", 44: "São Paulo",
    45: "São Paulo", 83: "São Paulo", 47: "São Paulo", 46: "São Paulo",
    87: "São Paulo", 21: "São Paulo", 31: "São Paulo", 85: "São Paulo",
    71: "São Paulo", 32: "São Paulo", 38: "São Paulo", 33: "São Paulo",
    // Ribeirão Preto
    98: "Ribeirão Preto", 94: "Ribeirão Preto", 60: "Ribeirão Preto",
    89: "Ribeirão Preto", 81: "Ribeirão Preto", 59: "Ribeirão Preto",
    96: "Ribeirão Preto", 91: "Ribeirão Preto", 17: "Ribeirão Preto",
    58: "Ribeirão Preto", 95: "Ribeirão Preto",
    // Lorena
    88: "Lorena",
    // São Carlos
    18: "São Carlos", 97: "São Carlos", 99: "São Carlos", 55: "São Carlos",
    76: "São Carlos", 75: "São Carlos", 90: "São Carlos",
    // Piracicaba
    11: "Piracicaba", 64: "Piracicaba",
    // Bauru
    25: "Bauru", 61: "Bauru",
    // Pirassununga
    74: "Pirassununga",
    // São Sebastião
    30: "São Sebastião"
};

class DisciplinesService {
    /**
     * Obtém o campus a partir do código da unidade
     */
    getCampusByCodigoUnidade(codigoUnidade) {
        return campusPorUnidade[parseInt(codigoUnidade)] || "Outro";
    }

    /**
     * Busca disciplinas com filtros e paginação
     */
    async getDisciplines(filters = {}) {
        console.log(`🔵 [DisciplinesService] Buscando disciplinas com filtros:`, filters);
        try {
            const disciplines = await disciplinesModel.getDisciplines(filters);
            console.log(`🟢 [DisciplinesService] ${disciplines.length} disciplinas encontradas`);
            return disciplines;
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao buscar disciplinas:", error.message);
            throw error;
        }
    }

    /**
     * Busca disciplina por código
     */
    async getDisciplineByCodigo(codigo) {
        console.log(`🔵 [DisciplinesService] Buscando disciplina: ${codigo}`);
        try {
            const discipline = await disciplinesModel.getDisciplineByCodigo(codigo);
            return discipline;
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao buscar disciplina:", error.message);
            throw error;
        }
    }

    /**
     * Busca disciplina completa com turmas, horários e professores
     */
    async getFullDiscipline(codigo) {
        console.log(`🔵 [DisciplinesService] Buscando disciplina completa: ${codigo}`);
        try {
            const discipline = await disciplinesModel.getFullDiscipline(codigo);
            return discipline;
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao buscar disciplina completa:", error.message);
            throw error;
        }
    }

    /**
     * Conta total de disciplinas com filtros opcionais
     */
    async countDisciplines(filters = {}) {
        console.log(`🔵 [DisciplinesService] Contando disciplinas`);
        try {
            const total = await disciplinesModel.countDisciplines(filters);
            return total;
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao contar disciplinas:", error.message);
            throw error;
        }
    }

    /**
     * Lista todos os campi disponíveis
     */
    async getCampi() {
        console.log(`🔵 [DisciplinesService] Buscando campi`);
        try {
            return await disciplinesModel.getCampi();
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao buscar campi:", error.message);
            throw error;
        }
    }

    /**
     * Lista todas as unidades disponíveis
     */
    async getUnidades(campus = null) {
        console.log(`🔵 [DisciplinesService] Buscando unidades`);
        try {
            return await disciplinesModel.getUnidades(campus);
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao buscar unidades:", error.message);
            throw error;
        }
    }

    /**
     * Salva uma disciplina completa (com turmas, horários e professores)
     * Usado pelo script de scraping
     */
    async saveDiscipline(data) {
        console.log(`🔵 [DisciplinesService] Salvando disciplina: ${data.codigo}`);
        try {
            // 1. Salvar/atualizar disciplina principal
            await disciplinesModel.upsertDiscipline(data);
            
            // 2. Obter ID da disciplina
            const discipline = await disciplinesModel.getDisciplineByCodigo(data.codigo);
            if (!discipline) {
                throw new Error(`Disciplina ${data.codigo} não encontrada após upsert`);
            }

            // 3. Deletar turmas antigas (cascade deleta horários e professores)
            await disciplinesModel.deleteClassesByDisciplineId(discipline.id);

            // 4. Inserir novas turmas
            if (data.turmas && Array.isArray(data.turmas)) {
                for (const turma of data.turmas) {
                    const insertedClass = await disciplinesModel.insertClass({
                        discipline_id: discipline.id,
                        codigo_turma: turma.codigo,
                        codigo_turma_teorica: turma.codigo_teorica,
                        tipo: turma.tipo,
                        inicio: turma.inicio,
                        fim: turma.fim,
                        observacoes: turma.observacoes
                    });

                    // 5. Inserir horários
                    if (turma.horario && Array.isArray(turma.horario)) {
                        for (const horario of turma.horario) {
                            const insertedSchedule = await disciplinesModel.insertSchedule({
                                class_id: insertedClass.id,
                                dia: horario.dia,
                                horario_inicio: horario.inicio,
                                horario_fim: horario.fim
                            });

                            // 6. Inserir professores associados ao horário
                            if (horario.professores && Array.isArray(horario.professores)) {
                                for (const professor of horario.professores) {
                                    if (professor && professor.trim()) {
                                        await disciplinesModel.insertProfessor({
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

            console.log(`🟢 [DisciplinesService] Disciplina salva com sucesso: ${data.codigo}`);
            return discipline;
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao salvar disciplina:", error.message);
            throw error;
        }
    }

    /**
     * Deleta uma disciplina por ID
     */
    async deleteDiscipline(id) {
        console.log(`🔵 [DisciplinesService] Deletando disciplina: ID ${id}`);
        try {
            await disciplinesModel.deleteDiscipline(id);
            console.log(`🟢 [DisciplinesService] Disciplina deletada: ID ${id}`);
            return true;
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao deletar disciplina:", error.message);
            throw error;
        }
    }

    /**
     * Limpa todos os dados de disciplinas (para re-scraping)
     */
    async clearAllData() {
        console.log(`🔵 [DisciplinesService] Limpando todos os dados`);
        try {
            await disciplinesModel.clearAllData();
            console.log(`🟢 [DisciplinesService] Dados limpos com sucesso`);
            return true;
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao limpar dados:", error.message);
            throw error;
        }
    }

    /**
     * Busca disciplinas por termo (código ou nome) - para autocomplete
     */
    async searchDisciplines(term, limit = 10) {
        console.log(`🔵 [DisciplinesService] Buscando por termo: ${term}`);
        try {
            const disciplines = await disciplinesModel.getDisciplines({
                searchTerm: term,
                limit: limit
            });
            return disciplines.map(d => ({
                codigo: d.codigo,
                nome: d.nome,
                unidade: d.unidade,
                campus: d.campus
            }));
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao buscar:", error.message);
            throw error;
        }
    }

    /**
     * Cria uma disciplina manualmente (sem turmas)
     */
    async createManualDiscipline(data) {
        console.log(`🔵 [DisciplinesService] Criando disciplina manualmente: ${data.codigo}`);
        console.log(`🔵 [DisciplinesService] is_postgrad recebido:`, data.is_postgrad);
        try {
            await disciplinesModel.upsertDiscipline({
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
            
            // Retorna a disciplina criada
            const created = await disciplinesModel.getDisciplineByCodigo(data.codigo);
            console.log(`🟢 [DisciplinesService] Disciplina criada: ${data.codigo}`);
            return created;
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao criar disciplina:", error.message);
            throw error;
        }
    }

    /**
     * Estatísticas das disciplinas
     */
    async getStats() {
        console.log(`🔵 [DisciplinesService] Obtendo estatísticas`);
        try {
            const total = await disciplinesModel.countDisciplines();
            const campi = await disciplinesModel.getCampi();
            const unidades = await disciplinesModel.getUnidades();
            
            return {
                total_disciplinas: total,
                total_campi: campi.length,
                total_unidades: unidades.length,
                campi: campi,
                unidades_count: unidades.length
            };
        } catch (error) {
            console.error("🔴 [DisciplinesService] Erro ao obter estatísticas:", error.message);
            throw error;
        }
    }
}

module.exports = new DisciplinesService();
