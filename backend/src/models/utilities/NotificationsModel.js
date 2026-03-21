/**
 * Responsabilidade: persistencia de notificacoes do dominio utilities.
 * Camada: model.
 * Entradas/Saidas: cria, consulta e atualiza status de notificacoes no SQLite.
 * Dependencias criticas: database/db e logger compartilhado.
 */

const { executeQuery, allQuery } = require('../../database/db');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

class NotificationsModel {
    /**
     * O que faz: cria notificacao com metadata opcional e status inicial.
     * Onde e usada: NotificationsService.createNotification e fluxos correlatos.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere registro na tabela notifications.
     */
    async createNotification({ user_id, type, message, metadata, status = 'unread', loan_id = null }) {
        const query = `
            INSERT INTO notifications (user_id, type, message, metadata, loan_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        const params = [user_id, type, message, metadata ? JSON.stringify(metadata) : null, loan_id, status];
        try {
            const result = await executeQuery(query, params);
            return result.lastID;
        } catch (error) {
            log.error('Falha ao criar notificacao', { user_id, type, loan_id, err: error.message });
            throw error;
        }
    }

    /**
     * O que faz: consulta notificacoes de um usuario ordenadas por data.
     * Onde e usada: NotificationsService.getUserNotifications.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getNotificationsByUser(user_id) {
        const query = `
            SELECT * FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        try {
            const notifications = await allQuery(query, [user_id]);
            return notifications;
        } catch (error) {
            log.error('Falha ao consultar notificacoes por usuario', { user_id, err: error.message });
            throw error;
        }
    }

    /**
     * O que faz: marca notificacao como lida.
     * Onde e usada: NotificationsService.markNotificationAsRead.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza status do registro no banco.
     */
    async markAsRead(notification_id) {
        const query = `
            UPDATE notifications SET status = 'read' WHERE id = ?
        `;
        try {
            await executeQuery(query, [notification_id]);
        } catch (error) {
            log.error('Falha ao marcar notificacao como lida', { notification_id, err: error.message });
            throw error;
        }
    }

    /**
     * O que faz: remove notificacao para usuario via soft delete.
     * Onde e usada: NotificationsService.deleteForUser.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza status para deleted sem remover linha fisica.
     */
    async deleteForUser(notification_id, user_id) {
        const query = `UPDATE notifications SET status = 'deleted' WHERE id = ? AND user_id = ?`;
        try {
            await executeQuery(query, [notification_id, user_id]);
        } catch (error) {
            log.error('Falha ao fazer soft delete de notificacao para usuario', { notification_id, user_id, err: error.message });
            throw error;
        }
    }

    /**
     * O que faz: consulta notificacoes com filtro opcional por usuario.
     * Onde e usada: NotificationsService.getAllNotifications.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getAllNotifications({ user_id } = {}) {
        let query = `SELECT * FROM notifications`;
        let params = [];
        if (user_id) {
            query += ` WHERE user_id = ?`;
            params.push(user_id);
        }
        query += ` ORDER BY created_at DESC`;
        try {
            const notifications = await allQuery(query, params);
            return notifications;
        } catch (error) {
            log.error('Falha ao consultar notificacoes gerais', { user_id, err: error.message });
            throw error;
        }
    }
}

module.exports = new NotificationsModel();