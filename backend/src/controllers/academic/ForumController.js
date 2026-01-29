const ForumService = require('../../services/academic/ForumService');
const ForumModel = require('../../models/academic/ForumModel');

/**
 * Controller para o Fórum - Stack UnderFlow
 * Gerencia endpoints de perguntas, respostas, tags e votos.
 * Admin (role='admin') tem poderes de moderação.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class ForumController {
    // =====================================================
    // QUESTIONS - Perguntas
    // =====================================================

    /**
     * Lista perguntas com filtros
     * GET /api/forum/questions
     */
    async getQuestions(req, res) {
        try {
            console.log("🔵 [ForumController] GET /questions - Listar perguntas");
            
            const { 
                sortBy = 'recente', 
                search = '', 
                tag,
                tagId,
                page = 1, 
                limit = 20 
            } = req.query;

            const questions = await ForumModel.getQuestions({
                sortBy,
                search,
                tagId: tagId ? Number(tagId) : null,
                tagName: tag || null,
                page: Number(page),
                limit: Number(limit)
            });

            const total = await ForumModel.countQuestions({
                search,
                tagId: tagId ? Number(tagId) : null,
                tagName: tag || null,
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
            const formattedQuestions = questions.map(q => ({
                id: q.id,
                title: q.titulo,
                content: q.conteudo,
                user_id: q.autor_id,
                user_name: q.is_anonymous && !isAdmin ? 'Anônimo' : q.autor_nome,
                user_image: q.is_anonymous && !isAdmin ? null : q.autor_imagem,
                is_anonymous: q.is_anonymous,
                view_count: q.views,
                answer_count: q.respostas_count,
                vote_count: q.votos,
                tags: q.tags,
                has_accepted_answer: q.tem_resposta_aceita === 1 || q.tem_resposta_aceita === true,
                created_at: q.created_at,
                user_vote: userVotes[q.id] || 0
            }));

            console.log("🟢 [ForumController] Perguntas retornadas:", formattedQuestions.length);
            
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
            console.error("🔴 [ForumController] Erro ao listar perguntas:", error.message);
            res.status(500).json({ error: 'Erro ao buscar perguntas', details: error.message });
        }
    }

    /**
     * Busca pergunta por ID
     * GET /api/forum/questions/:id
     */
    async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [ForumController] GET /questions/:id - Buscar pergunta:", id);

            const question = await ForumModel.getQuestionById(Number(id));

            if (!question) {
                console.log("🟡 [ForumController] Pergunta não encontrada:", id);
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
                    user_vote: userAnswerVotes[a.id] || 0
                }))
            };

            console.log("🟢 [ForumController] Pergunta encontrada:", question.titulo);
            res.json(formattedQuestion);
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao buscar pergunta:", error.message);
            res.status(500).json({ error: 'Erro ao buscar pergunta', details: error.message });
        }
    }

    /**
     * Cria nova pergunta
     * POST /api/forum/questions
     */
    async createQuestion(req, res) {
        try {
            console.log("🔵 [ForumController] POST /questions - Criar pergunta");

            const { titulo, conteudo, tags = [], is_anonymous = false } = req.body;
            const autor_id = req.user.id;

            // Validações básicas
            if (!titulo || titulo.trim().length < 10) {
                return res.status(400).json({ error: 'Título deve ter pelo menos 10 caracteres' });
            }
            if (!conteudo || conteudo.trim().length < 20) {
                return res.status(400).json({ error: 'Conteúdo deve ter pelo menos 20 caracteres' });
            }
            if (titulo.length > 255) {
                return res.status(400).json({ error: 'Título deve ter no máximo 255 caracteres' });
            }

            const questionId = await ForumService.createQuestion({
                titulo: titulo.trim(),
                conteudo: conteudo.trim(),
                autor_id,
                tags,
                is_anonymous: is_anonymous ? 1 : 0
            });

            console.log("🟢 [ForumController] Pergunta criada:", questionId);
            res.status(201).json({ 
                success: true, 
                id: questionId,
                message: 'Pergunta criada com sucesso' 
            });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao criar pergunta:", error.message);
            res.status(500).json({ error: 'Erro ao criar pergunta', details: error.message });
        }
    }

    /**
     * Atualiza pergunta
     * PUT /api/forum/questions/:id
     */
    async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [ForumController] PUT /questions/:id - Atualizar pergunta:", id);

            const question = await ForumModel.getQuestionById(Number(id));

            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            // Verificar permissão: autor ou admin
            const isAdmin = req.user.role === 'admin';
            const isAuthor = question.autor_id === req.user.id;

            if (!isAdmin && !isAuthor) {
                console.log("🟡 [ForumController] Usuário sem permissão para editar");
                return res.status(403).json({ error: 'Você não tem permissão para editar esta pergunta' });
            }

            const { titulo, conteudo, tags } = req.body;

            // Validações
            if (titulo && titulo.trim().length < 10) {
                return res.status(400).json({ error: 'Título deve ter pelo menos 10 caracteres' });
            }
            if (conteudo && conteudo.trim().length < 20) {
                return res.status(400).json({ error: 'Conteúdo deve ter pelo menos 20 caracteres' });
            }

            await ForumModel.updateQuestion(Number(id), {
                titulo: titulo?.trim() || question.titulo,
                conteudo: conteudo?.trim() || question.conteudo,
                tags
            });

            console.log("🟢 [ForumController] Pergunta atualizada");
            res.json({ success: true, message: 'Pergunta atualizada com sucesso' });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao atualizar pergunta:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar pergunta', details: error.message });
        }
    }

    /**
     * Deleta pergunta (autor ou admin)
     * DELETE /api/forum/questions/:id
     */
    async deleteQuestion(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [ForumController] DELETE /questions/:id - Deletar pergunta:", id);

            const question = await ForumModel.getQuestionById(Number(id));

            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            // Verificar permissão: autor ou admin
            const isAdmin = req.user.role === 'admin';
            const isAuthor = question.autor_id === req.user.id;

            if (!isAdmin && !isAuthor) {
                console.log("🟡 [ForumController] Usuário sem permissão para deletar");
                return res.status(403).json({ error: 'Você não tem permissão para deletar esta pergunta' });
            }

            await ForumModel.deleteQuestion(Number(id));

            console.log("🟢 [ForumController] Pergunta deletada");
            res.json({ success: true, message: 'Pergunta deletada com sucesso' });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao deletar pergunta:", error.message);
            res.status(500).json({ error: 'Erro ao deletar pergunta', details: error.message });
        }
    }

    // =====================================================
    // ANSWERS - Respostas
    // =====================================================

    /**
     * Cria resposta para uma pergunta
     * POST /api/forum/questions/:id/answers
     */
    async createAnswer(req, res) {
        try {
            const { id: questionId } = req.params;
            console.log("🔵 [ForumController] POST /questions/:id/answers - Criar resposta");

            const { conteudo, is_anonymous = false } = req.body;
            const autor_id = req.user.id;

            // Validação
            if (!conteudo || conteudo.trim().length < 10) {
                return res.status(400).json({ error: 'Resposta deve ter pelo menos 10 caracteres' });
            }

            // Verificar se pergunta existe
            const question = await ForumModel.getQuestionById(Number(questionId));
            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            const answerId = await ForumService.createAnswer({
                question_id: Number(questionId),
                conteudo: conteudo.trim(),
                autor_id,
                questionAutorId: question.autor_id,
                is_anonymous: is_anonymous ? 1 : 0
            });

            console.log("🟢 [ForumController] Resposta criada:", answerId);
            res.status(201).json({ 
                success: true, 
                id: answerId,
                message: 'Resposta criada com sucesso' 
            });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao criar resposta:", error.message);
            res.status(500).json({ error: 'Erro ao criar resposta', details: error.message });
        }
    }

    /**
     * Atualiza resposta
     * PUT /api/forum/answers/:id
     */
    async updateAnswer(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [ForumController] PUT /answers/:id - Atualizar resposta:", id);

            const answer = await ForumModel.getAnswerById(Number(id));

            if (!answer) {
                return res.status(404).json({ error: 'Resposta não encontrada' });
            }

            // Verificar permissão: autor ou admin
            const isAdmin = req.user.role === 'admin';
            const isAuthor = answer.autor_id === req.user.id;

            if (!isAdmin && !isAuthor) {
                console.log("🟡 [ForumController] Usuário sem permissão para editar");
                return res.status(403).json({ error: 'Você não tem permissão para editar esta resposta' });
            }

            const { conteudo } = req.body;

            if (!conteudo || conteudo.trim().length < 10) {
                return res.status(400).json({ error: 'Resposta deve ter pelo menos 10 caracteres' });
            }

            await ForumModel.updateAnswer(Number(id), { conteudo: conteudo.trim() });

            console.log("🟢 [ForumController] Resposta atualizada");
            res.json({ success: true, message: 'Resposta atualizada com sucesso' });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao atualizar resposta:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar resposta', details: error.message });
        }
    }

    /**
     * Deleta resposta (autor ou admin)
     * DELETE /api/forum/answers/:id
     */
    async deleteAnswer(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [ForumController] DELETE /answers/:id - Deletar resposta:", id);

            const answer = await ForumModel.getAnswerById(Number(id));

            if (!answer) {
                return res.status(404).json({ error: 'Resposta não encontrada' });
            }

            // Verificar permissão: autor ou admin
            const isAdmin = req.user.role === 'admin';
            const isAuthor = answer.autor_id === req.user.id;

            if (!isAdmin && !isAuthor) {
                console.log("🟡 [ForumController] Usuário sem permissão para deletar");
                return res.status(403).json({ error: 'Você não tem permissão para deletar esta resposta' });
            }

            await ForumModel.deleteAnswer(Number(id));

            console.log("🟢 [ForumController] Resposta deletada");
            res.json({ success: true, message: 'Resposta deletada com sucesso' });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao deletar resposta:", error.message);
            res.status(500).json({ error: 'Erro ao deletar resposta', details: error.message });
        }
    }

    /**
     * Aceita/desaceita uma resposta
     * POST /api/forum/answers/:id/accept
     */
    async acceptAnswer(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [ForumController] POST /answers/:id/accept - Aceitar resposta:", id);

            const answer = await ForumModel.getAnswerById(Number(id));

            if (!answer) {
                return res.status(404).json({ error: 'Resposta não encontrada' });
            }

            // Buscar pergunta para verificar permissão
            const question = await ForumModel.getQuestionById(answer.question_id);

            // Verificar permissão: autor da pergunta ou admin
            const isAdmin = req.user.role === 'admin';
            const isQuestionAuthor = question.autor_id === req.user.id;

            if (!isAdmin && !isQuestionAuthor) {
                console.log("🟡 [ForumController] Usuário sem permissão para aceitar resposta");
                return res.status(403).json({ error: 'Apenas o autor da pergunta ou admin pode aceitar respostas' });
            }

            const isNowAccepted = await ForumService.acceptAnswer(Number(id), answer.question_id, answer.autor_id);

            console.log("🟢 [ForumController] Resposta", isNowAccepted ? "aceita" : "desaceita");
            res.json({ 
                success: true, 
                isAccepted: isNowAccepted,
                message: isNowAccepted ? 'Resposta aceita' : 'Resposta desaceita' 
            });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao aceitar resposta:", error.message);
            res.status(500).json({ error: 'Erro ao aceitar resposta', details: error.message });
        }
    }

    // =====================================================
    // VOTES - Votos
    // =====================================================

    /**
     * Vota em uma pergunta
     * POST /api/forum/questions/:id/vote
     */
    async voteQuestion(req, res) {
        try {
            const { id } = req.params;
            const { voteType } = req.body; // 1 ou -1
            console.log("🔵 [ForumController] POST /questions/:id/vote - Votar em pergunta:", id, voteType);

            if (voteType !== 1 && voteType !== -1) {
                return res.status(400).json({ error: 'Tipo de voto inválido. Use 1 ou -1' });
            }

            // Verificar se pergunta existe
            const question = await ForumModel.getQuestionById(Number(id));
            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            // Não pode votar na própria pergunta
            if (question.autor_id === req.user.id) {
                return res.status(403).json({ error: 'Você não pode votar na própria pergunta' });
            }

            const voteDiff = await ForumModel.vote(req.user.id, 'question', Number(id), voteType);
            const newVoteCount = question.votos + voteDiff;

            console.log("🟢 [ForumController] Voto registrado, novo total:", newVoteCount);
            res.json({ 
                success: true, 
                votos: newVoteCount,
                userVote: voteDiff === 0 ? 0 : (voteDiff > 0 ? voteType : 0)
            });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao votar em pergunta:", error.message);
            res.status(500).json({ error: 'Erro ao registrar voto', details: error.message });
        }
    }

    /**
     * Vota em uma resposta
     * POST /api/forum/answers/:id/vote
     */
    async voteAnswer(req, res) {
        try {
            const { id } = req.params;
            const { voteType } = req.body;
            console.log("🔵 [ForumController] POST /answers/:id/vote - Votar em resposta:", id, voteType);

            if (voteType !== 1 && voteType !== -1) {
                return res.status(400).json({ error: 'Tipo de voto inválido. Use 1 ou -1' });
            }

            // Verificar se resposta existe
            const answer = await ForumModel.getAnswerById(Number(id));
            if (!answer) {
                return res.status(404).json({ error: 'Resposta não encontrada' });
            }

            // Não pode votar na própria resposta
            if (answer.autor_id === req.user.id) {
                return res.status(403).json({ error: 'Você não pode votar na própria resposta' });
            }

            const voteDiff = await ForumModel.vote(req.user.id, 'answer', Number(id), voteType);
            const newVoteCount = answer.votos + voteDiff;

            console.log("🟢 [ForumController] Voto registrado, novo total:", newVoteCount);
            res.json({ 
                success: true, 
                votos: newVoteCount,
                userVote: voteDiff === 0 ? 0 : (voteDiff > 0 ? voteType : 0)
            });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao votar em resposta:", error.message);
            res.status(500).json({ error: 'Erro ao registrar voto', details: error.message });
        }
    }

    // =====================================================
    // TAGS - Tags
    // =====================================================

    /**
     * Lista todas as tags
     * GET /api/forum/tags
     */
    async getTags(req, res) {
        try {
            console.log("🔵 [ForumController] GET /tags - Listar tags");
            
            const tags = await ForumModel.getAllTags();

            console.log("🟢 [ForumController] Tags retornadas:", tags.length);
            res.json(tags);
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao listar tags:", error.message);
            res.status(500).json({ error: 'Erro ao buscar tags', details: error.message });
        }
    }

    /**
     * Lista tags populares
     * GET /api/forum/tags/popular
     */
    async getPopularTags(req, res) {
        try {
            console.log("🔵 [ForumController] GET /tags/popular - Listar tags populares");
            
            const { limit = 10 } = req.query;
            const tags = await ForumModel.getPopularTags(Number(limit));

            console.log("🟢 [ForumController] Tags populares retornadas:", tags.length);
            res.json(tags);
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao listar tags populares:", error.message);
            res.status(500).json({ error: 'Erro ao buscar tags', details: error.message });
        }
    }

    /**
     * Cria nova tag
     * POST /api/forum/tags
     */
    async createTag(req, res) {
        try {
            console.log("🔵 [ForumController] POST /tags - Criar nova tag");
            
            const { nome, topico, descricao } = req.body;
            const userId = req.user.id;

            // Validações
            if (!nome || nome.trim().length < 2) {
                return res.status(400).json({ error: 'Nome da tag deve ter pelo menos 2 caracteres' });
            }
            if (!topico) {
                return res.status(400).json({ error: 'Tópico é obrigatório' });
            }

            const tagId = await ForumModel.createTag({ nome, topico, descricao, userId });

            // Notificar admin sobre nova tag criada
            const NotificationsModel = require('../../models/utilities/NotificationsModel');
            const admins = await this.getAdminUsers();
            for (const admin of admins) {
                await NotificationsModel.createNotification({
                    user_id: admin.id,
                    type: 'forum_new_tag',
                    message: `O usuário ${req.user.name} criou a tag "${nome}" no tópico "${topico}". Valide ou remova se necessário.`,
                    metadata: { tag_id: tagId, tag_nome: nome, topico }
                });
            }

            console.log("🟢 [ForumController] Tag criada e notificações enviadas");
            res.status(201).json({ 
                id: tagId, 
                message: 'Tag criada com sucesso! Já está disponível para uso.' 
            });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao criar tag:", error.message);
            if (error.message === 'Tag já existe') {
                return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erro ao criar tag', details: error.message });
        }
    }

    /**
     * Lista tags pendentes (apenas admin)
     * GET /api/forum/tags/pending
     */
    async getPendingTags(req, res) {
        try {
            console.log("🔵 [ForumController] GET /tags/pending - Listar tags pendentes");
            
            // Verificar se é admin
            if (!this.isAdmin(req.user)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            const tags = await ForumModel.getPendingTags();

            console.log("🟢 [ForumController] Tags pendentes retornadas:", tags.length);
            res.json(tags);
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao listar tags pendentes:", error.message);
            res.status(500).json({ error: 'Erro ao buscar tags pendentes', details: error.message });
        }
    }

    /**
     * Aprova uma tag (apenas admin)
     * POST /api/forum/tags/:id/approve
     */
    async approveTag(req, res) {
        try {
            console.log("🔵 [ForumController] POST /tags/:id/approve - Aprovar tag");
            
            const { id } = req.params;

            // Verificar se é admin
            if (!this.isAdmin(req.user)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            await ForumModel.approveTag(id);

            console.log("🟢 [ForumController] Tag aprovada");
            res.json({ message: 'Tag aprovada com sucesso' });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao aprovar tag:", error.message);
            res.status(500).json({ error: 'Erro ao aprovar tag', details: error.message });
        }
    }

    /**
     * Deleta uma tag (apenas admin)
     * DELETE /api/forum/tags/:id
     */
    async deleteTag(req, res) {
        try {
            console.log("🔵 [ForumController] DELETE /tags/:id - Deletar tag");
            
            const { id } = req.params;

            // Verificar se é admin
            if (!this.isAdmin(req.user)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            await ForumModel.deleteTag(id);

            console.log("🟢 [ForumController] Tag deletada");
            res.json({ message: 'Tag deletada com sucesso' });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao deletar tag:", error.message);
            res.status(500).json({ error: 'Erro ao deletar tag', details: error.message });
        }
    }

    /**
     * Busca tópicos disponíveis
     * GET /api/forum/topics
     */
    async getTopics(req, res) {
        try {
            console.log("🔵 [ForumController] GET /topics - Listar tópicos");
            
            const topics = ForumModel.getAvailableTopics();

            console.log("🟢 [ForumController] Tópicos retornados:", topics.length);
            res.json(topics);
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao listar tópicos:", error.message);
            res.status(500).json({ error: 'Erro ao buscar tópicos', details: error.message });
        }
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================

    async getAdminUsers() {
        const { allQuery } = require('../../database/db');
        return await allQuery('SELECT * FROM users WHERE role = ?', ['admin']);
    }

    isAdmin(user) {
        return user && user.role === 'admin';
    }

    // =====================================================
    // STATISTICS - Estatísticas
    // =====================================================

    /**
     * Estatísticas globais do fórum
     * GET /api/forum/stats
     */
    async getStats(req, res) {
        try {
            console.log("🔵 [ForumController] GET /stats - Estatísticas globais");
            
            const stats = await ForumModel.getGlobalStats();

            console.log("🟢 [ForumController] Estatísticas retornadas");
            res.json(stats);
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao buscar estatísticas:", error.message);
            res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
        }
    }

    /**
     * Top contributors
     * GET /api/forum/top-contributors
     */
    async getTopContributors(req, res) {
        try {
            console.log("🔵 [ForumController] GET /top-contributors - Top contributors");
            
            const { limit = 5 } = req.query;
            const contributors = await ForumModel.getTopContributors(Number(limit));

            console.log("🟢 [ForumController] Top contributors retornados:", contributors.length);
            res.json(contributors);
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao buscar top contributors:", error.message);
            res.status(500).json({ error: 'Erro ao buscar top contributors', details: error.message });
        }
    }

    /**
     * Estatísticas do usuário
     * GET /api/forum/users/:id/stats
     */
    async getUserStats(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [ForumController] GET /users/:id/stats - Estatísticas do usuário:", id);
            
            const stats = await ForumModel.getUserStats(Number(id));

            console.log("🟢 [ForumController] Estatísticas do usuário retornadas");
            res.json(stats);
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao buscar estatísticas do usuário:", error.message);
            res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
        }
    }

    // =====================================================
    // MODERATION - Moderação (apenas admin)
    // =====================================================

    /**
     * Fecha/reabre uma pergunta (apenas admin)
     * POST /api/forum/questions/:id/close
     */
    async toggleCloseQuestion(req, res) {
        try {
            const { id } = req.params;
            console.log("🔵 [ForumController] POST /questions/:id/close - Fechar pergunta:", id);

            // Verificar se é admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Apenas administradores podem fechar perguntas' });
            }

            const question = await ForumModel.getQuestionById(Number(id));
            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            const newStatus = question.is_closed === 1 ? 0 : 1;
            await ForumModel.updateQuestion(Number(id), { is_closed: newStatus });

            console.log("🟢 [ForumController] Pergunta", newStatus ? "fechada" : "reaberta");
            res.json({ 
                success: true, 
                isClosed: newStatus === 1,
                message: newStatus ? 'Pergunta fechada' : 'Pergunta reaberta' 
            });
        } catch (error) {
            console.error("🔴 [ForumController] Erro ao fechar pergunta:", error.message);
            res.status(500).json({ error: 'Erro ao fechar pergunta', details: error.message });
        }
    }
}

module.exports = new ForumController();
