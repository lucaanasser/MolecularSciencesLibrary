/**
 * Responsabilidade: leitura das disciplinas customizadas (user_custom_disciplines) e seus horarios.
 * Camada: model.
 * Entradas/Saidas: identificadores de plano/usuario/disciplina; retorna disciplinas com horarios embutidos.
 * Dependencias criticas: db (getQuery/allQuery) e logger padronizado.
 */

const { getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista disciplinas customizadas de um plano com seus horarios ordenados por dia.
     * Onde e usada: getFullSchedule e consultas de disciplinas customizadas do plano.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getCustomDisciplines(scheduleId) {
        log.start('Buscando disciplinas customizadas do plano', { scheduleId });
        const query = `SELECT * FROM user_custom_disciplines WHERE schedule_id = ? ORDER BY nome ASC`;
        try {
            const disciplines = await allQuery(query, [scheduleId]);

            // Para cada disciplina, buscar seus horários
            for (const discipline of disciplines) {
                const schedulesQuery = `
                    SELECT dia, horario_inicio, horario_fim
                    FROM user_custom_discipline_schedules
                    WHERE custom_discipline_id = ?
                    ORDER BY
                        CASE dia
                            WHEN 'seg' THEN 1
                            WHEN 'ter' THEN 2
                            WHEN 'qua' THEN 3
                            WHEN 'qui' THEN 4
                            WHEN 'sex' THEN 5
                            WHEN 'sab' THEN 6
                            ELSE 7
                        END
                `;
                discipline.schedules = await allQuery(schedulesQuery, [discipline.id]);
            }

            log.success('Disciplinas customizadas encontradas', { count: disciplines.length });
            return disciplines;
        } catch (error) {
            log.error('Erro ao buscar disciplinas customizadas', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca uma disciplina customizada por ID.
     * Onde e usada: UserSchedulesService ao validar/consultar disciplina customizada.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getCustomDisciplineById(id) {
        log.start('Buscando disciplina customizada', { id });
        const query = `SELECT * FROM user_custom_disciplines WHERE id = ?`;
        try {
            const discipline = await getQuery(query, [id]);
            if (discipline) {
                log.success('Disciplina customizada encontrada', { id });
            } else {
                log.warn('Disciplina customizada nao encontrada', { id });
            }
            return discipline;
        } catch (error) {
            log.error('Erro ao buscar disciplina customizada', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: lista todas as disciplinas customizadas de um usuario (em todos os planos ativos).
     * Onde e usada: UserSchedulesService ao consultar disciplinas customizadas do usuario.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getCustomDisciplinesByUserId(userId) {
        log.start('Buscando disciplinas customizadas do usuario', { userId });
        const query = `
            SELECT ucd.*, us.name as schedule_name
            FROM user_custom_disciplines ucd
            JOIN user_schedules us ON ucd.schedule_id = us.id
            WHERE us.user_id = ? AND us.is_deleted = 0
            ORDER BY ucd.nome ASC
        `;
        try {
            const disciplines = await allQuery(query, [userId]);

            // Para cada disciplina, buscar seus horários
            for (const discipline of disciplines) {
                const schedulesQuery = `
                    SELECT dia, horario_inicio, horario_fim
                    FROM user_custom_discipline_schedules
                    WHERE custom_discipline_id = ?
                `;
                discipline.schedules = await allQuery(schedulesQuery, [discipline.id]);
            }

            log.success('Disciplinas customizadas encontradas', { count: disciplines.length });
            return disciplines;
        } catch (error) {
            log.error('Erro ao buscar disciplinas customizadas do usuario', { err: error.message });
            throw error;
        }
    }
};
