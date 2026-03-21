module.exports = {
    /**
     * Cria notificacao de atraso se ainda nao existir para o mesmo emprestimo.
     */
    async createOverdueNotificationIfNotExists(loan) {
        const { student_id, loan_id, book_id, book_title, due_date } = loan;

        const existing = await this.getAllNotifications({ user_id: student_id });
        const alreadyNotified = existing.some(n =>
            n.type === 'overdue' &&
            n.metadata &&
            n.metadata.loan_id == loan_id
        );

        if (alreadyNotified) {
            console.log(`🟡 [NotificationsService] Notificacao de atraso ja existe para emprestimo ${loan_id}`);
            return null;
        }

        const message = `O livro "${book_title || book_id}" esta em atraso! Por favor, devolva o quanto antes. Data limite: ${new Date(due_date).toLocaleDateString('pt-BR')}`;
        const metadata = { loan_id, book_id, due_date };

        const notificationId = await this.createNotification({
            user_id: student_id,
            type: 'overdue',
            message,
            metadata
        });

        console.log(`🟢 [NotificationsService] Notificacao de atraso criada para emprestimo ${loan_id}`);
        return notificationId;
    },

    /**
     * Cria notificacao de lembrete de atraso se necessario.
     */
    async createOverdueReminderIfDue(loan, reminderDays) {
        const { student_id, loan_id, book_id, book_title, due_date } = loan;

        const existing = await this.getAllNotifications({ user_id: student_id });
        const reminders = existing.filter(n =>
            n.type === 'overdue_reminder' &&
            n.metadata &&
            n.metadata.loan_id == loan_id
        );

        let lastReminderDate = null;
        if (reminders.length > 0) {
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
            console.log(`🟡 [NotificationsService] Lembrete de atraso ja enviado recentemente para emprestimo ${loan_id}`);
            return null;
        }

        const message = `Lembrete: O livro "${book_title || book_id}" ainda nao foi devolvido e esta em atraso. Por favor, devolva o quanto antes para evitar multas e permitir que outros colegas tambem possam utiliza-lo.`;
        const metadata = { loan_id, book_id, due_date };

        const notificationId = await this.createNotification({
            user_id: student_id,
            type: 'overdue_reminder',
            message,
            metadata
        });

        console.log(`🟢 [NotificationsService] Lembrete de atraso criado para emprestimo ${loan_id}`);
        return notificationId;
    }
};
