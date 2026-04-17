/**
 * Responsabilidade: handlers HTTP de escrita de notificacoes.
 * Camada: controller.
 * Entradas/Saidas: payload de notificacao e respostas HTTP de comando.
 * Dependencias criticas: NotificationsService e logger compartilhado.
 */

const NotificationsService = require('../../../../services/utilities/notifications/NotificationsService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria notificacao e opcionalmente dispara canal de email.
     * Onde e usada: POST /api/notifications e POST /api/notifications/nudge.
     * Dependencias chamadas: NotificationsService.createNotificationWithChannels.
     * Efeitos colaterais: persiste notificacao e pode acionar envio de email.
     */
    async createNotification(req, res) {
        const { user_id, type, message, metadata, sendEmail, subject, loan_id } = req.body || {};
        log.start('Iniciando criacao de notificacao', { user_id, type, sendEmail: Boolean(sendEmail), loan_id });

        if (!user_id || !type || !message) {
            log.warn('Payload invalido para criacao de notificacao', { user_id, type });
            return res.status(400).json({ error: 'user_id, type e message sao obrigatorios.' });
        }

        try {
            const id = await NotificationsService.createNotificationWithChannels({
                user_id,
                type,
                message,
                metadata,
                sendEmail,
                subject,
                loan_id
            });

            log.success('Notificacao criada com sucesso', { notification_id: id, user_id, type });
            return res.status(201).json({ id });
        } catch (error) {
            log.error('Falha ao criar notificacao', { user_id, type, err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: marca uma notificacao como lida.
     * Onde e usada: PATCH /api/notifications/:id/read.
     * Dependencias chamadas: NotificationsService.markNotificationAsRead.
     * Efeitos colaterais: atualiza status de notificacao no banco.
     */
    async markAsRead(req, res) {
        const { id } = req.params;
        log.start('Iniciando marcacao de notificacao como lida', { notification_id: id, user_id: req?.user?.id });

        try {
            await NotificationsService.markNotificationAsRead(id);
            log.success('Notificacao marcada como lida', { notification_id: id, user_id: req?.user?.id });
            return res.status(204).send();
        } catch (error) {
            log.error('Falha ao marcar notificacao como lida', { notification_id: id, err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: exclui notificacao para o proprio usuario (soft delete).
     * Onde e usada: DELETE /api/notifications/:id.
     * Dependencias chamadas: NotificationsService.deleteForUser.
     * Efeitos colaterais: altera status da notificacao para deleted.
     */
    async deleteForUser(req, res) {
        const user_id = req?.user?.id;
        const { id } = req.params;
        log.start('Iniciando exclusao de notificacao para usuario', { notification_id: id, user_id });

        try {
            await NotificationsService.deleteForUser(id, user_id);
            log.success('Notificacao excluida para usuario', { notification_id: id, user_id });
            return res.status(204).send();
        } catch (error) {
            log.error('Falha ao excluir notificacao para usuario', { notification_id: id, user_id, err: error.message });
            return res.status(500).json({ error: error.message });
        }
    }
};
