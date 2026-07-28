/**
 * Responsabilidade: persistencia das turmas vinculadas a um plano (user_schedule_classes) e seus horarios.
 * Camada: model.
 * Entradas/Saidas: identificadores de plano/turma e atributos visuais; retorna turmas e horarios.
 * Dependencias criticas: db (executeQuery/getQuery/allQuery) e logger padronizado.
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista as turmas de um plano com dados de disciplina/turma.
     * Onde e usada: getFullSchedule e consultas de turmas do plano.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getScheduleClasses(scheduleId) {
        log.start('Buscando turmas do plano', { scheduleId });
        const query = `
            SELECT
                usc.id,
                usc.schedule_id,
                usc.class_id,
                usc.color,
                usc.is_visible,
                dc.codigo_turma,
                dc.tipo,
                dc.inicio,
                dc.fim,
                dc.observacoes,
                d.id as discipline_id,
                d.codigo as discipline_codigo,
                d.nome as discipline_nome,
                d.unidade,
                d.campus,
                d.creditos_aula,
                d.creditos_trabalho
            FROM user_schedule_classes usc
            JOIN discipline_classes dc ON usc.class_id = dc.id
            JOIN disciplines d ON dc.discipline_id = d.id
            WHERE usc.schedule_id = ?
            ORDER BY d.codigo ASC
        `;
        try {
            const classes = await allQuery(query, [scheduleId]);
            log.success('Turmas encontradas', { count: classes.length });
            return classes;
        } catch (error) {
            log.error('Erro ao buscar turmas', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca os horarios de uma turma com o professor associado.
     * Onde e usada: getFullSchedule ao carregar horarios de cada turma.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getClassSchedules(classId) {
        log.start('Buscando horarios da turma', { classId });
        const query = `
            SELECT cs.*, cp.nome as professor_nome
            FROM class_schedules cs
            LEFT JOIN class_professors cp ON cs.id = cp.schedule_id
            WHERE cs.class_id = ?
        `;
        try {
            const schedules = await allQuery(query, [classId]);
            log.success('Horarios encontrados', { count: schedules.length });
            return schedules;
        } catch (error) {
            log.error('Erro ao buscar horarios', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: adiciona uma turma ao plano (idempotente por schedule_id+class_id).
     * Onde e usada: UserSchedulesService ao adicionar turma.
     * Dependencias chamadas: getQuery e executeQuery.
     * Efeitos colaterais: insere em user_schedule_classes e toca updated_at do plano.
     */
    async addClassToSchedule(scheduleId, classId, color = '#14b8a6') {
        log.start('Adicionando turma ao plano', { classId, scheduleId });

        // Verifica se já existe
        const existing = await getQuery(
            `SELECT id FROM user_schedule_classes WHERE schedule_id = ? AND class_id = ?`,
            [scheduleId, classId]
        );

        if (existing) {
            log.warn('Turma ja existe no plano', { classId, scheduleId });
            return existing;
        }

        const query = `
            INSERT INTO user_schedule_classes (schedule_id, class_id, color, is_visible, created_at)
            VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
        `;
        try {
            const result = await executeQuery(query, [scheduleId, classId, color]);
            log.success('Turma adicionada', { id: result.lastID });

            // Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );

            return { id: result.lastID, schedule_id: scheduleId, class_id: classId, color, is_visible: 1 };
        } catch (error) {
            log.error('Erro ao adicionar turma', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove uma turma do plano.
     * Onde e usada: UserSchedulesService ao remover turma.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: apaga em user_schedule_classes e toca updated_at do plano.
     */
    async removeClassFromSchedule(scheduleId, classId) {
        log.start('Removendo turma do plano', { classId, scheduleId });
        const query = `DELETE FROM user_schedule_classes WHERE schedule_id = ? AND class_id = ?`;
        try {
            await executeQuery(query, [scheduleId, classId]);
            log.success('Turma removida', { classId, scheduleId });

            // Atualiza updated_at do plano
            await executeQuery(
                `UPDATE user_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );

            return true;
        } catch (error) {
            log.error('Erro ao remover turma', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza cor/visibilidade de uma turma do plano por schedule_id + class_id.
     * Onde e usada: UserSchedulesService ao editar turma via class_id.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza user_schedule_classes.
     */
    async updateScheduleClassByClassId(scheduleId, classId, { color, is_visible }) {
        log.start('Atualizando turma no plano', { classId, scheduleId });
        const updates = [];
        const params = [];

        if (color !== undefined) {
            updates.push('color = ?');
            params.push(color);
        }
        if (is_visible !== undefined) {
            updates.push('is_visible = ?');
            params.push(is_visible ? 1 : 0);
        }
        params.push(scheduleId, classId);

        if (updates.length === 0) {
            return null;
        }

        const query = `UPDATE user_schedule_classes SET ${updates.join(', ')} WHERE schedule_id = ? AND class_id = ?`;
        try {
            await executeQuery(query, params);
            log.success('Turma atualizada', { classId, scheduleId });
            return true;
        } catch (error) {
            log.error('Erro ao atualizar turma', { err: error.message });
            throw error;
        }
    }
};
