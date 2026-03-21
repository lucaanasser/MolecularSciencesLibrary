/**
 * Responsabilidade: casos de uso de inbox no dominio de email.
 * Camada: service.
 * Entradas/Saidas: recebe parametros de inbox e retorna lista/resultado de remocao.
 * Dependencias criticas: EmailInboxModel e logger compartilhado.
 */

const EmailInboxModel = require('../../../../models/utilities/email/EmailInboxModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: consulta emails da caixa de entrada com limite seguro.
     * Onde e usada: EmailController.getInbox.
     * Dependencias chamadas: EmailInboxModel.fetchInbox.
     * Efeitos colaterais: leitura em servidor IMAP.
     */
    async getInboxEmails({ limit = 20 } = {}) {
        const normalizedLimit = Number.isFinite(Number(limit)) ? Number(limit) : 20;
        const safeLimit = Math.max(1, Math.min(100, normalizedLimit));
        log.start('Iniciando consulta de inbox no service de email', { limit: safeLimit });

        try {
            const emails = await EmailInboxModel.fetchInbox(safeLimit);
            log.success('Consulta de inbox concluida no service de email', { total: emails.length, limit: safeLimit });
            return emails;
        } catch (error) {
            log.error('Falha no service ao consultar inbox', { limit: safeLimit, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove um email da inbox por id.
     * Onde e usada: EmailController.deleteInboxEmail.
     * Dependencias chamadas: EmailInboxModel.deleteEmail.
     * Efeitos colaterais: remove email da caixa no provedor IMAP.
     */
    async deleteInboxEmail({ emailId }) {
        log.start('Iniciando remocao de email da inbox no service', { email_id: emailId });

        if (!emailId) {
            log.warn('emailId ausente para remocao de inbox', { email_id: emailId });
            throw new Error('emailId e obrigatorio');
        }

        try {
            const result = await EmailInboxModel.deleteEmail(emailId);
            log.success('Remocao de email da inbox concluida no service', { email_id: emailId });
            return result;
        } catch (error) {
            log.error('Falha no service ao remover email da inbox', { email_id: emailId, err: error.message });
            throw error;
        }
    }
};
