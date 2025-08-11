const { executeQuery, getQuery, allQuery } = require('../database/db');

/**
 * Modelo para operações no banco de dados relacionadas a notificações.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class NotificationsModel {
    async createNotification({ user_id, type, message, metadata, status = 'unread', loan_id = null }) {
        console.log("🔵 [NotificationsModel] Criando notificação:", { user_id, type, message });
        const query = `
            INSERT INTO notifications (user_id, type, message, metadata, loan_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        const params = [user_id, type, message, metadata ? JSON.stringify(metadata) : null, loan_id, status];
        try {
            const id = await executeQuery(query, params);
            console.log("🟢 [NotificationsModel] Notificação criada:", id);
            return id;
        } catch (error) {
            console.error("🔴 [NotificationsModel] Erro ao criar notificação:", error.message);
            throw error;
        }
    }

    async getNotificationsByUser(user_id) {
        console.log("🔵 [NotificationsModel] Buscando notificações do usuário:", user_id);
        const query = `
            SELECT * FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        try {
            const notifications = await allQuery(query, [user_id]);
            console.log("🟢 [NotificationsModel] Notificações encontradas:", notifications.length);
            return notifications;
        } catch (error) {
            console.error("🔴 [NotificationsModel] Erro ao buscar notificações:", error.message);
            throw error;
        }
    }

    async markAsRead(notification_id) {
        console.log("🔵 [NotificationsModel] Marcando notificação como lida:", notification_id);
        const query = `
            UPDATE notifications SET status = 'read' WHERE id = ?
        `;
        try {
            await executeQuery(query, [notification_id]);
            console.log("🟢 [NotificationsModel] Notificação marcada como lida:", notification_id);
        } catch (error) {
            console.error("🔴 [NotificationsModel] Erro ao marcar notificação como lida:", error.message);
            throw error;
        }
    }

    // Exclui notificação apenas para o usuário (soft delete)
    async deleteForUser(notification_id, user_id) {
        console.log("🔵 [NotificationsModel] Excluindo notificação para o usuário:", notification_id, user_id);
        // Marca como 'deleted' para o usuário, mas mantém no banco
        const query = `UPDATE notifications SET status = 'deleted' WHERE id = ? AND user_id = ?`;
        try {
            await executeQuery(query, [notification_id, user_id]);
            console.log("🟢 [NotificationsModel] Notificação marcada como deletada para o usuário:", notification_id);
        } catch (error) {
            console.error("🔴 [NotificationsModel] Erro ao deletar notificação para o usuário:", error.message);
            throw error;
        }
    }

    // Busca todas as notificações, com filtro opcional por usuário
    async getAllNotifications({ user_id } = {}) {
        console.log("🔵 [NotificationsModel] Buscando todas as notificações", user_id ? `do usuário: ${user_id}` : "(todas)");
        let query = `SELECT * FROM notifications`;
        let params = [];
        if (user_id) {
            query += ` WHERE user_id = ?`;
            params.push(user_id);
        }
        query += ` ORDER BY created_at DESC`;
        try {
            const notifications = await allQuery(query, params);
            console.log("🟢 [NotificationsModel] Notificações encontradas:", notifications.length);
            return notifications;
        } catch (error) {
            console.error("🔴 [NotificationsModel] Erro ao buscar todas as notificações:", error.message);
            throw error;
        }
    }
}

module.exports = new NotificationsModel();