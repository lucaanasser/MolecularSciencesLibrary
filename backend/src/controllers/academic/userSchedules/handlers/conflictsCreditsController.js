/**
 * Responsabilidade: handler HTTP de verificacao de conflitos de horario antes de adicionar turma.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res da rota de check-conflicts e delega ao service.
 * Dependencias criticas: UserSchedulesService e logger padronizado.
 */

const userSchedulesService = require('../../../../services/academic/userSchedules/UserSchedulesService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: verifica conflitos antes de adicionar uma turma. POST /api/user-schedules/:scheduleId/check-conflicts
     * Onde e usada: rota POST /:scheduleId/check-conflicts.
     * Dependencias chamadas: service.checkConflictsForClass.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async checkConflicts(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { classId } = req.body;
            log.start('Verificando conflitos para turma no plano', { classId, scheduleId });

            if (!classId) {
                return res.status(400).json({ error: 'classId é obrigatório' });
            }

            const conflicts = await userSchedulesService.checkConflictsForClass(scheduleId, userId, classId);

            log.success('Conflitos encontrados', { count: conflicts.length });
            res.json({ hasConflicts: conflicts.length > 0, conflicts });
        } catch (error) {
            log.error('Erro ao verificar conflitos', { err: error.message });
            res.status(500).json({ error: 'Erro ao verificar conflitos' });
        }
    }
};
