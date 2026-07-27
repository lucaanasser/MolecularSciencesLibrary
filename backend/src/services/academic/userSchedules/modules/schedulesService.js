/**
 * Responsabilidade: comandos e consultas de negocio dos planos/grades do usuario.
 * Camada: service.
 * Entradas/Saidas: recebe userId/scheduleId; retorna planos e paleta de cores.
 * Dependencias criticas: UserSchedulesModel e logger padronizado.
 */

const userSchedulesModel = require('../../../../models/academic/UserSchedulesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * Paleta de cores padrao para disciplinas.
 */
const DEFAULT_COLORS = [
    '#14b8a6', // teal-500
    '#f97316', // orange-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#22c55e', // green-500
    '#3b82f6', // blue-500
    '#eab308', // yellow-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#a855f7', // purple-500
];

module.exports = {
    /**
     * O que faz: retorna a proxima cor da paleta pelo numero de disciplinas.
     * Onde e usada: fluxos que adicionam turmas/disciplinas (varios modulos via this).
     * Dependencias chamadas: constante local DEFAULT_COLORS.
     * Efeitos colaterais: nenhum.
     */
    getNextColor(currentCount) {
        return DEFAULT_COLORS[currentCount % DEFAULT_COLORS.length];
    },

    /**
     * O que faz: lista todos os planos de um usuario.
     * Onde e usada: handler GET de planos do controller.
     * Dependencias chamadas: model.getSchedulesByUserId.
     * Efeitos colaterais: leitura em DB.
     */
    async getUserSchedules(userId) {
        log.start('Listando planos do usuário', { userId });
        try {
            const schedules = await userSchedulesModel.getSchedulesByUserId(userId);
            log.success('Planos encontrados', { count: schedules.length });
            return schedules;
        } catch (error) {
            log.error('Erro ao listar planos', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: obtem um plano por ID validando propriedade (guarda de ownership).
     * Onde e usada: reutilizada via this por ~10 metodos de todos os modulos.
     * Dependencias chamadas: model.getScheduleById.
     * Efeitos colaterais: leitura em DB.
     */
    async getScheduleById(scheduleId, userId) {
        log.start('Buscando plano', { scheduleId });
        try {
            const schedule = await userSchedulesModel.getScheduleById(scheduleId);
            if (!schedule) {
                log.warn('Plano não encontrado', { scheduleId });
                return null;
            }
            if (schedule.user_id !== userId) {
                log.warn('Usuário não é dono do plano', { scheduleId, userId });
                return null;
            }
            log.success('Plano encontrado', { scheduleId });
            return schedule;
        } catch (error) {
            log.error('Erro ao buscar plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: obtem plano completo (turmas e disciplinas customizadas) apos validar propriedade.
     * Onde e usada: handler GET de plano completo e metodos de conflitos/creditos via this.
     * Dependencias chamadas: this.getScheduleById, model.getFullSchedule.
     * Efeitos colaterais: leitura em DB.
     */
    async getFullSchedule(scheduleId, userId) {
        log.start('Buscando plano completo', { scheduleId });
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return null;
            }

            const fullSchedule = await userSchedulesModel.getFullSchedule(scheduleId);
            log.success('Plano completo carregado', { scheduleId });
            return fullSchedule;
        } catch (error) {
            log.error('Erro ao buscar plano completo', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: cria um novo plano para o usuario (nome sugerido se ausente).
     * Onde e usada: handler POST de planos.
     * Dependencias chamadas: model.getSchedulesByUserId, model.createSchedule.
     * Efeitos colaterais: escrita em DB.
     */
    async createSchedule(userId, name) {
        log.start('Criando plano', { userId });
        try {
            // Conta planos existentes para sugerir nome
            const existingSchedules = await userSchedulesModel.getSchedulesByUserId(userId);
            const scheduleName = name || `Plano ${existingSchedules.length + 1}`;

            const schedule = await userSchedulesModel.createSchedule(userId, scheduleName);
            log.success('Plano criado', { scheduleId: schedule.id });
            return schedule;
        } catch (error) {
            log.error('Erro ao criar plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza um plano (nome) apos validar propriedade.
     * Onde e usada: handler PUT/PATCH de planos.
     * Dependencias chamadas: this.getScheduleById, model.updateSchedule.
     * Efeitos colaterais: escrita em DB.
     */
    async updateSchedule(scheduleId, userId, updates) {
        log.start('Atualizando plano', { scheduleId });
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return null;
            }

            const updated = await userSchedulesModel.updateSchedule(scheduleId, updates);
            log.success('Plano atualizado', { scheduleId });
            return updated;
        } catch (error) {
            log.error('Erro ao atualizar plano', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: soft delete de um plano apos validar propriedade.
     * Onde e usada: handler DELETE de planos.
     * Dependencias chamadas: this.getScheduleById, model.deleteSchedule.
     * Efeitos colaterais: escrita em DB (soft delete).
     */
    async deleteSchedule(scheduleId, userId) {
        log.start('Deletando plano', { scheduleId });
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return false;
            }

            await userSchedulesModel.deleteSchedule(scheduleId);
            log.success('Plano deletado (soft delete)', { scheduleId });
            return true;
        } catch (error) {
            log.error('Erro ao deletar plano', { err: error.message });
            throw error;
        }
    }
};
