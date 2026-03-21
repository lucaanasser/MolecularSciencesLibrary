/**
 * Responsabilidade: handlers HTTP para caixa de entrada de email.
 * Camada: controller.
 * Entradas/Saidas: req autenticado de admin e respostas JSON com emails.
 * Dependencias criticas: EmailService e logger compartilhado.
 */

const EmailService = require('../../../../services/utilities/email/EmailService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista emails da inbox configurada no SMTP/IMAP.
     * Onde e usada: GET /api/email/inbox.
     * Dependencias chamadas: EmailService.getInboxEmails.
     * Efeitos colaterais: nenhum alem de leitura da caixa de entrada.
     */
    async getInbox(req, res) {
        const requester_id = req?.user?.id;
        const role = req?.user?.role;
        const limitRaw = req.query?.limit;
        log.start('Iniciando consulta da inbox de email', { requester_id, role, limit: limitRaw });

        if (!req.user || role !== 'admin') {
            log.warn('Acesso negado para consulta da inbox de email', { requester_id, role });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        try {
            const limit = Number.isFinite(Number(limitRaw)) ? Number(limitRaw) : 20;
            const emails = await EmailService.getInboxEmails({ limit });
            log.success('Inbox de email consultada com sucesso', { requester_id, total: emails.length, limit });
            return res.status(200).json(emails);
        } catch (error) {
            log.error('Falha ao consultar inbox de email', { requester_id, err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove um email da inbox por id.
     * Onde e usada: DELETE /api/email/inbox/:emailId.
     * Dependencias chamadas: EmailService.deleteInboxEmail.
     * Efeitos colaterais: marca e remove email da caixa IMAP.
     */
    async deleteInboxEmail(req, res) {
        const requester_id = req?.user?.id;
        const role = req?.user?.role;
        const { emailId } = req.params;
        log.start('Iniciando exclusao de email da inbox', { requester_id, role, email_id: emailId });

        if (!req.user || role !== 'admin') {
            log.warn('Acesso negado para exclusao de email da inbox', { requester_id, role, email_id: emailId });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        try {
            const result = await EmailService.deleteInboxEmail({ emailId });
            log.success('Email removido da inbox com sucesso', { requester_id, email_id: emailId });
            return res.status(200).json(result);
        } catch (error) {
            log.error('Falha ao remover email da inbox', { requester_id, email_id: emailId, err: error.message });
            return res.status(500).json({ error: error.message });
        }
    }
};
