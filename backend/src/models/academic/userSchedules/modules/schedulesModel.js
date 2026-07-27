/**
 * Responsabilidade: persistencia dos planos/grades do usuario (user_schedules) e agregador do plano completo.
 * Camada: model.
 * Entradas/Saidas: identificadores de usuario/plano; retorna linhas de user_schedules e o plano agregado.
 * Dependencias criticas: db (executeQuery/getQuery/allQuery), logger e modulos irmaos via prototype (this.<sibling>).
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista todos os planos nao deletados de um usuario.
     * Onde e usada: UserSchedulesService ao listar planos do usuario.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getSchedulesByUserId(userId) {
        log.start('Buscando planos do usuario', { userId });
        const query = `
            SELECT * FROM user_schedules
            WHERE user_id = ? AND is_deleted = 0
            ORDER BY created_at ASC
        `;
        try {
            const schedules = await allQuery(query, [userId]);
            log.success('Planos encontrados', { count: schedules.length });
            return schedules;
        } catch (error) {
            log.error('Erro ao buscar planos', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca um plano por ID (nao deletado).
     * Onde e usada: consultas de plano e agregacao em getFullSchedule/updateSchedule.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getScheduleById(scheduleId) {
        log.start('Buscando plano por ID', { scheduleId });
        const query = `SELECT * FROM user_schedules WHERE id = ? AND is_deleted = 0`;
        try {
            const schedule = await getQuery(query, [scheduleId]);
            if (schedule) {
                log.success('Plano encontrado', { scheduleId });
            } else {
                log.warn('Plano nao encontrado', { scheduleId });
            }
            return schedule;
        } catch (error) {
            log.error('Erro ao buscar plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: cria um novo plano ativo para o usuario.
     * Onde e usada: UserSchedulesService ao criar plano.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere linha em user_schedules.
     */
    async createSchedule(userId, name = 'Novo Plano') {
        log.start('Criando plano para usuario', { userId, name });
        const query = `
            INSERT INTO user_schedules (user_id, name, is_active, is_deleted, created_at, updated_at)
            VALUES (?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        try {
            const result = await executeQuery(query, [userId, name]);
            log.success('Plano criado', { id: result.lastID });
            return { id: result.lastID, user_id: userId, name, is_active: 1, is_deleted: 0 };
        } catch (error) {
            log.error('Erro ao criar plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza campos do plano (name, is_active) e retorna o plano atualizado.
     * Onde e usada: UserSchedulesService ao renomear/ativar plano.
     * Dependencias chamadas: executeQuery e this.getScheduleById.
     * Efeitos colaterais: atualiza linha em user_schedules.
     */
    async updateSchedule(scheduleId, { name, is_active }) {
        log.start('Atualizando plano', { scheduleId });
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active ? 1 : 0);
        }
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(scheduleId);

        const query = `UPDATE user_schedules SET ${updates.join(', ')} WHERE id = ?`;
        try {
            await executeQuery(query, params);
            log.success('Plano atualizado', { scheduleId });
            return this.getScheduleById(scheduleId);
        } catch (error) {
            log.error('Erro ao atualizar plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: soft delete do plano (is_deleted = 1) e remove as disciplinas da lista.
     * Onde e usada: UserSchedulesService ao excluir plano.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: apaga user_schedule_disciplines e marca user_schedules como deletado.
     */
    async deleteSchedule(scheduleId) {
        log.start('Soft delete do plano', { scheduleId });
        try {
            // Apaga todas as disciplinas da lista do plano
            await executeQuery(
                `DELETE FROM user_schedule_disciplines WHERE schedule_id = ?`,
                [scheduleId]
            );
            log.success('Disciplinas do plano apagadas', { scheduleId });

            // Marca o plano como deletado (soft delete)
            await executeQuery(
                `UPDATE user_schedules SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [scheduleId]
            );
            log.success('Plano marcado como deletado', { scheduleId });
            return true;
        } catch (error) {
            log.error('Erro ao deletar plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: monta o plano completo (turmas + horarios, disciplinas customizadas e da lista).
     * Onde e usada: UserSchedulesService ao carregar a grade completa.
     * Dependencias chamadas (via prototype): this.getScheduleById, this.getScheduleClasses,
     *   this.getClassSchedules, this.getCustomDisciplines, this.getScheduleDisciplines.
     * Efeitos colaterais: nenhum; agregacao de leituras.
     */
    async getFullSchedule(scheduleId) {
        log.start('Buscando plano completo', { scheduleId });
        try {
            const schedule = await this.getScheduleById(scheduleId);
            if (!schedule) {
                return null;
            }

            const classes = await this.getScheduleClasses(scheduleId);

            // Busca horários para cada turma
            for (const cls of classes) {
                cls.schedules = await this.getClassSchedules(cls.class_id);
            }

            const customDisciplines = await this.getCustomDisciplines(scheduleId);

            // Busca disciplinas da lista (sidebar)
            const scheduleDisciplines = await this.getScheduleDisciplines(scheduleId);

            log.success('Plano completo carregado', { scheduleId });
            return {
                ...schedule,
                classes,
                customDisciplines,
                scheduleDisciplines
            };
        } catch (error) {
            log.error('Erro ao buscar plano completo', { err: error.message });
            throw error;
        }
    }
};
