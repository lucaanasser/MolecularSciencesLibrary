/**
 * Responsabilidade: handlers HTTP de engajamento do Fórum (comentários, seguir, salvar e conteúdo do usuário).
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints de comentários/subscrição/favoritos/respostas do usuário.
 * Dependencias criticas: ForumModel, logger padronizado, helper this.formatQuestionRow (prototype)
 *                        e db.getQuery (require inline em createComment).
 */

const ForumModel = require('../../../../models/academic/forum/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Cria um comentário em uma pergunta ou resposta (autenticado)
     * POST /api/forum/comments
     */
    async createComment(req, res) {
        try {
            const { target_type, target_id, conteudo } = req.body;

            if (!['question', 'answer'].includes(target_type)) {
                return res.status(400).json({ error: 'Tipo de alvo inválido' });
            }
            if (!target_id) {
                return res.status(400).json({ error: 'Alvo não informado' });
            }
            if (!conteudo || conteudo.trim().length < 2) {
                return res.status(400).json({ error: 'Comentário muito curto (mínimo 2 caracteres)' });
            }

            const commentId = await ForumModel.createComment({
                target_type,
                target_id: Number(target_id),
                autor_id: req.user.id,
                conteudo: conteudo.trim()
            });

            const { getQuery } = require('../../../../database/db');
            const author = await getQuery('SELECT name FROM users WHERE id = ?', [req.user.id]);

            res.status(201).json({
                id: commentId,
                content: conteudo.trim(),
                user_id: req.user.id,
                user_name: author ? author.name : 'Usuário',
                created_at: new Date().toISOString()
            });
        } catch (error) {
            log.error('Erro ao criar comentário', { error: error.message });
            res.status(500).json({ error: 'Erro ao criar comentário', details: error.message });
        }
    },

    /**
     * Remove um comentário (autor ou admin)
     * DELETE /api/forum/comments/:id
     */
    async deleteComment(req, res) {
        try {
            const { id } = req.params;
            const comment = await ForumModel.getCommentById(Number(id));

            if (!comment) {
                return res.status(404).json({ error: 'Comentário não encontrado' });
            }

            const isAdmin = req.user.role === 'admin';
            const isAuthor = comment.autor_id === req.user.id;
            if (!isAdmin && !isAuthor) {
                return res.status(403).json({ error: 'Você não tem permissão para remover este comentário' });
            }

            await ForumModel.deleteComment(Number(id));
            res.json({ success: true, message: 'Comentário removido' });
        } catch (error) {
            log.error('Erro ao remover comentário', { error: error.message });
            res.status(500).json({ error: 'Erro ao remover comentário', details: error.message });
        }
    },

    /**
     * Segue/deixa de seguir uma pergunta (autenticado)
     * POST /api/forum/questions/:id/subscribe
     */
    async toggleSubscription(req, res) {
        try {
            const { id } = req.params;
            const question = await ForumModel.getQuestionById(Number(id));
            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            const already = await ForumModel.isSubscribed(req.user.id, Number(id));
            if (already) {
                await ForumModel.unsubscribe(req.user.id, Number(id));
            } else {
                await ForumModel.subscribe(req.user.id, Number(id));
            }

            res.json({
                success: true,
                is_subscribed: !already,
                message: already ? 'Você deixou de seguir esta pergunta' : 'Você está seguindo esta pergunta'
            });
        } catch (error) {
            log.error('Erro ao seguir pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao seguir pergunta', details: error.message });
        }
    },

    /**
     * Salva/remove uma pergunta dos favoritos (autenticado)
     * POST /api/forum/questions/:id/bookmark
     */
    async toggleBookmark(req, res) {
        try {
            const { id } = req.params;
            const question = await ForumModel.getQuestionById(Number(id));
            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            const already = await ForumModel.isBookmarked(req.user.id, Number(id));
            if (already) {
                await ForumModel.removeBookmark(req.user.id, Number(id));
            } else {
                await ForumModel.addBookmark(req.user.id, Number(id));
            }

            res.json({
                success: true,
                is_bookmarked: !already,
                message: already ? 'Removido dos salvos' : 'Pergunta salva!'
            });
        } catch (error) {
            log.error('Erro ao favoritar pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao favoritar pergunta', details: error.message });
        }
    },

    /**
     * Lista as perguntas salvas do usuário logado
     * GET /api/forum/bookmarks
     */
    async getMyBookmarks(req, res) {
        try {
            const questions = await ForumModel.getBookmarkedQuestions(req.user.id);
            const userVotes = questions.length
                ? await ForumModel.getUserVotes(req.user.id, 'question', questions.map(q => q.id))
                : {};
            const isAdmin = req.user.role === 'admin';
            res.json(questions.map(q => this.formatQuestionRow(q, userVotes, isAdmin)));
        } catch (error) {
            log.error('Erro ao buscar favoritos', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar favoritos', details: error.message });
        }
    },

    /**
     * Lista as respostas de um usuário (com título da pergunta)
     * GET /api/forum/users/:id/answers
     */
    async getUserAnswers(req, res) {
        try {
            const { id } = req.params;
            const answers = await ForumModel.getAnswersByUser(Number(id));

            const formatted = answers.map(a => ({
                id: a.id,
                question_id: a.question_id,
                question_title: a.question_titulo,
                content: a.conteudo,
                vote_count: a.votos,
                is_accepted: a.is_accepted === 1,
                is_anonymous: a.is_anonymous,
                created_at: a.created_at
            }));

            res.json(formatted);
        } catch (error) {
            log.error('Erro ao buscar respostas do usuário', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar respostas', details: error.message });
        }
    }
};
