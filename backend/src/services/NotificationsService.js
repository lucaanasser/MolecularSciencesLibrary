const notificationsModel = require('../models/NotificationsModel');
const LoansModel = require('../models/LoansModel');

/**
 * Service responsável pela lógica de notificações internas do sistema.
 * Não lida com emails - apenas com notificações armazenadas no banco de dados.
 */
class NotificationsService {
    /**
     * Cria uma notificação interna no sistema
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

        console.log(`🟢 [NotificationsService] Notificação ${type} criada para usuário ${user_id}`);
        return notificationId;
    }

    /**
     * Cria uma notificação interna no sistema (método usado pelo controller)
     */
    async notifyUser({ user_id, type, message, metadata, loan_id }) {
        return await this.createNotification({
            user_id,
            type,
            message,
            metadata,
            loan_id
        });
    }

    /**
     * Busca notificações de um usuário específico
     */
    async getUserNotifications(user_id) {
        return await notificationsModel.getNotificationsByUser(user_id);
    }

    /**
     * Marca uma notificação como lida
     */
    async markNotificationAsRead(notification_id) {
        return await notificationsModel.markAsRead(notification_id);
    }

    /**
     * Busca todas as notificações, com filtro opcional por usuário
     */
    async getAllNotifications({ user_id } = {}) {
        return await notificationsModel.getAllNotifications({ user_id });
    }

    /**
     * Exclui notificação para o usuário (soft delete)
     */
    async deleteForUser(notification_id, user_id) {
        return await notificationsModel.deleteForUser(notification_id, user_id);
    }

    /**
     * Cria notificação de atraso se ainda não existir para o mesmo empréstimo
     */
    async createOverdueNotificationIfNotExists(loan) {
        const { student_id, loan_id, book_id, book_title, due_date } = loan;
        
        // Verifica se já existe notificação de atraso para este empréstimo
        const existing = await this.getAllNotifications({ user_id: student_id });
        const alreadyNotified = existing.some(n => 
            n.type === 'overdue' && 
            n.metadata && 
            n.metadata.loan_id == loan_id
        );

        if (alreadyNotified) {
            console.log(`🟡 [NotificationsService] Notificação de atraso já existe para empréstimo ${loan_id}`);
            return null;
        }

        // Cria notificação no banco
        const message = `O livro "${book_title || book_id}" está em atraso! Por favor, devolva o quanto antes. Data limite: ${new Date(due_date).toLocaleDateString('pt-BR')}`;
        const metadata = { loan_id, book_id, due_date };

        const notificationId = await this.createNotification({
            user_id: student_id,
            type: 'overdue',
            message,
            metadata
        });

        console.log(`🟢 [NotificationsService] Notificação de atraso criada para empréstimo ${loan_id}`);
        return notificationId;
    }

    /**
     * Cria notificação de lembrete de atraso se necessário (a cada X dias)
     */
    async createOverdueReminderIfDue(loan, reminderDays) {
        const { student_id, loan_id, book_id, book_title, due_date } = loan;
        
        // Busca todas as notificações de lembrete para este empréstimo
        const existing = await this.getAllNotifications({ user_id: student_id });
        const reminders = existing.filter(n => 
            n.type === 'overdue_reminder' && 
            n.metadata && 
            n.metadata.loan_id == loan_id
        );

        let lastReminderDate = null;
        if (reminders.length > 0) {
            // Pega a data do último lembrete
            lastReminderDate = reminders
                .map(r => new Date(r.created_at))
                .sort((a, b) => b - a)[0];
        }

        const now = new Date();
        let shouldSend = false;

        if (!lastReminderDate) {
            shouldSend = true;
        } else {
            const diffDays = Math.floor((now - lastReminderDate) / (1000 * 60 * 60 * 24));
            if (diffDays >= reminderDays) {
                shouldSend = true;
            }
        }

        if (!shouldSend) {
            console.log(`🟡 [NotificationsService] Lembrete de atraso já enviado recentemente para empréstimo ${loan_id}`);
            return null;
        }

        // Cria notificação no banco
        const message = `Lembrete: O livro "${book_title || book_id}" ainda não foi devolvido e está em atraso. Por favor, devolva o quanto antes para evitar multas e permitir que outros colegas também possam utilizá-lo.`;
        const metadata = { loan_id, book_id, due_date };

        const notificationId = await this.createNotification({
            user_id: student_id,
            type: 'overdue_reminder',
            message,
            metadata
        });

        console.log(`🟢 [NotificationsService] Lembrete de atraso criado para empréstimo ${loan_id}`);
        return notificationId;
    }

    /**
     * Cria notificação de "cutucada" quando alguém quer um livro que está emprestado
     */
    async createNudgeNotification({ borrower_id, requester_id, book_id, book_title, loan_id }) {
        const message = `Alguém está interessado no livro "${book_title || book_id}" que você pegou emprestado. Que tal devolver logo para ajudar um colega? 😄`;
        const metadata = { requester_id, book_id, nudge_type: 'book_request' };

        const id = await this.createNotification({
            user_id: borrower_id,
            type: 'nudge',
            message,
            metadata,
            loan_id
        });

        if (loan_id) {
            try {
                // Se há pendência de extensão, aplica extensão curta de 5 dias a partir de agora
                const loan = await require('../models/LoansModel').getLoanById(loan_id).catch(()=>null);
                if (loan && loan.returned_at == null && loan.extended_phase === 0 && loan.extension_pending === 1) {
                    await LoansModel.extendLoanShortFromNow(loan_id, 5);
                }
            } catch (e) {
                console.warn('🟡 [NotificationsService] Falha ao aplicar extensão curta após nudge:', e.message);
            }
            // Em qualquer caso, registra momento do nudge
            await LoansModel.setLastNudged(loan_id).catch(()=>{});
        }

        return id;
    }

    /**
     * Cria notificação personalizada
     */
    async createCustomNotification({ user_id, message, metadata = {} }) {
        return await this.createNotification({
            user_id,
            type: 'custom',
            message,
            metadata
        });
    }

    /**
     * Conta notificações não lidas de um usuário
     */
    async getUnreadCount(user_id) {
        const notifications = await this.getUserNotifications(user_id);
        return notifications.filter(n => n.status === 'unread').length;
    }

    /**
     * Marca todas as notificações de um usuário como lidas
     */
    async markAllAsReadForUser(user_id) {
        const notifications = await this.getUserNotifications(user_id);
        const unreadNotifications = notifications.filter(n => n.status === 'unread');
        
        for (const notification of unreadNotifications) {
            await this.markNotificationAsRead(notification.id);
        }
        
        return unreadNotifications.length;
    }
}

module.exports = new NotificationsService();