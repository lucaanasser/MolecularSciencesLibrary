/**
 * Responsabilidade: comandos de escrita do forum (criar pergunta, criar resposta, aceitar resposta).
 * Camada: service.
 * Entradas/Saidas: recebe payloads de pergunta/resposta; retorna ids e flag de aceite.
 * Dependencias criticas: ForumModel, modulo de notificacoes (siblings de prototype) e logger padronizado.
 */

const ForumModel = require('../../../../models/academic/forum/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria uma pergunta e assina o autor na propria pergunta.
     * Onde e usada: fluxo de criacao de perguntas do forum.
     * Dependencias chamadas: ForumModel.createQuestion, ForumModel.subscribe.
     * Efeitos colaterais: escrita em DB.
     */
    async createQuestion({ titulo, conteudo, autor_id, tags, is_anonymous = 0, disciplina_codigo = null }) {
        log.start('Criando pergunta');

        try {
            const questionId = await ForumModel.createQuestion({
                titulo,
                conteudo,
                autor_id,
                tags,
                is_anonymous,
                disciplina_codigo
            });

            // Autor passa a seguir a própria pergunta (recebe notificação de novas respostas)
            await ForumModel.subscribe(autor_id, questionId);

            log.success('Pergunta criada com sucesso', { questionId });
            return questionId;
        } catch (error) {
            log.error('Erro ao criar pergunta', { error: error.message });
            throw error;
        }
    },

    /**
     * O que faz: cria uma resposta, notifica seguidores da pergunta e assina o autor da resposta.
     * Onde e usada: fluxo de criacao de respostas do forum.
     * Dependencias chamadas: ForumModel.createAnswer, this.notifyNewAnswer, ForumModel.subscribe.
     * Efeitos colaterais: escrita em DB e disparo de notificacoes.
     */
    async createAnswer({ question_id, conteudo, autor_id, questionAutorId, is_anonymous = 0 }) {
        log.start('Criando resposta para pergunta', { question_id });

        try {
            const answerId = await ForumModel.createAnswer({
                question_id,
                conteudo,
                autor_id,
                is_anonymous
            });

            // Notifica os seguidores da pergunta (inclui o autor); quem respondeu passa a seguir
            await this.notifyNewAnswer(questionAutorId, question_id, autor_id);
            await ForumModel.subscribe(autor_id, question_id);

            log.success('Resposta criada com sucesso', { answerId });
            return answerId;
        } catch (error) {
            log.error('Erro ao criar resposta', { error: error.message });
            throw error;
        }
    },

    /**
     * O que faz: aceita/desaceita uma resposta e notifica o autor quando o aceite ocorre.
     * Onde e usada: fluxo de aceite de respostas do forum.
     * Dependencias chamadas: ForumModel.toggleAcceptAnswer, this.notifyAnswerAccepted.
     * Efeitos colaterais: escrita em DB e disparo de notificacao.
     */
    async acceptAnswer(answerId, questionId, answerAutorId) {
        log.start('Aceitando resposta', { answerId });

        try {
            const isNowAccepted = await ForumModel.toggleAcceptAnswer(answerId, questionId);

            // Notificar autor da resposta que foi aceita
            if (isNowAccepted) {
                await this.notifyAnswerAccepted(answerAutorId, questionId, answerId);
            }

            log.success(isNowAccepted ? 'Resposta aceita' : 'Resposta desaceita');
            return isNowAccepted;
        } catch (error) {
            log.error('Erro ao aceitar resposta', { error: error.message });
            throw error;
        }
    }
};
