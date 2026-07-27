/**
 * Responsabilidade: handlers HTTP de conflitos de horario e calculo de creditos dos planos.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de conflitos/creditos e delega ao service.
 * Dependencias criticas: UserSchedulesService e logger padronizado.
 */

const userSchedulesService = require('../../../../services/academic/UserSchedulesService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: detecta conflitos de horario em um plano. GET /api/user-schedules/:id/conflicts
     * Onde e usada: definido para uso legado (nao roteado atualmente).
     * Dependencias chamadas: service.detectConflicts.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getConflicts(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            log.start('Detectando conflitos no plano', { scheduleId });

            const conflicts = await userSchedulesService.detectConflicts(scheduleId, userId);

            log.success('Conflitos encontrados', { count: conflicts.length });
            res.json(conflicts);
        } catch (error) {
            log.error('Erro ao detectar conflitos', { err: error.message });
            res.status(500).json({ error: 'Erro ao detectar conflitos' });
        }
    },

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
    },

    /**
     * O que faz: calcula os creditos de um plano. GET /api/user-schedules/:id/credits
     * Onde e usada: definido para uso legado (nao roteado atualmente).
     * Dependencias chamadas: service.calculateCredits.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getCredits(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            log.start('Calculando creditos do plano', { scheduleId });

            const credits = await userSchedulesService.calculateCredits(scheduleId, userId);

            log.success('Creditos calculados', { scheduleId });
            res.json(credits);
        } catch (error) {
            log.error('Erro ao calcular creditos', { err: error.message });
            res.status(500).json({ error: 'Erro ao calcular créditos' });
        }
    }
};
