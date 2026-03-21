const notificationsModel = require('../../../../models/utilities/NotificationsModel');

module.exports = {
    /**
     * Cria notificacao interna no sistema.
     */
    async createNotification({ user_id, type, message, metadata, loan_id }) {
        const notificationId = await notificationsModel.createNotification({
            user_id,
            type,
            message,
            metadata,
            loan_id,
            status: 'unread'
        });

        console.log(`🟢 [NotificationsService] Notificacao ${type} criada para usuario ${user_id}`);
        return notificationId;
    },

    /**
     * Alias usado pelo controller.
     */
    async notifyUser({ user_id, type, message, metadata, loan_id }) {
        return await this.createNotification({ user_id, type, message, metadata, loan_id });
    },

    /**
     * Busca notificacoes de um usuario.
     */
    async getUserNotifications(user_id) {
        return await notificationsModel.getNotificationsByUser(user_id);
    },

    /**
     * Marca notificacao como lida.
     */
    async markNotificationAsRead(notification_id) {
        return await notificationsModel.markAsRead(notification_id);
    },

    /**
     * Busca todas as notificacoes, com filtro opcional por usuario.
     */
    async getAllNotifications({ user_id } = {}) {
        return await notificationsModel.getAllNotifications({ user_id });
    },

    /**
     * Exclui notificacao para usuario (soft delete).
     */
    async deleteForUser(notification_id, user_id) {
        return await notificationsModel.deleteForUser(notification_id, user_id);
    },

    /**
     * Cria notificacao personalizada.
     */
    async createCustomNotification({ user_id, message, metadata = {} }) {
        return await this.createNotification({
            user_id,
            type: 'custom',
            message,
            metadata
        });
    },

    /**
     * Conta notificacoes nao lidas de um usuario.
     */
    async getUnreadCount(user_id) {
        const notifications = await this.getUserNotifications(user_id);
        return notifications.filter(n => n.status === 'unread').length;
    },

    /**
     * Marca todas as notificacoes do usuario como lidas.
     */
    async markAllAsReadForUser(user_id) {
        const notifications = await this.getUserNotifications(user_id);
        const unreadNotifications = notifications.filter(n => n.status === 'unread');

        for (const notification of unreadNotifications) {
            await this.markNotificationAsRead(notification.id);
        }

        return unreadNotifications.length;
    }
};
