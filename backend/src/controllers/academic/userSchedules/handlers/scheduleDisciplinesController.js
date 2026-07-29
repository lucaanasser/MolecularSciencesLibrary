/**
 * Responsabilidade: handlers HTTP de disciplinas na lista (sidebar) de um plano.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de disciplinas de user-schedules e delega ao service.
 * Dependencias criticas: UserSchedulesService e logger padronizado.
 */

const userSchedulesService = require('../../../../services/academic/userSchedules/UserSchedulesService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: adiciona uma disciplina a lista do plano. POST /api/user-schedules/:scheduleId/disciplines
     * Onde e usada: rota POST /:scheduleId/disciplines.
     * Dependencias chamadas: service.addDisciplineToSchedule.
     * Efeitos colaterais: persiste disciplina na lista do plano em DB.
     */
    async addDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { disciplineId, selectedClassId, isVisible, isExpanded, color } = req.body;
            log.start('Adicionando disciplina a lista do plano', { disciplineId, scheduleId });

            if (!disciplineId) {
                return res.status(400).json({ error: 'disciplineId é obrigatório' });
            }

            const result = await userSchedulesService.addDisciplineToSchedule(
                scheduleId, userId, disciplineId,
                { selectedClassId, isVisible, isExpanded, color }
            );

            log.success('Disciplina adicionada a lista', { disciplineId, scheduleId });
            res.status(201).json(result);
        } catch (error) {
            log.error('Erro ao adicionar disciplina', { err: error.message });
            res.status(500).json({ error: 'Erro ao adicionar disciplina à lista' });
        }
    },

    /**
     * O que faz: atualiza uma disciplina na lista do plano. PUT /api/user-schedules/:scheduleId/disciplines/:disciplineId
     * Onde e usada: rota PUT /:scheduleId/disciplines/:disciplineId.
     * Dependencias chamadas: service.updateScheduleDiscipline.
     * Efeitos colaterais: atualiza disciplina na lista do plano em DB.
     */
    async updateDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const disciplineId = parseInt(req.params.disciplineId);
            const { selectedClassId, isVisible, isExpanded, color } = req.body;
            log.start('Atualizando disciplina na lista do plano', { disciplineId, scheduleId });

            await userSchedulesService.updateScheduleDiscipline(
                scheduleId, userId, disciplineId,
                { selectedClassId, isVisible, isExpanded, color }
            );

            log.success('Disciplina atualizada na lista', { disciplineId, scheduleId });
            res.json({ success: true });
        } catch (error) {
            log.error('Erro ao atualizar disciplina', { err: error.message });
            res.status(500).json({ error: 'Erro ao atualizar disciplina na lista' });
        }
    },

    /**
     * O que faz: remove uma disciplina da lista do plano. DELETE /api/user-schedules/:scheduleId/disciplines/:disciplineId
     * Onde e usada: rota DELETE /:scheduleId/disciplines/:disciplineId.
     * Dependencias chamadas: service.removeDisciplineFromSchedule.
     * Efeitos colaterais: remove disciplina da lista do plano em DB.
     */
    async removeDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const disciplineId = parseInt(req.params.disciplineId);
            log.start('Removendo disciplina da lista do plano', { disciplineId, scheduleId });

            await userSchedulesService.removeDisciplineFromSchedule(scheduleId, userId, disciplineId);

            log.success('Disciplina removida da lista', { disciplineId, scheduleId });
            res.json({ success: true });
        } catch (error) {
            log.error('Erro ao remover disciplina', { err: error.message });
            res.status(500).json({ error: 'Erro ao remover disciplina da lista' });
        }
    },

    /**
     * O que faz: lista disciplinas da lista de um plano. GET /api/user-schedules/:scheduleId/disciplines
     * Onde e usada: rota GET /:scheduleId/disciplines.
     * Dependencias chamadas: service.getScheduleDisciplines.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getDisciplines(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            log.start('Listando disciplinas do plano', { scheduleId });

            const disciplines = await userSchedulesService.getScheduleDisciplines(scheduleId, userId);

            log.success('Disciplinas encontradas', { count: disciplines.length });
            res.json(disciplines);
        } catch (error) {
            log.error('Erro ao listar disciplinas', { err: error.message });
            res.status(500).json({ error: 'Erro ao listar disciplinas' });
        }
    }
};
