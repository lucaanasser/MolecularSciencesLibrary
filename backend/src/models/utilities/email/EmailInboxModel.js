/**
 * Responsabilidade: persistencia/infra de acesso IMAP da caixa de email.
 * Camada: model.
 * Entradas/Saidas: busca e remove emails por UID na inbox configurada.
 * Dependencias criticas: imap-simple e logger compartilhado.
 */

const imaps = require('imap-simple');
const { getLogger } = require('../../../shared/logging/logger');

const log = getLogger(__filename);

class EmailInboxModel {
    /**
     * O que faz: cria objeto de configuracao IMAP a partir do ambiente.
     * Onde e usada: internamente por fetchInbox e deleteEmail.
     * Dependencias chamadas: nenhuma externa alem de process.env.
     * Efeitos colaterais: nenhum.
     */
    _getConfig() {
        return {
            imap: {
                user: process.env.GMAIL_USER,
                password: process.env.GMAIL_PASS,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 10000,
                tlsOptions: {
                    rejectUnauthorized: false,
                    checkServerIdentity: () => undefined
                }
            }
        };
    }

    /**
     * O que faz: abre conexao IMAP e retorna handle conectado na inbox.
     * Onde e usada: internamente por operacoes de leitura e exclusao.
     * Dependencias chamadas: imap-simple.connect e openBox.
     * Efeitos colaterais: abre conexao de rede com servidor IMAP.
     */
    async _openConnection() {
        const connection = await imaps.connect(this._getConfig());
        await connection.openBox('INBOX');
        return connection;
    }

    /**
     * O que faz: lista emails recentes da inbox com cabecalho e corpo.
     * Onde e usada: EmailService.getInboxEmails.
     * Dependencias chamadas: _openConnection e connection.search.
     * Efeitos colaterais: consulta servidor IMAP.
     */
    async fetchInbox(limit = 20) {
        const connection = await this._openConnection();

        try {
            const searchCriteria = ['ALL'];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: false,
                struct: true
            };

            const messages = await connection.search(searchCriteria, fetchOptions);

            const emails = await Promise.all(
                messages.slice(-limit).reverse().map(async (item) => {
                    const all = item.parts.find((part) => part.which === 'HEADER');
                    const id = item.attributes.uid;
                    const subject = all?.body?.subject?.[0] || '';
                    const from = all?.body?.from?.[0] || '';
                    const date = all?.body?.date?.[0] || '';

                    let body = '';
                    try {
                        const raw = item.parts.find((part) => part.which === 'TEXT');
                        if (raw?.body) {
                            if (typeof raw.body === 'string') {
                                body = raw.body;
                            } else if (Buffer.isBuffer(raw.body)) {
                                body = raw.body.toString('utf8');
                            } else if (raw.body.data) {
                                body = typeof raw.body.data === 'string' ? raw.body.data : String(raw.body.data);
                            } else {
                                body = String(raw.body);
                            }
                        }
                    } catch (parseError) {
                        log.warn('Falha ao converter corpo de email; seguindo com body vazio', { err: parseError.message, email_id: id });
                    }

                    return { id, subject, from, date, body };
                })
            );

            return emails;
        } catch (error) {
            log.error('Falha ao consultar inbox no provedor IMAP', { err: error.message });
            throw error;
        } finally {
            await connection.end();
        }
    }

    /**
     * O que faz: remove um email da inbox por UID.
     * Onde e usada: EmailService.deleteInboxEmail.
     * Dependencias chamadas: _openConnection, addFlags e expunge.
     * Efeitos colaterais: remove email da caixa do provedor IMAP.
     */
    async deleteEmail(emailId) {
        const connection = await this._openConnection();

        try {
            await connection.addFlags(emailId, ['\\Deleted']);

            await new Promise((resolve, reject) => {
                connection.imap.expunge((err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });

            return { success: true };
        } catch (error) {
            log.error('Falha ao remover email da inbox no provedor IMAP', { email_id: emailId, err: error.message });
            throw error;
        } finally {
            await connection.end();
        }
    }
}

module.exports = new EmailInboxModel();
