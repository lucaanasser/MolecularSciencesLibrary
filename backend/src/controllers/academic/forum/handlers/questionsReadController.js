/**
 * Responsabilidade: handlers HTTP de leitura de perguntas do Fórum.
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints GET de perguntas; formata as respostas.
 * Dependencias criticas: ForumModel, logger padronizado e helper this.formatQuestionRow (prototype).
 */

const ForumModel = require('../../../../models/academic/forum/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Lista perguntas com filtros
     * GET /api/forum/questions
     */
    async getQuestions(req, res) {
        try {
            log.start('GET /questions - Listar perguntas');

            const {
                sortBy = 'recente',
                search = '',
                tag,
                tagId,
                disciplina,
                autor,
                page = 1,
                limit = 20
            } = req.query;

            const questions = await ForumModel.getQuestions({
                sortBy,
                search,
                tagId: tagId ? Number(tagId) : null,
                tagName: tag || null,
                disciplina: disciplina || null,
                autorId: autor ? Number(autor) : null,
                page: Number(page),
                limit: Number(limit)
            });

            const total = await ForumModel.countQuestions({
                search,
                tagId: tagId ? Number(tagId) : null,
                tagName: tag || null,
                disciplina: disciplina || null,
                autorId: autor ? Number(autor) : null,
                sortBy
            });

            // Se usuário logado, buscar votos dele nas perguntas
            let userVotes = {};
            if (req.user) {
                const questionIds = questions.map(q => q.id);
                userVotes = await ForumModel.getUserVotes(req.user.id, 'question', questionIds);
            }

            // Verificar se usuário é admin
            const isAdmin = req.user && req.user.role === 'admin';

            // Formatar resposta
            const formattedQuestions = questions.map(q => this.formatQuestionRow(q, userVotes, isAdmin));

            log.success('Perguntas retornadas', { total: formattedQuestions.length });

            res.json({
                questions: formattedQuestions,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            log.error('Erro ao listar perguntas', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar perguntas', details: error.message });
        }
    },

    /**
     * Busca pergunta por ID
     * GET /api/forum/questions/:id
     */
    async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            log.start('GET /questions/:id - Buscar pergunta', { id });

            const question = await ForumModel.getQuestionById(Number(id));

            if (!question) {
                log.warn('Pergunta não encontrada', { id });
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            // Incrementar views
            await ForumModel.incrementViews(Number(id));

            // Buscar respostas
            const answers = await ForumModel.getAnswersByQuestion(Number(id));

            // Se usuário logado, buscar votos
            let userQuestionVote = 0;
            let userAnswerVotes = {};
            if (req.user) {
                userQuestionVote = await ForumModel.getUserVote(req.user.id, 'question', Number(id));
                const answerIds = answers.map(a => a.id);
                userAnswerVotes = await ForumModel.getUserVotes(req.user.id, 'answer', answerIds);
            }

            // Verificar se usuário é admin
            const isAdmin = req.user && req.user.role === 'admin';

            // Comentários da pergunta e de todas as respostas (uma query) + agrupamento
            const allComments = await ForumModel.getCommentsForQuestion(Number(id));
            const formatComment = (c) => ({
                id: c.id,
                content: c.conteudo,
                user_id: c.autor_id,
                user_name: c.autor_nome,
                created_at: c.created_at
            });
            const questionComments = allComments
                .filter(c => c.target_type === 'question' && c.target_id === Number(id))
                .map(formatComment);
            const commentsByAnswer = {};
            for (const c of allComments) {
                if (c.target_type === 'answer') {
                    (commentsByAnswer[c.target_id] = commentsByAnswer[c.target_id] || []).push(formatComment(c));
                }
            }

            // Está seguindo / favoritou a pergunta?
            const isSubscribed = req.user ? await ForumModel.isSubscribed(req.user.id, Number(id)) : false;
            const isBookmarked = req.user ? await ForumModel.isBookmarked(req.user.id, Number(id)) : false;

            // Formatar resposta
            const formattedQuestion = {
                id: question.id,
                title: question.titulo,
                content: question.conteudo,
                user_id: question.autor_id,
                user_name: question.is_anonymous && !isAdmin ? 'Anônimo' : question.autor_nome,
                user_image: question.is_anonymous && !isAdmin ? null : question.autor_imagem,
                is_anonymous: question.is_anonymous,
                view_count: question.views + 1, // +1 pelo incremento
                vote_count: question.votos,
                tags: question.tags,
                has_accepted_answer: question.tem_resposta_aceita > 0,
                created_at: question.created_at,
                updated_at: question.updated_at,
                is_closed: question.is_closed === 1,
                is_pinned: question.is_pinned === 1,
                disciplina_codigo: question.disciplina_codigo || null,
                disciplina_nome: question.disciplina_nome || null,
                is_subscribed: isSubscribed,
                is_bookmarked: isBookmarked,
                comments: questionComments,
                user_vote: userQuestionVote,
                answers: answers.map(a => ({
                    id: a.id,
                    content: a.conteudo,
                    user_id: a.autor_id,
                    user_name: a.is_anonymous && !isAdmin ? 'Anônimo' : a.autor_nome,
                    user_image: a.is_anonymous && !isAdmin ? null : a.autor_imagem,
                    is_anonymous: a.is_anonymous,
                    vote_count: a.votos,
                    is_accepted: a.is_accepted === 1,
                    created_at: a.created_at,
                    updated_at: a.updated_at,
                    user_vote: userAnswerVotes[a.id] || 0,
                    comments: commentsByAnswer[a.id] || []
                }))
            };

            log.success('Pergunta encontrada', { titulo: question.titulo });
            res.json(formattedQuestion);
        } catch (error) {
            log.error('Erro ao buscar pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar pergunta', details: error.message });
        }
    }
};
