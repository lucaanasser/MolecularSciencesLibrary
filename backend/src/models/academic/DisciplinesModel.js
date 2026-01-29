// Importa funções utilitárias para executar queries no banco de dados
const { executeQuery, getQuery, allQuery } = require('../../database/db');

/**
 * Modelo para operações no banco de dados relacionadas a disciplinas da USP.
 * Responsável apenas pela persistência e recuperação de dados.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class DisciplinesModel {
    // ===================== DISCIPLINES =====================

    /**
     * Busca disciplinas com filtros opcionais
     */
    async getDisciplines({ campus, unidade, searchTerm, limit, offset } = {}) {
        console.log(`🔵 [DisciplinesModel] Buscando disciplinas: campus=${campus}, unidade=${unidade}, searchTerm=${searchTerm}`);
        let query = `SELECT * FROM disciplines`;
        const params = [];
        const conditions = [];

        if (campus) {
            conditions.push(`campus = ?`);
            params.push(campus);
        }
        if (unidade) {
            conditions.push(`unidade = ?`);
            params.push(unidade);
        }
        if (searchTerm) {
            conditions.push(`(codigo LIKE ? COLLATE NOCASE OR nome LIKE ? COLLATE NOCASE)`);
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY codigo ASC`;

        if (limit) {
            query += ` LIMIT ?`;
            params.push(limit);
            if (offset) {
                query += ` OFFSET ?`;
                params.push(offset);
            }
        }

        try {
            const disciplines = await allQuery(query, params);
            console.log(`🟢 [DisciplinesModel] Disciplinas encontradas: ${disciplines.length}`);
            return disciplines;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar disciplinas:", error.message);
            throw error;
        }
    }

    /**
     * Busca disciplina por código
     */
    async getDisciplineByCodigo(codigo) {
        console.log(`🔵 [DisciplinesModel] Buscando disciplina por código: ${codigo}`);
        const query = `SELECT * FROM disciplines WHERE codigo = ?`;
        try {
            const discipline = await getQuery(query, [codigo]);
            if (discipline) {
                console.log(`🟢 [DisciplinesModel] Disciplina encontrada: ${codigo}`);
            } else {
                console.log(`🟡 [DisciplinesModel] Disciplina não encontrada: ${codigo}`);
            }
            return discipline;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar disciplina:", error.message);
            throw error;
        }
    }

    /**
     * Busca disciplina por ID
     */
    async getDisciplineById(id) {
        console.log(`🔵 [DisciplinesModel] Buscando disciplina por ID: ${id}`);
        const query = `SELECT * FROM disciplines WHERE id = ?`;
        try {
            const discipline = await getQuery(query, [id]);
            if (discipline) {
                console.log(`🟢 [DisciplinesModel] Disciplina encontrada: ID ${id}`);
            } else {
                console.log(`🟡 [DisciplinesModel] Disciplina não encontrada: ID ${id}`);
            }
            return discipline;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar disciplina:", error.message);
            throw error;
        }
    }

    /**
     * Insere ou atualiza uma disciplina (upsert) - estrutura simplificada para grade interativa
     */
    async upsertDiscipline(data) {
        console.log(`🔵 [DisciplinesModel] Upsert disciplina: ${data.codigo}`);
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

        try {
            const result = await executeQuery(query, params);
            console.log(`🟢 [DisciplinesModel] Disciplina salva: ${data.codigo}`);
            return result;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao salvar disciplina:", error.message);
            throw error;
        }
    }

    /**
     * Deleta uma disciplina e dados relacionados (cascade)
     */
    async deleteDiscipline(id) {
        console.log(`🔵 [DisciplinesModel] Deletando disciplina: ID ${id}`);
        const query = `DELETE FROM disciplines WHERE id = ?`;
        try {
            const result = await executeQuery(query, [id]);
            console.log(`🟢 [DisciplinesModel] Disciplina deletada: ID ${id}`);
            return result;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao deletar disciplina:", error.message);
            throw error;
        }
    }

    /**
     * Conta total de disciplinas
     */
    async countDisciplines(filters = {}) {
        console.log(`🔵 [DisciplinesModel] Contando disciplinas`);
        let query = `SELECT COUNT(*) as total FROM disciplines`;
        const params = [];
        const conditions = [];

        if (filters.campus) {
            conditions.push(`campus = ?`);
            params.push(filters.campus);
        }
        if (filters.unidade) {
            conditions.push(`unidade = ?`);
            params.push(filters.unidade);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        try {
            const result = await getQuery(query, params);
            console.log(`🟢 [DisciplinesModel] Total de disciplinas: ${result.total}`);
            return result.total;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao contar disciplinas:", error.message);
            throw error;
        }
    }

    /**
     * Lista todos os campi disponíveis
     */
    async getCampi() {
        console.log(`🔵 [DisciplinesModel] Buscando campi`);
        const query = `SELECT DISTINCT campus FROM disciplines WHERE campus IS NOT NULL ORDER BY campus`;
        try {
            const campi = await allQuery(query, []);
            console.log(`🟢 [DisciplinesModel] Campi encontrados: ${campi.length}`);
            return campi.map(c => c.campus);
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar campi:", error.message);
            throw error;
        }
    }

    /**
     * Lista todas as unidades disponíveis
     */
    async getUnidades(campus = null) {
        console.log(`🔵 [DisciplinesModel] Buscando unidades: campus=${campus}`);
        let query = `SELECT DISTINCT unidade FROM disciplines WHERE unidade IS NOT NULL`;
        const params = [];
        
        if (campus) {
            query += ` AND campus = ?`;
            params.push(campus);
        }
        
        query += ` ORDER BY unidade`;

        try {
            const unidades = await allQuery(query, params);
            console.log(`🟢 [DisciplinesModel] Unidades encontradas: ${unidades.length}`);
            return unidades.map(u => u.unidade);
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar unidades:", error.message);
            throw error;
        }
    }

    // ===================== DISCIPLINE_CLASSES =====================

    /**
     * Busca turmas de uma disciplina
     */
    async getClassesByDisciplineId(disciplineId) {
        console.log(`🔵 [DisciplinesModel] Buscando turmas da disciplina: ${disciplineId}`);
        const query = `SELECT * FROM discipline_classes WHERE discipline_id = ? ORDER BY codigo_turma`;
        try {
            const classes = await allQuery(query, [disciplineId]);
            console.log(`🟢 [DisciplinesModel] Turmas encontradas: ${classes.length}`);
            return classes;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar turmas:", error.message);
            throw error;
        }
    }

    /**
     * Insere uma turma
     */
    async insertClass(data) {
        console.log(`🔵 [DisciplinesModel] Inserindo turma: ${data.codigo_turma}`);
        const query = `
            INSERT INTO discipline_classes (
                discipline_id, codigo_turma, codigo_turma_teorica,
                tipo, inicio, fim, observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.discipline_id,
            data.codigo_turma,
            data.codigo_turma_teorica || null,
            data.tipo || null,
            data.inicio || null,
            data.fim || null,
            data.observacoes || null
        ];

        try {
            const lastID = await executeQuery(query, params);
            console.log(`🟢 [DisciplinesModel] Turma inserida: ${data.codigo_turma}, ID: ${lastID}`);
            return { id: lastID, ...data };
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao inserir turma:", error.message);
            throw error;
        }
    }

    /**
     * Deleta todas as turmas de uma disciplina
     */
    async deleteClassesByDisciplineId(disciplineId) {
        console.log(`🔵 [DisciplinesModel] Deletando turmas da disciplina: ${disciplineId}`);
        const query = `DELETE FROM discipline_classes WHERE discipline_id = ?`;
        try {
            const result = await executeQuery(query, [disciplineId]);
            console.log(`🟢 [DisciplinesModel] Turmas deletadas da disciplina: ${disciplineId}`);
            return result;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao deletar turmas:", error.message);
            throw error;
        }
    }

    // ===================== CLASS_SCHEDULES =====================

    /**
     * Busca horários de uma turma
     */
    async getSchedulesByClassId(classId) {
        console.log(`🔵 [DisciplinesModel] Buscando horários da turma: ${classId}`);
        const query = `SELECT * FROM class_schedules WHERE class_id = ? ORDER BY dia, horario_inicio`;
        try {
            const schedules = await allQuery(query, [classId]);
            console.log(`🟢 [DisciplinesModel] Horários encontrados: ${schedules.length}`);
            return schedules;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar horários:", error.message);
            throw error;
        }
    }

    /**
     * Insere um horário
     */
    async insertSchedule(data) {
        console.log(`🔵 [DisciplinesModel] Inserindo horário: ${data.dia} ${data.horario_inicio}-${data.horario_fim}`);
        const query = `
            INSERT INTO class_schedules (class_id, dia, horario_inicio, horario_fim)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            data.class_id,
            data.dia,
            data.horario_inicio,
            data.horario_fim
        ];

        try {
            const lastID = await executeQuery(query, params);
            console.log(`🟢 [DisciplinesModel] Horário inserido: ID ${lastID}`);
            return { id: lastID, ...data };
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao inserir horário:", error.message);
            throw error;
        }
    }

    /**
     * Deleta horários de uma turma
     */
    async deleteSchedulesByClassId(classId) {
        console.log(`🔵 [DisciplinesModel] Deletando horários da turma: ${classId}`);
        const query = `DELETE FROM class_schedules WHERE class_id = ?`;
        try {
            const result = await executeQuery(query, [classId]);
            console.log(`🟢 [DisciplinesModel] Horários deletados da turma: ${classId}`);
            return result;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao deletar horários:", error.message);
            throw error;
        }
    }

    // ===================== CLASS_PROFESSORS =====================

    /**
     * Busca professores de uma turma
     */
    async getProfessorsByClassId(classId) {
        console.log(`🔵 [DisciplinesModel] Buscando professores da turma: ${classId}`);
        const query = `SELECT * FROM class_professors WHERE class_id = ? ORDER BY nome`;
        try {
            const professors = await allQuery(query, [classId]);
            console.log(`🟢 [DisciplinesModel] Professores encontrados: ${professors.length}`);
            return professors;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar professores:", error.message);
            throw error;
        }
    }

    /**
     * Insere um professor
     */
    async insertProfessor(data) {
        console.log(`🔵 [DisciplinesModel] Inserindo professor: ${data.nome}`);
        const query = `
            INSERT INTO class_professors (class_id, schedule_id, nome)
            VALUES (?, ?, ?)
        `;
        const params = [
            data.class_id,
            data.schedule_id || null,
            data.nome
        ];

        try {
            const lastID = await executeQuery(query, params);
            console.log(`🟢 [DisciplinesModel] Professor inserido: ${data.nome}, ID: ${lastID}`);
            return { id: lastID, ...data };
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao inserir professor:", error.message);
            throw error;
        }
    }

    /**
     * Deleta professores de uma turma
     */
    async deleteProfessorsByClassId(classId) {
        console.log(`🔵 [DisciplinesModel] Deletando professores da turma: ${classId}`);
        const query = `DELETE FROM class_professors WHERE class_id = ?`;
        try {
            const result = await executeQuery(query, [classId]);
            console.log(`🟢 [DisciplinesModel] Professores deletados da turma: ${classId}`);
            return result;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao deletar professores:", error.message);
            throw error;
        }
    }

    // ===================== FULL DATA =====================

    /**
     * Busca disciplina completa com turmas, horários e professores
     * Agrupa turmas teóricas com suas práticas vinculadas
     */
    async getFullDiscipline(codigo) {
        console.log(`🔵 [DisciplinesModel] Buscando disciplina completa: ${codigo}`);
        try {
            const discipline = await this.getDisciplineByCodigo(codigo);
            if (!discipline) {
                return null;
            }

            const allClasses = await this.getClassesByDisciplineId(discipline.id);
            
            // Carregar horários e professores para todas as turmas
            for (const cls of allClasses) {
                cls.schedules = await this.getSchedulesByClassId(cls.id);
                cls.professors = await this.getProfessorsByClassId(cls.id);
            }

            // Separar turmas teóricas e práticas
            const teoricas = allClasses.filter(cls => !cls.codigo_turma_teorica);
            const praticas = allClasses.filter(cls => cls.codigo_turma_teorica);

            // Agrupar teóricas com suas práticas
            const turmasAgrupadas = teoricas.map(teorica => {
                // Encontrar práticas vinculadas a esta teórica
                const praticasVinculadas = praticas.filter(
                    pratica => pratica.codigo_turma_teorica === teorica.codigo_turma
                );

                // Se há práticas vinculadas, mesclar horários e professores
                if (praticasVinculadas.length > 0) {
                    const allSchedules = [...teorica.schedules];
                    const allProfessors = [...teorica.professors];

                    praticasVinculadas.forEach(pratica => {
                        allSchedules.push(...pratica.schedules);
                        allProfessors.push(...pratica.professors);
                    });

                    return {
                        ...teorica,
                        schedules: allSchedules,
                        professors: allProfessors,
                        // Marcar que esta turma tem prática vinculada
                        has_pratica: true,
                        praticas_vinculadas: praticasVinculadas.map(p => p.codigo_turma)
                    };
                }

                return teorica;
            });

            discipline.turmas = turmasAgrupadas;
            console.log(`🟢 [DisciplinesModel] Disciplina completa carregada: ${codigo} (${turmasAgrupadas.length} turmas agrupadas)`);
            return discipline;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao buscar disciplina completa:", error.message);
            throw error;
        }
    }

    /**
     * Limpa todos os dados de disciplinas (para re-scraping)
     */
    async clearAllData() {
        console.log(`🔵 [DisciplinesModel] Limpando todos os dados de disciplinas`);
        try {
            await executeQuery(`DELETE FROM class_professors`, []);
            await executeQuery(`DELETE FROM class_schedules`, []);
            await executeQuery(`DELETE FROM discipline_classes`, []);
            await executeQuery(`DELETE FROM disciplines`, []);
            console.log(`🟢 [DisciplinesModel] Todos os dados de disciplinas foram limpos`);
            return true;
        } catch (error) {
            console.error("🔴 [DisciplinesModel] Erro ao limpar dados:", error.message);
            throw error;
        }
    }
}

module.exports = new DisciplinesModel();
