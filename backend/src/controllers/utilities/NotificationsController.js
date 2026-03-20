const notificationsService = require('../../services/utilities/NotificationsService');
const emailService = require('../../services/utilities/EmailService');
const LoansService = require('../../services/library/loans/LoansService');
const LoansModel = require('../../models/library/LoansModel');

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

            // Se for um nudge e tiver loan_id, decide o tipo e aplica impacto quando necessário
            let nudgeHandledByExtensionFlow = false;
            if (type === 'nudge' && loan_id) {
                try {
                    const loan = await LoansModel.getLoanById(loan_id);
                    if (loan && !loan.returned_at && loan.is_extended === 1) {
                        // Reduz o prazo (se aplicável) e envia email específico de extensão
                        const impact = await LoansService.applyNudgeImpactIfNeeded(loan_id).catch(() => null);
                        const newDue = (impact && impact.new_due_date) ? impact.new_due_date : (loan && loan.due_date);
                        if (sendEmail) {
                            await emailService.sendExtensionNudgeEmail({
                                user_id,
                                book_title: metadata?.book_title || loan.book_title,
                                new_due_date: newDue
                            });
                        }
                        nudgeHandledByExtensionFlow = true;
                    }
                } catch (e) {
                    console.warn('🟡 [NotificationsController] Falha ao processar nudge de extensão:', e.message);
                }
            }

            // Envio de email
            if (sendEmail) {
                try {
                    if (type === 'nudge') {
                        if (!nudgeHandledByExtensionFlow) {
                            // Caso não seja um empréstimo estendido, usa o email genérico de nudge
                            await emailService.sendNudgeEmail({
                                user_id,
                                requester_name: metadata?.requester_name,
                                book_title: metadata?.book_title
                            });
                            console.log(`🟢 [NotificationsController] Email de nudge (genérico) enviado para usuário ${user_id}`);
                        }
                    } else {
                        const subjectToUse = subject || {
                            general: 'Notificação da Biblioteca',
                            reminder: 'Lembrete da Biblioteca',
                            alert: 'Alerta da Biblioteca',
                            system: 'Atualização do Sistema',
                            info: 'Informação da Biblioteca'
                        }[type] || `Notificação: ${type}`;
                        // Emails personalizados não devem exibir aviso de automático
                        await emailService.sendCustomEmail({ user_id, subject: subjectToUse, message, isAutomatic: false });
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
            const { fetchInbox } = require('../../services/utilities/InboxService');
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
            const { deleteEmail } = require('../../services/utilities/InboxService');
            const result = await deleteEmail(emailId);
            res.status(200).json(result);
        } catch (error) {
            console.error("🔴 [NotificationsController] Erro ao deletar email:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new NotificationsController();