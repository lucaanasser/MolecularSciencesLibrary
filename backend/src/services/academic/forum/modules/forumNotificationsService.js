/**
 * Responsabilidade: notificacoes do forum (nova resposta e resposta aceita).
 * Camada: service.
 * Entradas/Saidas: recebe ids de pergunta/resposta/autores; grava notificacoes de forum.
 * Dependencias criticas: ForumModel, NotificationsModel, getQuery (db) e logger padronizado.
 */

const ForumModel = require('../../../../models/academic/forum/ForumModel');
const NotificationsModel = require('../../../../models/utilities/NotificationsModel');
const { getQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: notifica seguidores da pergunta (inclui o autor) sobre uma nova resposta.
     * Onde e usada: chamada por createAnswer no modulo de escrita.
     * Dependencias chamadas: ForumModel.getQuestionById, getQuery, ForumModel.getSubscriberIds, NotificationsModel.createNotification.
     * Efeitos colaterais: escrita de notificacoes; nao propaga erro para nao falhar a operacao principal.
     */
    async notifyNewAnswer(questionAutorId, questionId, answerAutorId) {
        log.start('Notificando nova resposta');

        try {
            // Buscar dados para a notificação
            const question = await ForumModel.getQuestionById(questionId);
            const answerAutor = await getQuery('SELECT name FROM users WHERE id = ?', [answerAutorId]);

            if (!question || !answerAutor) {
                log.warn('Dados nao encontrados para notificacao');
                return;
            }

            const truncatedTitle = question.titulo.length > 50
                ? question.titulo.substring(0, 50) + '...'
                : question.titulo;

            // Destinatários: seguidores da pergunta + autor (compat. perguntas antigas), exceto quem respondeu
            const subscriberIds = await ForumModel.getSubscriberIds(questionId);
            const recipients = new Set([questionAutorId, ...subscriberIds]);
            recipients.delete(answerAutorId);

            for (const userId of recipients) {
                await NotificationsModel.createNotification({
                    user_id: userId,
                    type: 'forum_answer',
                    message: `${answerAutor.name} respondeu a pergunta: "${truncatedTitle}"`,
                    metadata: {
                        questionId,
                        answerAutorId,
                        answerAutorName: answerAutor.name
                    },
                    status: 'unread'
                });
            }

            log.success('Notificacoes de nova resposta criadas', { recipients: recipients.size });
        } catch (error) {
            // Não falhar a operação principal se notificação falhar
            log.error('Erro ao criar notificacao de nova resposta', { error: error.message });
        }
    },

    /**
     * O que faz: notifica o autor da resposta que ela foi aceita.
     * Onde e usada: chamada por acceptAnswer no modulo de escrita.
     * Dependencias chamadas: ForumModel.getQuestionById, NotificationsModel.createNotification.
     * Efeitos colaterais: escrita de notificacao; nao propaga erro para nao falhar a operacao principal.
     */
    async notifyAnswerAccepted(answerAutorId, questionId, answerId) {
        log.start('Notificando resposta aceita');

        try {
            const question = await ForumModel.getQuestionById(questionId);

            if (!question) {
                log.warn('Pergunta nao encontrada para notificacao');
                return;
            }

            const truncatedTitle = question.titulo.length > 50
                ? question.titulo.substring(0, 50) + '...'
                : question.titulo;

            await NotificationsModel.createNotification({
                user_id: answerAutorId,
                type: 'forum_accepted',
                message: `Sua resposta foi aceita em: "${truncatedTitle}"`,
                metadata: {
                    questionId,
                    answerId,
                    questionAutorId: question.autor_id
                },
                status: 'unread'
            });

            log.success('Notificacao de resposta aceita criada');
        } catch (error) {
            // Não falhar a operação principal se notificação falhar
            log.error('Erro ao criar notificacao de resposta aceita', { error: error.message });
        }
    }
};
