/**
 * Responsabilidade: persistencia de respostas do forum (criar, listar, buscar, atualizar, deletar, aceitar).
 * Camada: model.
 * Entradas/Saidas: payloads/ids de resposta; retorna ids, linhas de forum_answers e flags.
 * Dependencias criticas: db (executeQuery/getQuery/allQuery) e logger padronizado.
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria uma nova resposta e atualiza o updated_at da pergunta.
     * Onde e usada: ForumService.createAnswer.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere linha em forum_answers e atualiza forum_questions.
     */
    async createAnswer({ question_id, conteudo, autor_id, is_anonymous = 0 }) {
        log.start('Criando resposta para pergunta', { question_id });

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

            log.success('Resposta criada', { answerId });
            return answerId;
        } catch (error) {
            log.error('Erro ao criar resposta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca as respostas de uma pergunta, com aceita sempre no topo e ordenacao configuravel.
     * Onde e usada: ForumController ao exibir uma pergunta.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getAnswersByQuestion(questionId, sortBy = 'votos') {
        log.start('Buscando respostas da pergunta', { questionId });

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

            log.success('Respostas encontradas', { count: answers.length });
            return answers;
        } catch (error) {
            log.error('Erro ao buscar respostas', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: busca uma resposta por ID com dados do autor.
     * Onde e usada: fluxos de edicao/aceite/denuncia de respostas.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getAnswerById(id) {
        log.start('Buscando resposta por id', { id });

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
                log.success('Resposta encontrada', { id });
            } else {
                log.warn('Resposta nao encontrada', { id });
            }

            return answer;
        } catch (error) {
            log.error('Erro ao buscar resposta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza o conteudo de uma resposta.
     * Onde e usada: ForumService ao editar respostas.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza forum_answers.
     */
    async updateAnswer(id, { conteudo }) {
        log.start('Atualizando resposta', { id });

        try {
            await executeQuery(
                `UPDATE forum_answers
                 SET conteudo = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [conteudo, id]
            );

            log.success('Resposta atualizada', { id });
            return true;
        } catch (error) {
            log.error('Erro ao atualizar resposta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: remove uma resposta e seus comentarios e votos relacionados.
     * Onde e usada: ForumService.deleteAnswer.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: deleta linhas em forum_comments, forum_votes e forum_answers.
     */
    async deleteAnswer(id) {
        log.start('Deletando resposta', { id });

        try {
            await executeQuery("DELETE FROM forum_comments WHERE target_type = 'answer' AND target_id = ?", [id]);
            await executeQuery("DELETE FROM forum_votes WHERE votable_type = 'answer' AND votable_id = ?", [id]);
            await executeQuery('DELETE FROM forum_answers WHERE id = ?', [id]);
            log.success('Resposta deletada', { id });
            return true;
        } catch (error) {
            log.error('Erro ao deletar resposta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: alterna o aceite de uma resposta, garantindo no maximo uma aceita por pergunta.
     * Onde e usada: ForumService.acceptAnswer.
     * Dependencias chamadas: getQuery, executeQuery.
     * Efeitos colaterais: atualiza is_accepted em forum_answers.
     */
    async toggleAcceptAnswer(answerId, questionId) {
        log.start('Toggle aceitar resposta', { answerId });

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

            log.success('Resposta aceita atualizada', { answerId });
            return !isCurrentlyAccepted;
        } catch (error) {
            log.error('Erro ao aceitar resposta', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: lista as respostas de um usuario, com o titulo da pergunta correspondente.
     * Onde e usada: perfil publico / atividade do usuario no forum.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
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
};
