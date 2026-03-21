/**
 * Responsabilidade: handlers HTTP de leitura de notificacoes.
 * Camada: controller.
 * Entradas/Saidas: req autenticado e respostas JSON com notificacoes.
 * Dependencias criticas: NotificationsService e logger compartilhado.
 */

const NotificationsService = require('../../../../services/utilities/notifications/NotificationsService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista notificacoes do usuario autenticado.
     * Onde e usada: GET /api/notifications/me.
     * Dependencias chamadas: NotificationsService.getUserNotifications.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getMyNotifications(req, res) {
        const user_id = req?.user?.id;
        log.start('Iniciando consulta de notificacoes do usuario autenticado', { user_id });

        try {
            const notifications = await NotificationsService.getUserNotifications(user_id);
            log.success('Notificacoes do usuario consultadas com sucesso', { user_id, total: notifications.length });
            return res.status(200).json(notifications);
        } catch (error) {
            log.error('Falha ao consultar notificacoes do usuario', { user_id, err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: lista todas as notificacoes para administradores, com filtro opcional.
     * Onde e usada: GET /api/notifications.
     * Dependencias chamadas: NotificationsService.getAllNotifications.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getAllNotifications(req, res) {
        const requester_id = req?.user?.id;
        const role = req?.user?.role;
        const { user_id } = req.query || {};
        log.start('Iniciando consulta administrativa de notificacoes', { requester_id, role, user_id });

        if (!req.user || role !== 'admin') {
            log.warn('Acesso negado para consulta administrativa de notificacoes', { requester_id, role });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        try {
            const notifications = await NotificationsService.getAllNotifications({ user_id });
            log.success('Consulta administrativa de notificacoes concluida', { requester_id, total: notifications.length, user_id });
            return res.status(200).json(notifications);
        } catch (error) {
            log.error('Falha na consulta administrativa de notificacoes', { requester_id, user_id, err: error.message });
            return res.status(500).json({ error: error.message });
        }
    }
};
