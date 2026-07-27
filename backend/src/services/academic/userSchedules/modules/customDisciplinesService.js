/**
 * Responsabilidade: comandos e consultas de negocio das disciplinas customizadas.
 * Camada: service.
 * Entradas/Saidas: recebe scheduleId/customId/userId; retorna disciplinas customizadas.
 * Dependencias criticas: UserSchedulesModel, guarda this.getScheduleById e logger.
 */

const userSchedulesModel = require('../../../../models/academic/UserSchedulesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: adiciona uma disciplina customizada calculando a cor pela contagem atual.
     * Onde e usada: handler POST de disciplina customizada.
     * Dependencias chamadas: this.getScheduleById, this.getNextColor, model.getScheduleClasses/getCustomDisciplines/addCustomDiscipline.
     * Efeitos colaterais: escrita em DB.
     */
    async addCustomDiscipline(scheduleId, userId, disciplineData) {
        log.start('Adicionando disciplina customizada ao plano', { scheduleId });
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

            const color = disciplineData.color || this.getNextColor(totalCount);

            const result = await userSchedulesModel.addCustomDiscipline(scheduleId, {
                ...disciplineData,
                color
            });
            log.success('Disciplina customizada adicionada', { scheduleId });
            return result;
        } catch (error) {
            log.error('Erro ao adicionar disciplina customizada', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza uma disciplina customizada.
     * Onde e usada: handler PATCH de disciplina customizada.
     * Dependencias chamadas: model.updateCustomDiscipline.
     * Efeitos colaterais: escrita em DB.
     */
    async updateCustomDiscipline(customId, userId, updates) {
        log.start('Atualizando disciplina customizada', { customId });
        try {
            // TODO: Validar propriedade
            await userSchedulesModel.updateCustomDiscipline(customId, updates);
            log.success('Disciplina customizada atualizada', { customId });
            return true;
        } catch (error) {
            log.error('Erro ao atualizar disciplina customizada', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: exclui permanentemente (hard delete) uma disciplina customizada de todos os planos.
     * Onde e usada: handler DELETE definitivo de disciplina customizada.
     * Dependencias chamadas: model.getCustomDisciplineById, model.getScheduleById, model.deleteCustomDiscipline.
     * Efeitos colaterais: escrita em DB (remocao em multiplas tabelas).
     */
    async deleteCustomDiscipline(customId, userId) {
        log.start('Excluindo permanentemente disciplina customizada', { customId });
        try {
            // Busca a disciplina para validar que pertence ao usuário
            const custom = await userSchedulesModel.getCustomDisciplineById(customId);
            if (!custom) {
                throw new Error('Disciplina customizada não encontrada');
            }

            // Valida que pertence ao usuário via o plano de origem
            const schedule = await userSchedulesModel.getScheduleById(custom.schedule_id);
            if (!schedule || schedule.user_id !== userId) {
                throw new Error('Acesso negado');
            }

            await userSchedulesModel.deleteCustomDiscipline(customId);
            log.success('Disciplina customizada excluída permanentemente', { customId });
            return true;
        } catch (error) {
            log.error('Erro ao excluir disciplina customizada', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: lista todas as disciplinas customizadas do usuario.
     * Onde e usada: handler GET de disciplinas customizadas.
     * Dependencias chamadas: model.getCustomDisciplinesByUserId.
     * Efeitos colaterais: leitura em DB.
     */
    async getCustomDisciplines(userId) {
        log.start('Listando disciplinas customizadas do usuário', { userId });
        try {
            const disciplines = await userSchedulesModel.getCustomDisciplinesByUserId(userId);
            log.success('Disciplinas customizadas encontradas', { count: disciplines.length });
            return disciplines;
        } catch (error) {
            log.error('Erro ao listar disciplinas customizadas', { err: error.message });
            throw error;
        }
    }
};
