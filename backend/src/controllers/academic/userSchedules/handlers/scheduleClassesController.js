/**
 * Responsabilidade: handlers HTTP de turmas dentro de um plano (adicionar/remover/atualizar).
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de turmas de user-schedules e delega ao service.
 * Dependencias criticas: UserSchedulesService e logger padronizado.
 */

const userSchedulesService = require('../../../../services/academic/userSchedules/UserSchedulesService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: adiciona uma turma ao plano. POST /api/user-schedules/:id/classes
     * Onde e usada: rota POST /:scheduleId/classes.
     * Dependencias chamadas: service.addClassToSchedule.
     * Efeitos colaterais: persiste vinculo turma-plano em DB.
     */
    async addClass(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { classId } = req.body;
            log.start('Adicionando turma ao plano', { classId, scheduleId });

            if (!classId) {
                return res.status(400).json({ error: 'classId é obrigatório' });
            }

            const result = await userSchedulesService.addClassToSchedule(scheduleId, userId, classId);

            if (!result) {
                log.warn('Plano nao encontrado', { scheduleId });
                return res.status(404).json({ error: 'Plano não encontrado' });
            }

            log.success('Turma adicionada', { classId, scheduleId });
            res.status(201).json(result);
        } catch (error) {
            log.error('Erro ao adicionar turma', { err: error.message });
            res.status(500).json({ error: 'Erro ao adicionar turma' });
        }
    },

    /**
     * O que faz: remove uma turma do plano. DELETE /api/user-schedules/:id/classes/:classId
     * Onde e usada: rota DELETE /:scheduleId/classes/:classId.
     * Dependencias chamadas: service.removeClassFromSchedule.
     * Efeitos colaterais: remove vinculo turma-plano em DB.
     */
    async removeClass(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const classId = parseInt(req.params.classId);
            log.start('Removendo turma do plano', { classId, scheduleId });

            const removed = await userSchedulesService.removeClassFromSchedule(scheduleId, userId, classId);

            if (!removed) {
                log.warn('Plano nao encontrado', { scheduleId });
                return res.status(404).json({ error: 'Plano não encontrado' });
            }

            log.success('Turma removida', { classId, scheduleId });
            res.json({ success: true });
        } catch (error) {
            log.error('Erro ao remover turma', { err: error.message });
            res.status(500).json({ error: 'Erro ao remover turma' });
        }
    },

    /**
     * O que faz: atualiza a cor de uma turma no plano. PATCH /api/user-schedules/:scheduleId/classes/:classId/color
     * Onde e usada: rota PATCH /:scheduleId/classes/:classId/color.
     * Dependencias chamadas: service.updateScheduleClassColor.
     * Efeitos colaterais: atualiza cor da turma no plano em DB.
     */
    async updateClassColor(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const classId = parseInt(req.params.classId);
            const { color } = req.body;
            log.start('Atualizando cor da turma no plano', { classId, scheduleId });

            if (!color) {
                return res.status(400).json({ error: 'color é obrigatório' });
            }

            await userSchedulesService.updateScheduleClassColor(scheduleId, userId, classId, color);

            log.success('Cor da turma atualizada', { classId, scheduleId });
            res.json({ success: true });
        } catch (error) {
            log.error('Erro ao atualizar cor da turma', { err: error.message });
            res.status(500).json({ error: 'Erro ao atualizar cor da turma' });
        }
    }
};
