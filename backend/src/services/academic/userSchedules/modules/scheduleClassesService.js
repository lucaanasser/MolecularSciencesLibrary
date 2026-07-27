/**
 * Responsabilidade: comandos de negocio das turmas dentro de um plano.
 * Camada: service.
 * Entradas/Saidas: recebe scheduleId/classId/updates; retorna estado da operacao.
 * Dependencias criticas: UserSchedulesModel, guarda this.getScheduleById e logger.
 */

const userSchedulesModel = require('../../../../models/academic/UserSchedulesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: adiciona uma turma ao plano calculando a cor pela contagem atual.
     * Onde e usada: handler POST de turma no plano.
     * Dependencias chamadas: this.getScheduleById, this.getNextColor, model.getScheduleClasses/getCustomDisciplines/addClassToSchedule.
     * Efeitos colaterais: escrita em DB.
     */
    async addClassToSchedule(scheduleId, userId, classId) {
        log.start('Adicionando turma ao plano', { classId, scheduleId });
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return null;
            }

            // Conta disciplinas para determinar cor
            const existingClasses = await userSchedulesModel.getScheduleClasses(scheduleId);
            const customDisciplines = await userSchedulesModel.getCustomDisciplines(scheduleId);
            const totalCount = existingClasses.length + customDisciplines.length;
            const color = this.getNextColor(totalCount);

            const result = await userSchedulesModel.addClassToSchedule(scheduleId, classId, color);
            log.success('Turma adicionada', { classId, scheduleId });
            return result;
        } catch (error) {
            log.error('Erro ao adicionar turma', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove uma turma do plano apos validar propriedade.
     * Onde e usada: handler DELETE de turma no plano.
     * Dependencias chamadas: this.getScheduleById, model.removeClassFromSchedule.
     * Efeitos colaterais: escrita em DB.
     */
    async removeClassFromSchedule(scheduleId, userId, classId) {
        log.start('Removendo turma do plano', { classId, scheduleId });
        try {
            // Valida propriedade
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                return false;
            }

            await userSchedulesModel.removeClassFromSchedule(scheduleId, classId);
            log.success('Turma removida', { classId, scheduleId });
            return true;
        } catch (error) {
            log.error('Erro ao remover turma', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza uma turma no plano (cor, visibilidade).
     * Onde e usada: handler PATCH de turma no plano.
     * Dependencias chamadas: model.updateScheduleClass.
     * Efeitos colaterais: escrita em DB.
     */
    async updateScheduleClass(scheduleClassId, userId, updates) {
        log.start('Atualizando turma', { scheduleClassId });
        try {
            // TODO: Validar propriedade através do schedule_id
            await userSchedulesModel.updateScheduleClass(scheduleClassId, updates);
            log.success('Turma atualizada', { scheduleClassId });
            return true;
        } catch (error) {
            log.error('Erro ao atualizar turma', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza a cor de uma turma especifica no plano apos validar propriedade.
     * Onde e usada: handler PATCH de cor de turma.
     * Dependencias chamadas: this.getScheduleById, model.updateScheduleClassByClassId.
     * Efeitos colaterais: escrita em DB.
     */
    async updateScheduleClassColor(scheduleId, userId, classId, color) {
        log.start('Atualizando cor da turma', { classId, scheduleId });
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            await userSchedulesModel.updateScheduleClassByClassId(scheduleId, classId, { color });
            log.success('Cor da turma atualizada', { classId, scheduleId });
            return true;
        } catch (error) {
            log.error('Erro ao atualizar cor da turma', { err: error.message });
            throw error;
        }
    }
};
