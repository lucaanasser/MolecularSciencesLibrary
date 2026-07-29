/**
 * Responsabilidade: engajamento no forum - comentarios (polimorficos), inscricoes e favoritos (bookmarks).
 * Camada: model.
 * Entradas/Saidas: ids de usuario/pergunta/resposta e payloads de comentario; retorna ids, linhas e flags.
 * Dependencias criticas: db (executeQuery/getQuery/allQuery), logger e modulos irmaos via prototype (this.<sibling>).
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    // ----- COMMENTS - Comentarios em perguntas/respostas -----

    /**
     * O que faz: cria um comentario polimorfico (em pergunta ou resposta).
     * Onde e usada: ForumService ao comentar.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere linha em forum_comments.
     */
    async createComment({ target_type, target_id, autor_id, conteudo }) {
        log.start('Criando comentario', { target_type, target_id, autor_id });
        const { lastID } = await executeQuery(
            `INSERT INTO forum_comments (target_type, target_id, autor_id, conteudo, created_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [target_type, target_id, autor_id, conteudo]
        );
        return lastID;
    },

    /**
     * O que faz: busca um comentario por ID.
     * Onde e usada: validacoes de permissao ao deletar comentario.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getCommentById(id) {
        return await getQuery('SELECT * FROM forum_comments WHERE id = ?', [id]);
    },

    /**
     * O que faz: lista os comentarios da pergunta e de todas as suas respostas em uma unica query.
     * Onde e usada: ForumController ao exibir uma pergunta.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getCommentsForQuestion(questionId) {
        return await allQuery(
            `SELECT c.*, u.name as autor_nome
             FROM forum_comments c
             JOIN users u ON c.autor_id = u.id
             WHERE (c.target_type = 'question' AND c.target_id = ?)
                OR (c.target_type = 'answer' AND c.target_id IN (SELECT id FROM forum_answers WHERE question_id = ?))
             ORDER BY c.created_at ASC`,
            [questionId, questionId]
        );
    },

    /**
     * O que faz: deleta um comentario por ID.
     * Onde e usada: ForumService ao remover comentario.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: deleta linha em forum_comments.
     */
    async deleteComment(id) {
        await executeQuery('DELETE FROM forum_comments WHERE id = ?', [id]);
        return true;
    },

    // ----- SUBSCRIPTIONS - Seguir perguntas -----

    /**
     * O que faz: inscreve o usuario para seguir uma pergunta (idempotente).
     * Onde e usada: ForumService ao criar pergunta/resposta e ao seguir.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere linha em forum_subscriptions.
     */
    async subscribe(userId, questionId) {
        await executeQuery(
            'INSERT OR IGNORE INTO forum_subscriptions (user_id, question_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [userId, questionId]
        );
        return true;
    },

    /**
     * O que faz: remove a inscricao do usuario em uma pergunta.
     * Onde e usada: ForumService ao deixar de seguir.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: deleta linha em forum_subscriptions.
     */
    async unsubscribe(userId, questionId) {
        await executeQuery(
            'DELETE FROM forum_subscriptions WHERE user_id = ? AND question_id = ?',
            [userId, questionId]
        );
        return true;
    },

    /**
     * O que faz: verifica se o usuario segue uma pergunta.
     * Onde e usada: ForumController ao montar o estado da pergunta.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async isSubscribed(userId, questionId) {
        const row = await getQuery(
            'SELECT 1 FROM forum_subscriptions WHERE user_id = ? AND question_id = ?',
            [userId, questionId]
        );
        return !!row;
    },

    /**
     * O que faz: retorna os ids dos usuarios inscritos em uma pergunta.
     * Onde e usada: envio de notificacoes de novas respostas.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getSubscriberIds(questionId) {
        const rows = await allQuery(
            'SELECT user_id FROM forum_subscriptions WHERE question_id = ?',
            [questionId]
        );
        return rows.map(r => r.user_id);
    },

    // ----- BOOKMARKS - Favoritos -----

    /**
     * O que faz: adiciona uma pergunta aos favoritos do usuario (idempotente).
     * Onde e usada: ForumService ao favoritar.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere linha em forum_bookmarks.
     */
    async addBookmark(userId, questionId) {
        await executeQuery(
            'INSERT OR IGNORE INTO forum_bookmarks (user_id, question_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [userId, questionId]
        );
        return true;
    },

    /**
     * O que faz: remove uma pergunta dos favoritos do usuario.
     * Onde e usada: ForumService ao desfavoritar.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: deleta linha em forum_bookmarks.
     */
    async removeBookmark(userId, questionId) {
        await executeQuery(
            'DELETE FROM forum_bookmarks WHERE user_id = ? AND question_id = ?',
            [userId, questionId]
        );
        return true;
    },

    /**
     * O que faz: verifica se uma pergunta esta nos favoritos do usuario.
     * Onde e usada: ForumController ao montar o estado da pergunta.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async isBookmarked(userId, questionId) {
        const row = await getQuery(
            'SELECT 1 FROM forum_bookmarks WHERE user_id = ? AND question_id = ?',
            [userId, questionId]
        );
        return !!row;
    },

    /**
     * O que faz: lista as perguntas favoritadas por um usuario (mesma forma de linha que getQuestions) com tags anexadas.
     * Onde e usada: pagina de favoritos do usuario.
     * Dependencias chamadas: allQuery, this.getQuestionTags.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getBookmarkedQuestions(userId) {
        const questions = await allQuery(
            `SELECT q.*, u.name as autor_nome, u.profile_image as autor_imagem, d.nome as disciplina_nome,
                (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
                (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
             FROM forum_questions q
             JOIN users u ON q.autor_id = u.id
             LEFT JOIN disciplines d ON q.disciplina_codigo = d.codigo
             JOIN forum_bookmarks b ON b.question_id = q.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [userId]
        );
        for (const question of questions) {
            question.tags = await this.getQuestionTags(question.id);
        }
        return questions;
    }
};
