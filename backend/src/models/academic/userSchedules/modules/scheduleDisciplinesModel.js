/**
 * Responsabilidade: persistencia das disciplinas da lista/sidebar de um plano (user_schedule_disciplines).
 * Camada: model.
 * Entradas/Saidas: identificadores de plano/disciplina e opcoes de exibicao; retorna vinculos da lista.
 * Dependencias criticas: db (executeQuery/getQuery/allQuery), logger e modulos irmaos via prototype (this.<sibling>).
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista as disciplinas da lista do plano (regulares e customizadas via id negativo).
     * Onde e usada: getFullSchedule e consultas da sidebar do plano.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados (anexa customSchedules para customizadas).
     */
    async getScheduleDisciplines(scheduleId) {
        log.start('Buscando disciplinas do plano', { scheduleId });
        const query = `
            SELECT
                usd.id,
                usd.schedule_id,
                usd.discipline_id,
                usd.selected_class_id,
                usd.is_visible,
                usd.is_expanded,
                usd.color,
                CASE
                    WHEN usd.discipline_id < 0 THEN ucd.codigo
                    ELSE d.codigo
                END as discipline_codigo,
                CASE
                    WHEN usd.discipline_id < 0 THEN ucd.nome
                    ELSE d.nome
                END as discipline_nome,
                COALESCE(d.unidade, '') as unidade,
                COALESCE(d.campus, '') as campus,
                CASE
                    WHEN usd.discipline_id < 0 THEN ucd.creditos_aula
                    ELSE d.creditos_aula
                END as creditos_aula,
                CASE
                    WHEN usd.discipline_id < 0 THEN ucd.creditos_trabalho
                    ELSE d.creditos_trabalho
                END as creditos_trabalho
            FROM user_schedule_disciplines usd
            LEFT JOIN disciplines d ON usd.discipline_id = d.id AND usd.discipline_id > 0
            LEFT JOIN user_custom_disciplines ucd ON -usd.discipline_id = ucd.id AND usd.discipline_id < 0
            WHERE usd.schedule_id = ?
            ORDER BY usd.created_at ASC
        `;
        try {
            const disciplines = await allQuery(query, [scheduleId]);

            // Para disciplinas customizadas, buscar os horários
            for (const disc of disciplines) {
                if (disc.discipline_id < 0) {
                    const customId = -disc.discipline_id;
                    const schedulesQuery = `
                        SELECT dia, horario_inicio, horario_fim
                        FROM user_custom_discipline_schedules
                        WHERE custom_discipline_id = ?
                    `;
                    disc.customSchedules = await allQuery(schedulesQuery, [customId]);
                }
            }

            log.success('Disciplinas encontradas', { count: disciplines.length });
            return disciplines;
        } catch (error) {
            log.error('Erro ao buscar disciplinas do plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: adiciona uma disciplina a lista do plano (atualiza se ja existir).
     * Onde e usada: UserSchedulesService ao adicionar disciplina a sidebar.
     * Dependencias chamadas: getQuery, executeQuery e this.updateScheduleDiscipline.
     * Efeitos colaterais: insere em user_schedule_disciplines e toca updated_at do plano.
     */
    async addDisciplineToSchedule(scheduleId, disciplineId, { selectedClassId = null, isVisible = true, isExpanded = false, color = '#14b8a6' } = {}) {
        log.start('Adicionando disciplina ao plano', { disciplineId, scheduleId });

        // Verifica se já existe
        const existing = await getQuery(
            `SELECT id FROM user_schedule_disciplines WHERE schedule_id = ? AND discipline_id = ?`,
            [scheduleId, disciplineId]
        );

        if (existing) {
            log.warn('Disciplina ja existe no plano, atualizando', { disciplineId, scheduleId });
            return this.updateScheduleDiscipline(existing.id, { selectedClassId, isVisible, isExpanded, color });
        }

        const query = `
            INSERT INTO user_schedule_disciplines
            (schedule_id, discipline_id, selected_class_id, is_visible, is_expanded, color, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        try {
            const lastID = await executeQuery(query, [scheduleId, disciplineId, selectedClassId, isVisible ? 1 : 0, isExpanded ? 1 : 0, color]);
            log.success('Disciplina adicionada', { lastID });

            // Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );

            // Busca os dados completos da disciplina para retornar
            const disciplineData = await getQuery(
                `SELECT codigo, nome, creditos_aula, creditos_trabalho FROM disciplines WHERE id = ?`,
                [disciplineId]
            );

            return {
                id: lastID,
                schedule_id: scheduleId,
                discipline_id: disciplineId,
                discipline_codigo: disciplineData?.codigo,
                discipline_nome: disciplineData?.nome,
                creditos_aula: disciplineData?.creditos_aula,
                creditos_trabalho: disciplineData?.creditos_trabalho,
                selected_class_id: selectedClassId,
                is_visible: isVisible ? 1 : 0,
                is_expanded: isExpanded ? 1 : 0,
                color
            };
        } catch (error) {
            log.error('Erro ao adicionar disciplina ao plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza opcoes de uma disciplina da lista e retorna o registro atualizado.
     * Onde e usada: UserSchedulesService ao editar disciplina da sidebar; addDisciplineToSchedule.
     * Dependencias chamadas: executeQuery e this.getScheduleDisciplineById.
     * Efeitos colaterais: atualiza user_schedule_disciplines.
     */
    async updateScheduleDiscipline(id, { selectedClassId, isVisible, isExpanded, color }) {
        log.start('Atualizando disciplina no plano', { id });
        const updates = [];
        const params = [];

        if (selectedClassId !== undefined) { updates.push('selected_class_id = ?'); params.push(selectedClassId); }
        if (isVisible !== undefined) { updates.push('is_visible = ?'); params.push(isVisible ? 1 : 0); }
        if (isExpanded !== undefined) { updates.push('is_expanded = ?'); params.push(isExpanded ? 1 : 0); }
        if (color !== undefined) { updates.push('color = ?'); params.push(color); }

        if (updates.length === 0) {
            return null;
        }

        params.push(id);
        const query = `UPDATE user_schedule_disciplines SET ${updates.join(', ')} WHERE id = ?`;
        try {
            await executeQuery(query, params);
            log.success('Disciplina atualizada no plano', { id });
            return this.getScheduleDisciplineById(id);
        } catch (error) {
            log.error('Erro ao atualizar disciplina no plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca uma disciplina da lista do plano por ID.
     * Onde e usada: updateScheduleDiscipline e consultas internas.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getScheduleDisciplineById(id) {
        const query = `SELECT * FROM user_schedule_disciplines WHERE id = ?`;
        try {
            return await getQuery(query, [id]);
        } catch (error) {
            log.error('Erro ao buscar disciplina do plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove o vinculo de uma disciplina com o plano (mantem dados da customizada).
     * Onde e usada: UserSchedulesService ao remover disciplina da sidebar.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: apaga em user_schedule_disciplines e toca updated_at do plano.
     */
    async removeDisciplineFromSchedule(scheduleId, disciplineId) {
        log.start('Removendo disciplina do plano', { disciplineId, scheduleId });
        try {
            await executeQuery(
                `DELETE FROM user_schedule_disciplines WHERE schedule_id = ? AND discipline_id = ?`,
                [scheduleId, disciplineId]
            );
            log.success('Disciplina removida do plano', { disciplineId, scheduleId });

            // Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );

            return true;
        } catch (error) {
            log.error('Erro ao remover disciplina do plano', { err: error.message });
            throw error;
        }
    }
};
