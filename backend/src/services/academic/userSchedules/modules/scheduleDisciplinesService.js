/**
 * Responsabilidade: comandos e consultas das disciplinas na lista (sidebar) de um plano.
 * Camada: service.
 * Entradas/Saidas: recebe scheduleId/disciplineId/options; retorna estado da operacao e listas.
 * Dependencias criticas: UserSchedulesModel, guarda this.getScheduleById e logger.
 */

const userSchedulesModel = require('../../../../models/academic/userSchedules/UserSchedulesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: adiciona uma disciplina a lista do plano calculando a cor pela contagem atual.
     * Onde e usada: handler POST de disciplina na lista/sidebar.
     * Dependencias chamadas: this.getScheduleById, this.getNextColor, model.getScheduleDisciplines/addDisciplineToSchedule.
     * Efeitos colaterais: escrita em DB.
     */
    async addDisciplineToSchedule(scheduleId, userId, disciplineId, options = {}) {
        log.start('Adicionando disciplina à lista do plano', { disciplineId, scheduleId });
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            // Conta itens para determinar cor
            const existingDisciplines = await userSchedulesModel.getScheduleDisciplines(scheduleId);
            const color = options.color || this.getNextColor(existingDisciplines.length);

            const result = await userSchedulesModel.addDisciplineToSchedule(scheduleId, disciplineId, {
                ...options,
                color
            });
            log.success('Disciplina adicionada à lista', { disciplineId, scheduleId });
            return result;
        } catch (error) {
            log.error('Erro ao adicionar disciplina à lista', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza uma disciplina na lista do plano localizando o registro pelo discipline_id.
     * Onde e usada: handler PATCH de disciplina na lista/sidebar.
     * Dependencias chamadas: this.getScheduleById, model.getScheduleDisciplines, model.updateScheduleDiscipline.
     * Efeitos colaterais: escrita em DB.
     */
    async updateScheduleDiscipline(scheduleId, userId, disciplineId, updates) {
        log.start('Atualizando disciplina na lista do plano', { disciplineId, scheduleId });
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            // Busca o registro da disciplina no plano
            const disciplines = await userSchedulesModel.getScheduleDisciplines(scheduleId);
            const discipline = disciplines.find(d => d.discipline_id === disciplineId);

            if (!discipline) {
                throw new Error('Disciplina não encontrada no plano');
            }

            await userSchedulesModel.updateScheduleDiscipline(discipline.id, updates);
            log.success('Disciplina atualizada na lista', { disciplineId, scheduleId });
            return true;
        } catch (error) {
            log.error('Erro ao atualizar disciplina na lista', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove uma disciplina da lista do plano apos validar propriedade.
     * Onde e usada: handler DELETE de disciplina na lista/sidebar.
     * Dependencias chamadas: this.getScheduleById, model.removeDisciplineFromSchedule.
     * Efeitos colaterais: escrita em DB.
     */
    async removeDisciplineFromSchedule(scheduleId, userId, disciplineId) {
        log.start('Removendo disciplina da lista do plano', { disciplineId, scheduleId });
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            await userSchedulesModel.removeDisciplineFromSchedule(scheduleId, disciplineId);
            log.success('Disciplina removida da lista', { disciplineId, scheduleId });
            return true;
        } catch (error) {
            log.error('Erro ao remover disciplina da lista', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: lista as disciplinas na lista de um plano apos validar propriedade.
     * Onde e usada: handler GET de disciplinas da lista/sidebar.
     * Dependencias chamadas: this.getScheduleById, model.getScheduleDisciplines.
     * Efeitos colaterais: leitura em DB.
     */
    async getScheduleDisciplines(scheduleId, userId) {
        log.start('Listando disciplinas do plano', { scheduleId });
        try {
            // Valida propriedade do plano
            const schedule = await this.getScheduleById(scheduleId, userId);
            if (!schedule) {
                throw new Error('Plano não encontrado');
            }

            const disciplines = await userSchedulesModel.getScheduleDisciplines(scheduleId);
            log.success('Disciplinas encontradas', { count: disciplines.length });
            return disciplines;
        } catch (error) {
            log.error('Erro ao listar disciplinas', { err: error.message });
            throw error;
        }
    }
};
