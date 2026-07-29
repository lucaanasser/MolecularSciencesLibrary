/**
 * Responsabilidade: persistencia de perguntas do forum (criar, buscar por id, atualizar, deletar, views).
 * Camada: model.
 * Entradas/Saidas: payloads/ids de pergunta; retorna ids, linhas de forum_questions e flags de sucesso.
 * Dependencias criticas: db (executeQuery/getQuery), logger e modulos irmaos via prototype (this.<sibling>).
 */

const { executeQuery, getQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria uma nova pergunta e, se houver tags, associa-as.
     * Onde e usada: ForumService.createQuestion.
     * Dependencias chamadas: executeQuery, this.addTagsToQuestion.
     * Efeitos colaterais: insere linha em forum_questions e associacoes de tags.
     */
    async createQuestion({ titulo, conteudo, autor_id, tags = [], is_anonymous = 0, disciplina_codigo = null }) {
        log.start('Criando pergunta', { titulo, autor_id, is_anonymous, disciplina_codigo });

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

            log.success('Pergunta criada', { questionId });
            return questionId;
        } catch (error) {
            log.error('Erro ao criar pergunta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca pergunta por ID com dados do autor, disciplina e tags.
     * Onde e usada: ForumController ao exibir uma pergunta.
     * Dependencias chamadas: getQuery, this.getQuestionTags.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getQuestionById(id) {
        log.start('Buscando pergunta por id', { id });

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
                log.success('Pergunta encontrada', { titulo: question.titulo });
            } else {
                log.warn('Pergunta nao encontrada', { id });
            }

            return question;
        } catch (error) {
            log.error('Erro ao buscar pergunta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza campos permitidos de uma pergunta e, opcionalmente, suas tags.
     * Onde e usada: ForumService ao editar/fixar/fechar perguntas.
     * Dependencias chamadas: executeQuery, this.removeAllTagsFromQuestion, this.addTagsToQuestion.
     * Efeitos colaterais: atualiza forum_questions e associacoes de tags.
     */
    async updateQuestion(id, fields = {}) {
        log.start('Atualizando pergunta', { id, campos: Object.keys(fields) });

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

            log.success('Pergunta atualizada', { id });
            return true;
        } catch (error) {
            log.error('Erro ao atualizar pergunta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove uma pergunta e, manualmente, todo o conteudo relacionado (comentarios, votos, inscricoes, favoritos, tags e respostas).
     * Onde e usada: ForumService.deleteQuestion.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: deleta linhas em varias tabelas do forum.
     */
    async deleteQuestion(id) {
        log.start('Deletando pergunta', { id });

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
            log.success('Pergunta deletada', { id });
            return true;
        } catch (error) {
            log.error('Erro ao deletar pergunta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: incrementa o contador de visualizacoes de uma pergunta.
     * Onde e usada: ForumController ao abrir uma pergunta.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza forum_questions.views.
     */
    async incrementViews(questionId) {
        log.start('Incrementando views da pergunta', { questionId });

        try {
            await executeQuery(
                'UPDATE forum_questions SET views = views + 1 WHERE id = ?',
                [questionId]
            );
            log.success('Views incrementadas', { questionId });
        } catch (error) {
            log.error('Erro ao incrementar views', { err: error.message });
            throw error;
        }
    }
};
