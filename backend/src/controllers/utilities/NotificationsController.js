/**
 * Responsabilidade: compatibilidade para imports legados de notifications controller.
 * Camada: controller.
 * Entradas/Saidas: preserva metodos antigos e delega para controllers modulares.
 * Dependencias criticas: notifications/NotificationsController, email/EmailController e logger.
 */

const NotificationsControllerV2 = require('./notifications/NotificationsController');
const EmailController = require('./email/EmailController');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: expor metodos legados preservando compatibilidade de import.
 * Onde e usada: rotas legadas que importam controllers/utilities/NotificationsController.
 * Dependencias chamadas: controllers modulares de notifications e email.
 * Efeitos colaterais: emite logs de deprecacao para endpoints movidos.
 */
class NotificationsControllerCompatibility {
    async getMyNotifications(req, res) {
        return NotificationsControllerV2.getMyNotifications(req, res);
    }

    async createNotification(req, res) {
        return NotificationsControllerV2.createNotification(req, res);
    }

    async markAsRead(req, res) {
        return NotificationsControllerV2.markAsRead(req, res);
    }

    async getAllNotifications(req, res) {
        return NotificationsControllerV2.getAllNotifications(req, res);
    }

    async deleteForUser(req, res) {
        return NotificationsControllerV2.deleteForUser(req, res);
    }

    async getInbox(req, res) {
        log.warn('Endpoint legado de inbox em NotificationsController; migrar para EmailController.getInbox', {
            old_route: '/api/notifications/inbox',
            new_route: '/api/email/inbox'
        });
        return EmailController.getInbox(req, res);
    }

    async deleteInboxEmail(req, res) {
        log.warn('Endpoint legado de exclusao de inbox em NotificationsController; migrar para EmailController.deleteInboxEmail', {
            old_route: '/api/notifications/inbox/:emailId',
            new_route: '/api/email/inbox/:emailId'
        });
        return EmailController.deleteInboxEmail(req, res);
    }
}

module.exports = new NotificationsControllerCompatibility();