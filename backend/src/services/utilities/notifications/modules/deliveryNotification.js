/**
 * Responsabilidade: orquestrar entrega multicanal de notificacoes (in-app + email).
 * Camada: service.
 * Entradas/Saidas: payload de notificacao e id gerado no banco.
 * Dependencias criticas: coreNotification, EmailService, LoansService e LoansModel.
 */

const EmailService = require('../../email/EmailService');
const LoansService = require('../../../library/loans/LoansService');
const LoansModel = require('../../../../models/library/LoansModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

const DEFAULT_SUBJECT_BY_TYPE = {
    general: 'Notificacao da Biblioteca',
    reminder: 'Lembrete da Biblioteca',
    alert: 'Alerta da Biblioteca',
    system: 'Atualizacao do Sistema',
    info: 'Informacao da Biblioteca'
};

module.exports = {
    /**
     * O que faz: cria notificacao no sistema e opcionalmente envia email relacionado.
     * Onde e usada: NotificationsController.createNotification.
     * Dependencias chamadas: notifyUser, _handleNudgeEmailFlow e EmailService.sendCustomEmail.
     * Efeitos colaterais: persiste notificacao e pode enviar email para usuario.
     */
    async createNotificationWithChannels({ user_id, type, message, metadata, sendEmail, subject, loan_id }) {
        log.start('Iniciando criacao de notificacao com canais', { user_id, type, send_email: Boolean(sendEmail), loan_id });

        const id = await this.notifyUser({ user_id, type, message, metadata, loan_id });

        if (!sendEmail) {
            log.success('Notificacao criada sem envio de email', { notification_id: id, user_id, type });
            return id;
        }

        try {
            if (type === 'nudge') {
                await this._handleNudgeEmailFlow({ user_id, metadata, loan_id });
            } else {
                const subjectToUse = subject || DEFAULT_SUBJECT_BY_TYPE[type] || `Notificacao: ${type}`;
                await EmailService.sendCustomEmail({
                    user_id,
                    subject: subjectToUse,
                    message,
                    isAutomatic: false
                });
            }

            log.success('Notificacao criada com envio de email concluido', { notification_id: id, user_id, type });
        } catch (emailError) {
            log.warn('Falha no envio de email; notificacao interna mantida', {
                notification_id: id,
                user_id,
                type,
                err: emailError.message
            });
        }

        return id;
    },

    /**
     * O que faz: decide estrategia de email para nudge comum ou nudge com extensao.
     * Onde e usada: createNotificationWithChannels.
     * Dependencias chamadas: LoansModel.getLoanById, LoansService.applyNudgeImpactIfNeeded e metodos de EmailService.
     * Efeitos colaterais: pode reduzir prazo de emprestimo e enviar email de nudge.
     */
    async _handleNudgeEmailFlow({ user_id, metadata, loan_id }) {
        if (!loan_id) {
            await EmailService.sendNudgeEmail({
                user_id,
                requester_name: metadata?.requester_name,
                book_title: metadata?.book_title
            });
            return;
        }

        const loan = await LoansModel.getLoanById(loan_id);
        if (loan && !loan.returned_at && loan.is_extended === 1) {
            const impact = await LoansService.applyNudgeImpactIfNeeded(loan_id).catch(() => null);
            const newDue = impact?.new_due_date || loan?.due_date;

            await EmailService.sendExtensionNudgeEmail({
                user_id,
                book_title: metadata?.book_title || loan.book_title,
                new_due_date: newDue
            });
            return;
        }

        await EmailService.sendNudgeEmail({
            user_id,
            requester_name: metadata?.requester_name,
            book_title: metadata?.book_title
        });
    }
};
