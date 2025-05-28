const notificationsModel = require('../models/NotificationsModel');
const usersModel = require('../models/UsersModel');
const EmailService = require('./EmailService');

/**
 * Service responsável pela lógica de envio e registro de notificações.
 */
class NotificationsService {
    async notifyUser({ user_id, type, message, metadata, sendEmail = true, subject }) {
        // Cria notificação no banco
        const notificationId = await notificationsModel.createNotification({
            user_id,
            type,
            message,
            metadata,
            status: 'unread'
        });

        // Envia email se solicitado
        if (sendEmail) {
            const user = await usersModel.getUserById(user_id);
            if (user && user.email) {
                await EmailService.sendMail({
                    to: user.email,
                    subject, 
                    text: message,
                    type
                });
            }
        }

        return notificationId;
    }

    getEmailSubject(type) {
        switch (type) {
            case 'overdue': return 'Aviso de atraso de livro';
            case 'nudge': return 'Alguém está esperando seu livro!';
            default: return 'Notificação da Biblioteca';
        }
    }

    async getUserNotifications(user_id) {
        return await notificationsModel.getNotificationsByUser(user_id);
    }

    async markNotificationAsRead(notification_id) {
        return await notificationsModel.markAsRead(notification_id);
    }

    // Busca todas as notificações, com filtro opcional por usuário
    async getAllNotifications({ user_id } = {}) {
        return await notificationsModel.getAllNotifications({ user_id });
    }

    // Exclui notificação apenas para o usuário (soft delete)
    async deleteForUser(notification_id, user_id) {
        return await notificationsModel.deleteForUser(notification_id, user_id);
    }
}

module.exports = new NotificationsService();