const { executeQuery, getQuery, allQuery } = require('../../database/db');

/**
 * Modelo para operações no banco de dados relacionadas ao Fórum.
 * Gerencia perguntas, respostas, tags, votos e reputação.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class ForumModel {
    // =====================================================
    // QUESTIONS - Perguntas
    // =====================================================

    /**
     * Cria uma nova pergunta
     */
    async createQuestion({ titulo, conteudo, autor_id, tags = [], is_anonymous = 0, disciplina_codigo = null }) {
        console.log("🔵 [ForumModel] Criando pergunta:", { titulo, autor_id, is_anonymous, disciplina_codigo });

        try {
            const { lastID: questionId } = await executeQuery(
                `INSERT INTO forum_questions (titulo, conteudo, autor_id, votos, views, is_anonymous, disciplina_codigo, created_at, updated_at)
                 VALUES (?, ?, ?, 0, 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [titulo, conteudo, autor_id, is_anonymous ? 1 : 0, disciplina_codigo || null]
            );

            // Adicionar tags se fornecidas
            if (tags.length > 0) {
                await this.addTagsToQuestion(questionId, tags);
            }

            console.log("🟢 [ForumModel] Pergunta criada com id:", questionId);
            return questionId;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao criar pergunta:", error.message);
            throw error;
        }
    }

    /**
     * Busca pergunta por ID com dados do autor e tags
     */
    async getQuestionById(id) {
        console.log("🔵 [ForumModel] Buscando pergunta por id:", id);
        
        try {
            const question = await getQuery(`
                SELECT
                    q.*,
                    u.name as autor_nome,
                    u.profile_image as autor_imagem,
                    d.nome as disciplina_nome,
                    (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
                    (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) as tem_resposta_aceita
                FROM forum_questions q
                JOIN users u ON q.autor_id = u.id
                LEFT JOIN disciplines d ON q.disciplina_codigo = d.codigo
                WHERE q.id = ?
            `, [id]);

            if (question) {
                question.tags = await this.getQuestionTags(id);
                console.log("🟢 [ForumModel] Pergunta encontrada:", question.titulo);
            } else {
                console.log("🟡 [ForumModel] Pergunta não encontrada");
            }

            return question;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar pergunta:", error.message);
            throw error;
        }
    }

    /**
     * Lista perguntas com filtros e ordenação
     * @param {Object} options - Opções de filtro e ordenação
     */
    async getQuestions({ 
        sortBy = 'recente', 
        search = '', 
        tagId = null,
        tagName = null,
        disciplina = null,
        autorId = null,
        page = 1,
        limit = 20
    } = {}) {
        console.log("🔵 [ForumModel] Buscando perguntas:", { sortBy, search, tagId, tagName, disciplina, autorId, page, limit });
        
        try {
            let query = `
                SELECT 
                    q.*,
                    u.name as autor_nome,
                    u.profile_image as autor_imagem,
                    q.is_anonymous,
                    (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
                    (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
                FROM forum_questions q
                JOIN users u ON q.autor_id = u.id
            `;
            
            const params = [];
            const conditions = [];

            // Filtro por tag (por ID ou nome)
            if (tagId) {
                query = `
                    SELECT 
                        q.*,
                        u.name as autor_nome,
                        u.profile_image as autor_imagem,
                        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
                        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
                    FROM forum_questions q
                    JOIN users u ON q.autor_id = u.id
                    JOIN forum_question_tags qt ON q.id = qt.question_id
                    WHERE qt.tag_id = ?
                `;
                params.push(tagId);
            } else if (tagName) {
                query = `
                    SELECT 
                        q.*,
                        u.name as autor_nome,
                        u.profile_image as autor_imagem,
                        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) as respostas_count,
                        (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id AND is_accepted = 1) > 0 as tem_resposta_aceita
                    FROM forum_questions q
                    JOIN users u ON q.autor_id = u.id
                    JOIN forum_question_tags qt ON q.id = qt.question_id
                    JOIN forum_tags t ON qt.tag_id = t.id
                    WHERE t.nome = ?
                `;
                params.push(tagName);
            }

            // Filtro de busca textual
            if (search && search.trim()) {
                const searchCondition = tagId || tagName ? 'AND' : 'WHERE';
                query += ` ${searchCondition} (q.titulo LIKE ? OR q.conteudo LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }

            // Filtro por disciplina
            if (disciplina) {
                const discCondition = (tagId || tagName || search) ? 'AND' : 'WHERE';
                query += ` ${discCondition} q.disciplina_codigo = ?`;
                params.push(disciplina);
            }

            // Filtro por autor
            if (autorId) {
                const autorCondition = (tagId || tagName || search || disciplina) ? 'AND' : 'WHERE';
                query += ` ${autorCondition} q.autor_id = ?`;
                params.push(autorId);
            }

            // Filtro sem resposta
            if (sortBy === 'sem-resposta') {
                const noAnswerCondition = (tagId || tagName || search || disciplina || autorId) ? 'AND' : 'WHERE';
                query += ` ${noAnswerCondition} (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) = 0`;
            }

            // Ordenação (perguntas fixadas sempre no topo)
            switch (sortBy) {
                case 'votos':
                    query += ' ORDER BY q.is_pinned DESC, q.votos DESC, q.created_at DESC';
                    break;
                case 'atividade':
                    query += ' ORDER BY q.is_pinned DESC, q.updated_at DESC, q.created_at DESC';
                    break;
                case 'views':
                    query += ' ORDER BY q.is_pinned DESC, q.views DESC, q.created_at DESC';
                    break;
                case 'sem-resposta':
                case 'recente':
                default:
                    query += ' ORDER BY q.is_pinned DESC, q.created_at DESC';
                    break;
            }

            // Paginação
            const offset = (page - 1) * limit;
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const questions = await allQuery(query, params);

            // Buscar tags (e nome da disciplina, se houver) para cada pergunta
            for (const question of questions) {
                question.tags = await this.getQuestionTags(question.id);
                if (question.disciplina_codigo) {
                    const disc = await getQuery(
                        'SELECT nome FROM disciplines WHERE codigo = ?',
                        [question.disciplina_codigo]
                    );
                    question.disciplina_nome = disc ? disc.nome : null;
                }
            }

            console.log("🟢 [ForumModel] Perguntas encontradas:", questions.length);
            return questions;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar perguntas:", error.message);
            throw error;
        }
    }

    /**
     * Conta total de perguntas (para paginação)
     */
    async countQuestions({ search = '', tagId = null, tagName = null, disciplina = null, autorId = null, sortBy = 'recente' } = {}) {
        console.log("🔵 [ForumModel] Contando perguntas");
        
        try {
            let query = 'SELECT COUNT(*) as total FROM forum_questions q';
            const params = [];

            if (tagId) {
                query += ' JOIN forum_question_tags qt ON q.id = qt.question_id WHERE qt.tag_id = ?';
                params.push(tagId);
            } else if (tagName) {
                query += ' JOIN forum_question_tags qt ON q.id = qt.question_id JOIN forum_tags t ON qt.tag_id = t.id WHERE t.nome = ?';
                params.push(tagName);
            }

            if (search && search.trim()) {
                const searchCondition = tagId || tagName ? 'AND' : 'WHERE';
                query += ` ${searchCondition} (q.titulo LIKE ? OR q.conteudo LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }

            if (disciplina) {
                const discCondition = (tagId || tagName || search) ? 'AND' : 'WHERE';
                query += ` ${discCondition} q.disciplina_codigo = ?`;
                params.push(disciplina);
            }

            if (autorId) {
                const autorCondition = (tagId || tagName || search || disciplina) ? 'AND' : 'WHERE';
                query += ` ${autorCondition} q.autor_id = ?`;
                params.push(autorId);
            }

            if (sortBy === 'sem-resposta') {
                const noAnswerCondition = (tagId || tagName || search || disciplina || autorId) ? 'AND' : 'WHERE';
                query += ` ${noAnswerCondition} (SELECT COUNT(*) FROM forum_answers WHERE question_id = q.id) = 0`;
            }

            const result = await getQuery(query, params);
            console.log("🟢 [ForumModel] Total de perguntas:", result.total);
            return result.total;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao contar perguntas:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma pergunta
     */
    async updateQuestion(id, fields = {}) {
        console.log("🔵 [ForumModel] Atualizando pergunta:", id, Object.keys(fields));

        try {
            // Atualização parcial: só altera as colunas efetivamente informadas.
            const allowedColumns = ['titulo', 'conteudo', 'is_closed', 'is_pinned', 'disciplina_codigo'];
            const setClauses = [];
            const params = [];

            for (const column of allowedColumns) {
                if (fields[column] !== undefined) {
                    setClauses.push(`${column} = ?`);
                    params.push(fields[column]);
                }
            }

            if (setClauses.length > 0) {
                setClauses.push('updated_at = CURRENT_TIMESTAMP');
                params.push(id);
                await executeQuery(
                    `UPDATE forum_questions SET ${setClauses.join(', ')} WHERE id = ?`,
                    params
                );
            }

            // Atualizar tags se fornecidas
            if (fields.tags !== undefined) {
                await this.removeAllTagsFromQuestion(id);
                if (fields.tags.length > 0) {
                    await this.addTagsToQuestion(id, fields.tags);
                }
            }

            console.log("🟢 [ForumModel] Pergunta atualizada");
            return true;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao atualizar pergunta:", error.message);
            throw error;
        }
    }

    /**
     * Remove uma pergunta (cascade deleta respostas, tags e votos)
     */
    async deleteQuestion(id) {
        console.log("🔵 [ForumModel] Deletando pergunta:", id);
        
        try {
            // PRAGMA foreign_keys pode estar OFF nesta conexão (ON DELETE CASCADE não dispara):
            // limpar manualmente tudo relacionado à pergunta antes de removê-la.

            // Comentários (polimórficos) da pergunta e de suas respostas
            await executeQuery(
                `DELETE FROM forum_comments
                 WHERE (target_type = 'question' AND target_id = ?)
                    OR (target_type = 'answer' AND target_id IN (SELECT id FROM forum_answers WHERE question_id = ?))`,
                [id, id]
            );
            // Votos (polimórficos) da pergunta e das respostas
            await executeQuery("DELETE FROM forum_votes WHERE votable_type = 'question' AND votable_id = ?", [id]);
            await executeQuery(
                "DELETE FROM forum_votes WHERE votable_type = 'answer' AND votable_id IN (SELECT id FROM forum_answers WHERE question_id = ?)",
                [id]
            );
            // Inscrições, favoritos, associações de tags e respostas
            await executeQuery('DELETE FROM forum_subscriptions WHERE question_id = ?', [id]);
            await executeQuery('DELETE FROM forum_bookmarks WHERE question_id = ?', [id]);
            await executeQuery('DELETE FROM forum_question_tags WHERE question_id = ?', [id]);
            await executeQuery('DELETE FROM forum_answers WHERE question_id = ?', [id]);
            await executeQuery('DELETE FROM forum_questions WHERE id = ?', [id]);
            console.log("🟢 [ForumModel] Pergunta deletada");
            return true;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao deletar pergunta:", error.message);
            throw error;
        }
    }

    /**
     * Incrementa visualizações
     */
    async incrementViews(questionId) {
        console.log("🔵 [ForumModel] Incrementando views da pergunta:", questionId);
        
        try {
            await executeQuery(
                'UPDATE forum_questions SET views = views + 1 WHERE id = ?',
                [questionId]
            );
            console.log("🟢 [ForumModel] Views incrementadas");
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao incrementar views:", error.message);
            throw error;
        }
    }

    // =====================================================
    // ANSWERS - Respostas
    // =====================================================

    /**
     * Cria uma nova resposta
     */
    async createAnswer({ question_id, conteudo, autor_id, is_anonymous = 0 }) {
        console.log("🔵 [ForumModel] Criando resposta para pergunta:", question_id);
        
        try {
            const { lastID: answerId } = await executeQuery(
                `INSERT INTO forum_answers (question_id, conteudo, autor_id, votos, is_accepted, is_anonymous, created_at, updated_at)
                 VALUES (?, ?, ?, 0, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [question_id, conteudo, autor_id, is_anonymous]
            );

            // Atualizar updated_at da pergunta
            await executeQuery(
                'UPDATE forum_questions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [question_id]
            );

            console.log("🟢 [ForumModel] Resposta criada com id:", answerId);
            return answerId;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao criar resposta:", error.message);
            throw error;
        }
    }

    /**
     * Busca respostas de uma pergunta
     */
    async getAnswersByQuestion(questionId, sortBy = 'votos') {
        console.log("🔵 [ForumModel] Buscando respostas da pergunta:", questionId);
        
        try {
            let orderBy = 'a.votos DESC, a.created_at ASC';
            if (sortBy === 'recente') {
                orderBy = 'a.created_at DESC';
            } else if (sortBy === 'antiga') {
                orderBy = 'a.created_at ASC';
            }

            const answers = await allQuery(`
                SELECT 
                    a.*,
                    u.name as autor_nome,
                    u.profile_image as autor_imagem,
                    a.is_anonymous
                FROM forum_answers a
                JOIN users u ON a.autor_id = u.id
                WHERE a.question_id = ?
                ORDER BY a.is_accepted DESC, ${orderBy}
            `, [questionId]);

            console.log("🟢 [ForumModel] Respostas encontradas:", answers.length);
            return answers;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar respostas:", error.message);
            throw error;
        }
    }

    /**
     * Busca resposta por ID
     */
    async getAnswerById(id) {
        console.log("🔵 [ForumModel] Buscando resposta por id:", id);
        
        try {
            const answer = await getQuery(`
                SELECT 
                    a.*,
                    u.name as autor_nome,
                    u.profile_image as autor_imagem
                FROM forum_answers a
                JOIN users u ON a.autor_id = u.id
                WHERE a.id = ?
            `, [id]);

            if (answer) {
                console.log("🟢 [ForumModel] Resposta encontrada");
            } else {
                console.log("🟡 [ForumModel] Resposta não encontrada");
            }

            return answer;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar resposta:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma resposta
     */
    async updateAnswer(id, { conteudo }) {
        console.log("🔵 [ForumModel] Atualizando resposta:", id);
        
        try {
            await executeQuery(
                `UPDATE forum_answers 
                 SET conteudo = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [conteudo, id]
            );

            console.log("🟢 [ForumModel] Resposta atualizada");
            return true;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao atualizar resposta:", error.message);
            throw error;
        }
    }

    /**
     * Remove uma resposta
     */
    async deleteAnswer(id) {
        console.log("🔵 [ForumModel] Deletando resposta:", id);
        
        try {
            await executeQuery("DELETE FROM forum_comments WHERE target_type = 'answer' AND target_id = ?", [id]);
            await executeQuery("DELETE FROM forum_votes WHERE votable_type = 'answer' AND votable_id = ?", [id]);
            await executeQuery('DELETE FROM forum_answers WHERE id = ?', [id]);
            console.log("🟢 [ForumModel] Resposta deletada");
            return true;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao deletar resposta:", error.message);
            throw error;
        }
    }

    /**
     * Marca/desmarca resposta como aceita
     */
    async toggleAcceptAnswer(answerId, questionId) {
        console.log("🔵 [ForumModel] Toggle aceitar resposta:", answerId);
        
        try {
            // Verificar se já está aceita
            const answer = await getQuery('SELECT is_accepted FROM forum_answers WHERE id = ?', [answerId]);
            const isCurrentlyAccepted = answer?.is_accepted === 1;

            // Desmarcar todas as outras respostas da pergunta primeiro
            await executeQuery(
                'UPDATE forum_answers SET is_accepted = 0 WHERE question_id = ?',
                [questionId]
            );

            // Se não estava aceita, marcar como aceita
            if (!isCurrentlyAccepted) {
                await executeQuery(
                    'UPDATE forum_answers SET is_accepted = 1 WHERE id = ?',
                    [answerId]
                );
            }

            console.log("🟢 [ForumModel] Resposta aceita atualizada");
            return !isCurrentlyAccepted;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao aceitar resposta:", error.message);
            throw error;
        }
    }

    // =====================================================
    // TAGS - Tags
    // =====================================================

    /**
     * Cria ou retorna tag existente
     */
    async getOrCreateTag(nome, topico = 'geral', descricao = null, userId = null) {
        console.log("🔵 [ForumModel] Buscando/criando tag:", nome);
        
        try {
            // Normalizar nome da tag
            const normalizedName = nome.toLowerCase().trim();

            let tag = await getQuery('SELECT * FROM forum_tags WHERE nome = ?', [normalizedName]);
            
            if (!tag) {
                const { lastID: tagId } = await executeQuery(
                    'INSERT INTO forum_tags (nome, topico, descricao, created_by_user, approved, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                    [normalizedName, topico, descricao, userId, userId ? 0 : 1] // Se criado por usuário, precisa aprovação
                );
                tag = { id: tagId, nome: normalizedName, topico, descricao, created_by_user: userId, approved: userId ? 0 : 1 };
                console.log("🟢 [ForumModel] Tag criada:", normalizedName);
            } else {
                console.log("🟢 [ForumModel] Tag encontrada:", normalizedName);
            }

            return tag;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar/criar tag:", error.message);
            throw error;
        }
    }

    /**
     * Adiciona tags a uma pergunta
     */
    async addTagsToQuestion(questionId, tagNames) {
        console.log("🔵 [ForumModel] Adicionando tags à pergunta:", questionId, tagNames);
        
        try {
            for (const tagName of tagNames) {
                const tag = await this.getOrCreateTag(tagName);
                await executeQuery(
                    'INSERT OR IGNORE INTO forum_question_tags (question_id, tag_id) VALUES (?, ?)',
                    [questionId, tag.id]
                );
            }
            console.log("🟢 [ForumModel] Tags adicionadas");
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao adicionar tags:", error.message);
            throw error;
        }
    }

    /**
     * Remove todas as tags de uma pergunta
     */
    async removeAllTagsFromQuestion(questionId) {
        console.log("🔵 [ForumModel] Removendo tags da pergunta:", questionId);
        
        try {
            await executeQuery('DELETE FROM forum_question_tags WHERE question_id = ?', [questionId]);
            console.log("🟢 [ForumModel] Tags removidas");
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao remover tags:", error.message);
            throw error;
        }
    }

    /**
     * Busca tags de uma pergunta
     */
    async getQuestionTags(questionId) {
        try {
            const tags = await allQuery(`
                SELECT t.* FROM forum_tags t
                JOIN forum_question_tags qt ON t.id = qt.tag_id
                WHERE qt.question_id = ?
            `, [questionId]);
            return tags.map(t => t.nome);
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar tags da pergunta:", error.message);
            return [];
        }
    }

    /**
     * Busca tags populares (com contagem)
     */
    async getPopularTags(limit = 10) {
        console.log("🔵 [ForumModel] Buscando tags populares");
        
        try {
            const tags = await allQuery(`
                SELECT 
                    t.id,
                    t.nome,
                    t.descricao,
                    COUNT(qt.question_id) as count
                FROM forum_tags t
                LEFT JOIN forum_question_tags qt ON t.id = qt.tag_id
                GROUP BY t.id
                ORDER BY count DESC
                LIMIT ?
            `, [limit]);

            console.log("🟢 [ForumModel] Tags populares encontradas:", tags.length);
            return tags;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar tags populares:", error.message);
            throw error;
        }
    }

    /**
     * Busca todas as tags
     */
    async getAllTags() {
        console.log("🔵 [ForumModel] Buscando todas as tags");
        
        try {
            const tags = await allQuery(`
                SELECT 
                    t.id,
                    t.nome,
                    t.topico,
                    t.descricao,
                    t.approved,
                    t.created_by_user,
                    COUNT(qt.question_id) as count
                FROM forum_tags t
                LEFT JOIN forum_question_tags qt ON t.id = qt.tag_id
                GROUP BY t.id
                ORDER BY t.topico ASC, t.nome ASC
            `);

            console.log("🟢 [ForumModel] Tags encontradas:", tags.length);
            return tags;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar todas as tags:", error.message);
            throw error;
        }
    }

    /**
     * Busca tags pendentes de aprovação (para admin)
     */
    async getPendingTags() {
        console.log("🔵 [ForumModel] Buscando tags criadas por usuários");
        
        try {
            const tags = await allQuery(`
                SELECT 
                    t.*,
                    u.name as created_by_name
                FROM forum_tags t
                LEFT JOIN users u ON t.created_by_user = u.id
                WHERE t.created_by_user IS NOT NULL
                ORDER BY t.approved ASC, t.created_at DESC
            `);

            console.log("🟢 [ForumModel] Tags criadas por usuários encontradas:", tags.length);
            return tags;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar tags criadas por usuários:", error.message);
            throw error;
        }
    }

    /**
     * Cria uma nova tag
     */
    async createTag({ nome, topico, descricao, userId }) {
        console.log("🔵 [ForumModel] Criando nova tag:", nome);
        
        try {
            const normalizedName = nome.toLowerCase().trim();
            
            // Verificar se já existe
            const existing = await getQuery('SELECT * FROM forum_tags WHERE nome = ?', [normalizedName]);
            if (existing) {
                throw new Error('Tag já existe');
            }

            const { lastID: tagId } = await executeQuery(
                'INSERT INTO forum_tags (nome, topico, descricao, created_by_user, approved, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)',
                [normalizedName, topico, descricao, userId]
            );

            console.log("🟢 [ForumModel] Tag criada com id:", tagId);
            return tagId;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao criar tag:", error.message);
            throw error;
        }
    }

    /**
     * Aprova uma tag (admin)
     */
    async approveTag(tagId) {
        console.log("🔵 [ForumModel] Aprovando tag:", tagId);
        
        try {
            await executeQuery('UPDATE forum_tags SET approved = 1 WHERE id = ?', [tagId]);
            console.log("🟢 [ForumModel] Tag aprovada");
            return true;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao aprovar tag:", error.message);
            throw error;
        }
    }

    /**
     * Deleta uma tag (admin)
     */
    async deleteTag(tagId) {
        console.log("🔵 [ForumModel] Deletando tag:", tagId);
        
        try {
            // Primeiro remover das associações com perguntas
            await executeQuery('DELETE FROM forum_question_tags WHERE tag_id = ?', [tagId]);
            
            // Depois deletar a tag
            await executeQuery('DELETE FROM forum_tags WHERE id = ?', [tagId]);
            
            console.log("🟢 [ForumModel] Tag deletada");
            return true;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao deletar tag:", error.message);
            throw error;
        }
    }

    /**
     * Busca tópicos disponíveis
     */
    getAvailableTopics() {
        return [
            'academico',
            'administrativo',
            'tecnico',
            'eventos',
            'carreira',
            'biblioteca',
            'geral'
        ];
    }

    // =====================================================
    // VOTES - Votos
    // =====================================================

    /**
     * Registra um voto (ou atualiza se já existir)
     * @param {number} userId - ID do usuário
     * @param {string} votableType - 'question' ou 'answer'
     * @param {number} votableId - ID da pergunta ou resposta
     * @param {number} voteType - 1 para upvote, -1 para downvote
     */
    async vote(userId, votableType, votableId, voteType) {
        console.log("🔵 [ForumModel] Registrando voto:", { userId, votableType, votableId, voteType });
        
        try {
            // Verificar se já existe um voto
            const existingVote = await getQuery(
                'SELECT * FROM forum_votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
                [userId, votableType, votableId]
            );

            let voteDiff = 0;

            if (existingVote) {
                if (existingVote.vote_type === voteType) {
                    // Mesmo voto - remover (toggle)
                    await executeQuery(
                        'DELETE FROM forum_votes WHERE id = ?',
                        [existingVote.id]
                    );
                    voteDiff = -voteType;
                    console.log("🟢 [ForumModel] Voto removido (toggle)");
                } else {
                    // Voto diferente - atualizar
                    await executeQuery(
                        'UPDATE forum_votes SET vote_type = ? WHERE id = ?',
                        [voteType, existingVote.id]
                    );
                    voteDiff = voteType * 2; // Mudança de -1 para 1 ou vice-versa
                    console.log("🟢 [ForumModel] Voto atualizado");
                }
            } else {
                // Novo voto
                await executeQuery(
                    'INSERT INTO forum_votes (user_id, votable_type, votable_id, vote_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                    [userId, votableType, votableId, voteType]
                );
                voteDiff = voteType;
                console.log("🟢 [ForumModel] Novo voto registrado");
            }

            // Atualizar contagem de votos no item
            const table = votableType === 'question' ? 'forum_questions' : 'forum_answers';
            await executeQuery(
                `UPDATE ${table} SET votos = votos + ? WHERE id = ?`,
                [voteDiff, votableId]
            );

            return voteDiff;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao registrar voto:", error.message);
            throw error;
        }
    }

    /**
     * Busca voto do usuário em um item
     */
    async getUserVote(userId, votableType, votableId) {
        try {
            const vote = await getQuery(
                'SELECT vote_type FROM forum_votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
                [userId, votableType, votableId]
            );
            return vote ? vote.vote_type : 0;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar voto do usuário:", error.message);
            return 0;
        }
    }

    /**
     * Busca todos os votos do usuário em uma lista de itens
     */
    async getUserVotes(userId, votableType, votableIds) {
        if (!votableIds || votableIds.length === 0) return {};
        
        try {
            const placeholders = votableIds.map(() => '?').join(',');
            const votes = await allQuery(
                `SELECT votable_id, vote_type FROM forum_votes 
                 WHERE user_id = ? AND votable_type = ? AND votable_id IN (${placeholders})`,
                [userId, votableType, ...votableIds]
            );
            
            const voteMap = {};
            votes.forEach(v => { voteMap[v.votable_id] = v.vote_type; });
            return voteMap;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar votos do usuário:", error.message);
            return {};
        }
    }

    // =====================================================
    // STATISTICS - Estatísticas e Rankings
    // =====================================================

    /**
     * Calcula reputação de um usuário
     * Fórmula: (votos em perguntas * 5) + (votos em respostas * 10) + (respostas aceitas * 15)
     */
    async getUserReputation(userId) {
        console.log("🔵 [ForumModel] Calculando reputação do usuário:", userId);
        
        try {
            // Votos em perguntas (apenas não-anônimas)
            const questionVotes = await getQuery(`
                SELECT COALESCE(SUM(q.votos), 0) as total
                FROM forum_questions q
                WHERE q.autor_id = ? AND q.is_anonymous = 0
            `, [userId]);

            // Votos em respostas (apenas não-anônimas)
            const answerVotes = await getQuery(`
                SELECT COALESCE(SUM(a.votos), 0) as total
                FROM forum_answers a
                WHERE a.autor_id = ? AND a.is_anonymous = 0
            `, [userId]);

            // Respostas aceitas (apenas não-anônimas)
            const acceptedAnswers = await getQuery(`
                SELECT COUNT(*) as total
                FROM forum_answers
                WHERE autor_id = ? AND is_accepted = 1 AND is_anonymous = 0
            `, [userId]);

            const reputation = 
                (questionVotes.total * 5) + 
                (answerVotes.total * 10) + 
                (acceptedAnswers.total * 15);

            console.log("🟢 [ForumModel] Reputação calculada:", reputation);
            return {
                reputation,
                questionVotes: questionVotes.total,
                answerVotes: answerVotes.total,
                acceptedAnswers: acceptedAnswers.total
            };
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao calcular reputação:", error.message);
            throw error;
        }
    }

    /**
     * Busca estatísticas do usuário no fórum
     */
    async getUserStats(userId) {
        console.log("🔵 [ForumModel] Buscando estatísticas do usuário:", userId);
        
        try {
            const stats = await getQuery(`
                SELECT
                    (SELECT COUNT(*) FROM forum_questions WHERE autor_id = ? AND is_anonymous = 0) as questions_asked,
                    (SELECT COUNT(*) FROM forum_answers WHERE autor_id = ? AND is_anonymous = 0) as answers_given,
                    (SELECT COUNT(*) FROM forum_answers WHERE autor_id = ? AND is_accepted = 1 AND is_anonymous = 0) as accepted_answers
            `, [userId, userId, userId]);

            const reputation = await this.getUserReputation(userId);

            console.log("🟢 [ForumModel] Estatísticas encontradas");
            return {
                ...stats,
                reputation: reputation.reputation
            };
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar estatísticas:", error.message);
            throw error;
        }
    }

    /**
     * Busca top contributors (ranking de reputação)
     */
    async getTopContributors(limit = 5) {
        console.log("🔵 [ForumModel] Buscando top contributors");
        
        try {
            const contributors = await allQuery(`
                SELECT 
                    u.id,
                    u.name,
                    u.profile_image,
                    COALESCE(
                        (SELECT SUM(q.votos) * 5 FROM forum_questions q WHERE q.autor_id = u.id AND q.is_anonymous = 0), 0
                    ) + COALESCE(
                        (SELECT SUM(a.votos) * 10 FROM forum_answers a WHERE a.autor_id = u.id AND a.is_anonymous = 0), 0
                    ) + COALESCE(
                        (SELECT COUNT(*) * 15 FROM forum_answers WHERE autor_id = u.id AND is_accepted = 1 AND is_anonymous = 0), 0
                    ) as pontos,
                    (SELECT COUNT(*) FROM forum_questions WHERE autor_id = u.id AND is_anonymous = 0) as questions,
                    (SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_anonymous = 0) as answers,
                    (SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_accepted = 1 AND is_anonymous = 0) as accepted_answers
                FROM users u
                WHERE (
                    SELECT COUNT(*) FROM forum_questions WHERE autor_id = u.id AND is_anonymous = 0
                ) + (
                    SELECT COUNT(*) FROM forum_answers WHERE autor_id = u.id AND is_anonymous = 0
                ) > 0
                ORDER BY pontos DESC
                LIMIT ?
            `, [limit]);

            console.log("🟢 [ForumModel] Top contributors encontrados:", contributors.length);
            return contributors;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar top contributors:", error.message);
            throw error;
        }
    }

    /**
     * Busca estatísticas globais do fórum
     */
    async getGlobalStats() {
        console.log("🔵 [ForumModel] Buscando estatísticas globais");
        
        try {
            const stats = await getQuery(`
                SELECT
                    (SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) as total_questions,
                    (SELECT COUNT(*) FROM forum_answers WHERE is_anonymous = 0) as total_answers,
                    (SELECT COUNT(DISTINCT autor_id) FROM forum_questions WHERE is_anonymous = 0) + 
                    (SELECT COUNT(DISTINCT autor_id) FROM forum_answers WHERE is_anonymous = 0) as active_users,
                    CASE 
                        WHEN (SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) = 0 THEN 0
                        ELSE ROUND(
                            CAST((SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0 AND id IN (SELECT DISTINCT question_id FROM forum_answers WHERE is_anonymous = 0)) AS FLOAT) / 
                            CAST((SELECT COUNT(*) FROM forum_questions WHERE is_anonymous = 0) AS FLOAT) * 100
                        )
                    END as response_rate
            `);

            console.log("🟢 [ForumModel] Estatísticas globais:", stats);
            return {
                total_questions: stats.total_questions || 0,
                total_answers: stats.total_answers || 0,
                active_users: stats.active_users || 0,
                response_rate: stats.response_rate || 0
            };
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar estatísticas globais:", error.message);
            throw error;
        }
    }

    // =====================================================
    // REPORTS - Denúncias de conteúdo
    // =====================================================

    /**
     * Cria uma denúncia de pergunta ou resposta.
     */
    async createReport({ reporter_id, target_type, target_id, motivo }) {
        console.log("🔵 [ForumModel] Criando denúncia:", { reporter_id, target_type, target_id });

        try {
            const { lastID: reportId } = await executeQuery(
                `INSERT INTO forum_reports (reporter_id, target_type, target_id, motivo, status, created_at)
                 VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
                [reporter_id, target_type, target_id, motivo]
            );

            console.log("🟢 [ForumModel] Denúncia criada com id:", reportId);
            return reportId;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao criar denúncia:", error.message);
            throw error;
        }
    }

    /**
     * Lista denúncias (opcionalmente filtradas por status), com nome do denunciante
     * e um trecho do conteúdo denunciado.
     */
    async getReports({ status = null } = {}) {
        console.log("🔵 [ForumModel] Buscando denúncias:", { status });

        try {
            let query = `
                SELECT
                    r.*,
                    u.name as reporter_nome,
                    CASE r.target_type
                        WHEN 'question' THEN (SELECT titulo FROM forum_questions WHERE id = r.target_id)
                        ELSE (SELECT conteudo FROM forum_answers WHERE id = r.target_id)
                    END as target_preview,
                    CASE r.target_type
                        WHEN 'question' THEN r.target_id
                        ELSE (SELECT question_id FROM forum_answers WHERE id = r.target_id)
                    END as question_id
                FROM forum_reports r
                JOIN users u ON r.reporter_id = u.id
            `;
            const params = [];

            if (status) {
                query += ' WHERE r.status = ?';
                params.push(status);
            }

            query += ' ORDER BY r.created_at DESC';

            const reports = await allQuery(query, params);
            console.log("🟢 [ForumModel] Denúncias encontradas:", reports.length);
            return reports;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao buscar denúncias:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza o status de uma denúncia ('resolved' ou 'dismissed').
     */
    async updateReportStatus(id, status) {
        console.log("🔵 [ForumModel] Atualizando status da denúncia:", id, status);

        try {
            await executeQuery(
                `UPDATE forum_reports SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [status, id]
            );
            console.log("🟢 [ForumModel] Status da denúncia atualizado");
            return true;
        } catch (error) {
            console.error("🔴 [ForumModel] Erro ao atualizar denúncia:", error.message);
            throw error;
        }
    }

    // =====================================================
    // COMMENTS - Comentários em perguntas/respostas
    // =====================================================

    async createComment({ target_type, target_id, autor_id, conteudo }) {
        console.log("🔵 [ForumModel] Criando comentário:", { target_type, target_id, autor_id });
        const { lastID } = await executeQuery(
            `INSERT INTO forum_comments (target_type, target_id, autor_id, conteudo, created_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [target_type, target_id, autor_id, conteudo]
        );
        return lastID;
    }

    async getCommentById(id) {
        return await getQuery('SELECT * FROM forum_comments WHERE id = ?', [id]);
    }

    /** Comentários da pergunta e de todas as suas respostas (uma query). */
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
    }

    async deleteComment(id) {
        await executeQuery('DELETE FROM forum_comments WHERE id = ?', [id]);
        return true;
    }

    // =====================================================
    // SUBSCRIPTIONS - Seguir perguntas
    // =====================================================

    async subscribe(userId, questionId) {
        await executeQuery(
            'INSERT OR IGNORE INTO forum_subscriptions (user_id, question_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [userId, questionId]
        );
        return true;
    }

    async unsubscribe(userId, questionId) {
        await executeQuery(
            'DELETE FROM forum_subscriptions WHERE user_id = ? AND question_id = ?',
            [userId, questionId]
        );
        return true;
    }

    async isSubscribed(userId, questionId) {
        const row = await getQuery(
            'SELECT 1 FROM forum_subscriptions WHERE user_id = ? AND question_id = ?',
            [userId, questionId]
        );
        return !!row;
    }

    async getSubscriberIds(questionId) {
        const rows = await allQuery(
            'SELECT user_id FROM forum_subscriptions WHERE question_id = ?',
            [questionId]
        );
        return rows.map(r => r.user_id);
    }

    /** Respostas de um usuário, com o título da pergunta correspondente. */
    async getAnswersByUser(userId) {
        return await allQuery(
            `SELECT a.*, q.titulo as question_titulo
             FROM forum_answers a
             JOIN forum_questions q ON a.question_id = q.id
             WHERE a.autor_id = ?
             ORDER BY a.created_at DESC`,
            [userId]
        );
    }

    // =====================================================
    // BOOKMARKS - Favoritos
    // =====================================================

    async addBookmark(userId, questionId) {
        await executeQuery(
            'INSERT OR IGNORE INTO forum_bookmarks (user_id, question_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [userId, questionId]
        );
        return true;
    }

    async removeBookmark(userId, questionId) {
        await executeQuery(
            'DELETE FROM forum_bookmarks WHERE user_id = ? AND question_id = ?',
            [userId, questionId]
        );
        return true;
    }

    async isBookmarked(userId, questionId) {
        const row = await getQuery(
            'SELECT 1 FROM forum_bookmarks WHERE user_id = ? AND question_id = ?',
            [userId, questionId]
        );
        return !!row;
    }

    /** Perguntas favoritadas por um usuário (mesma forma de linha que getQuestions). */
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
}

module.exports = new ForumModel();
