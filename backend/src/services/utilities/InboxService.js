/**
 * Responsabilidade: compatibilidade para APIs legadas de inbox.
 * Camada: service.
 * Entradas/Saidas: preserva funcoes fetchInbox/deleteEmail usadas por imports antigos.
 * Dependencias criticas: EmailService modular do dominio de email.
 */

const EmailService = require('./email/EmailService');

/**
 * O que faz: lista emails da inbox mantendo assinatura legada.
 * Onde e usada: imports antigos de InboxService.fetchInbox.
 * Dependencias chamadas: EmailService.getInboxEmails.
 * Efeitos colaterais: leitura no provedor IMAP.
 */
async function fetchInbox(limit = 20) {
    return EmailService.getInboxEmails({ limit });
}

/**
 * O que faz: remove email da inbox mantendo assinatura legada.
 * Onde e usada: imports antigos de InboxService.deleteEmail.
 * Dependencias chamadas: EmailService.deleteInboxEmail.
 * Efeitos colaterais: remocao de email na caixa IMAP.
 */
async function deleteEmail(emailId) {
    return EmailService.deleteInboxEmail({ emailId });
}

module.exports = { fetchInbox, deleteEmail };
