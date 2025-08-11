const notificationsService = require('../services/NotificationsService');
const emailService = require('../services/EmailService');
const LoansService = require('../services/LoansService');

/**
 * Controller responsável pelas notificações.
 */
class NotificationsController {
    // Lista notificações do usuário autenticado
    async getMyNotifications(req, res) {
        try {
            const user_id = req.user.id;
            const notifications = await notificationsService.getUserNotifications(user_id);
            res.status(200).json(notifications);
        } catch (error) {
            console.error("🔴 [NotificationsController] Erro ao buscar notificações:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Cria uma notificação (pode ser usada para "cutucar" também)
    async createNotification(req, res) {
        try {
            const { user_id, type, message, metadata, sendEmail, subject, loan_id } = req.body;
            if (!user_id || !type || !message) {
                return res.status(400).json({ error: 'user_id, type e message são obrigatórios.' });
            }
            // Cria a notificação interna
            const id = await notificationsService.notifyUser({ user_id, type, message, metadata, loan_id });

            // Se for um nudge e tiver loan_id, aplica o impacto de redução se necessário
            if (type === 'nudge' && loan_id) {
                try {
                    await LoansService.applyNudgeImpactIfNeeded(loan_id);
                } catch (e) {
                    console.warn('🟡 [NotificationsController] Falha ao aplicar impacto de nudge:', e.message);
                }
            }

            // Se deve enviar email, usa o EmailService
            if (sendEmail) {
                try {
                    if (type === 'nudge') {
                        // Para nudge, envia o email de cutucada específico
                        // Espera-se que metadata tenha requester_name e book_title
                        await emailService.sendNudgeEmail({
                            user_id,
                            requester_name: metadata?.requester_name,
                            book_title: metadata?.book_title
                        });
                        console.log(`🟢 [NotificationsController] Email de nudge enviado para usuário ${user_id}`);
                    } else {
                        await emailService.sendNotificationEmail({ user_id, type, message, subject });
                        console.log(`🟢 [NotificationsController] Email de notificação enviado para usuário ${user_id}`);
                    }
                } catch (emailError) {
                    console.error(`🔴 [NotificationsController] Erro ao enviar email para usuário ${user_id}:`, emailError.message);
                    // Não falha a criação da notificação se o email falhar
                }
            }
            res.status(201).json({ id });
        } catch (error) {
            console.error("🔴 [NotificationsController] Erro ao criar notificação:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Marca notificação como lida
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            await notificationsService.markNotificationAsRead(id);
            res.status(204).send();
        } catch (error) {
            console.error("🔴 [NotificationsController] Erro ao marcar como lida:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Lista todas as notificações (admin), com filtro opcional por usuário
    async getAllNotifications(req, res) {
        try {
            // Apenas admin pode acessar
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            const { user_id } = req.query;
            const notifications = await notificationsService.getAllNotifications({ user_id });
            res.status(200).json(notifications);
        } catch (error) {
            console.error("🔴 [NotificationsController] Erro ao buscar todas as notificações:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Exclui notificação apenas para o usuário autenticado
    async deleteForUser(req, res) {
        try {
            const user_id = req.user.id;
            const { id } = req.params;
            await notificationsService.deleteForUser(id, user_id);
            res.status(204).send();
        } catch (error) {
            console.error("🔴 [NotificationsController] Erro ao deletar notificação para o usuário:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Lista emails da caixa de entrada do Gmail (admin)
    async getInbox(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            const { fetchInbox } = require('../services/InboxService');
            const emails = await fetchInbox(20);
            res.status(200).json(emails);
        } catch (error) {
            console.error("🔴 [NotificationsController] Erro ao buscar inbox:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Deleta email da caixa de entrada do Gmail (admin)
    async deleteInboxEmail(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            const { emailId } = req.params;
            const { deleteEmail } = require('../services/InboxService');
            const result = await deleteEmail(emailId);
            res.status(200).json(result);
        } catch (error) {
            console.error("🔴 [NotificationsController] Erro ao deletar email:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new NotificationsController();