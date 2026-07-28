/**
 * Responsabilidade: handlers HTTP de respostas do Fórum (criar/editar/excluir/aceitar).
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints de respostas; valida permissões e delega ao service/model.
 * Dependencias criticas: ForumService (criação/aceite), ForumModel (leitura/edição) e logger padronizado.
 */

const ForumService = require('../../../../services/academic/ForumService');
const ForumModel = require('../../../../models/academic/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Cria resposta para uma pergunta
     * POST /api/forum/questions/:id/answers
     */
    async createAnswer(req, res) {
        try {
            const { id: questionId } = req.params;
            log.start('POST /questions/:id/answers - Criar resposta');

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

            // Perguntas fechadas não aceitam novas respostas
            if (question.is_closed === 1) {
                log.warn('Tentativa de responder pergunta fechada');
                return res.status(403).json({ error: 'Esta pergunta está fechada para novas respostas' });
            }

            const answerId = await ForumService.createAnswer({
                question_id: Number(questionId),
                conteudo: conteudo.trim(),
                autor_id,
                questionAutorId: question.autor_id,
                is_anonymous: is_anonymous ? 1 : 0
            });

            log.success('Resposta criada', { id: answerId });
            res.status(201).json({
                success: true,
                id: answerId,
                message: 'Resposta criada com sucesso'
            });
        } catch (error) {
            log.error('Erro ao criar resposta', { error: error.message });
            res.status(500).json({ error: 'Erro ao criar resposta', details: error.message });
        }
    },

    /**
     * Atualiza resposta
     * PUT /api/forum/answers/:id
     */
    async updateAnswer(req, res) {
        try {
            const { id } = req.params;
            log.start('PUT /answers/:id - Atualizar resposta', { id });

            const answer = await ForumModel.getAnswerById(Number(id));

            if (!answer) {
                return res.status(404).json({ error: 'Resposta não encontrada' });
            }

            // Verificar permissão: autor ou admin
            const isAdmin = req.user.role === 'admin';
            const isAuthor = answer.autor_id === req.user.id;

            if (!isAdmin && !isAuthor) {
                log.warn('Usuário sem permissão para editar');
                return res.status(403).json({ error: 'Você não tem permissão para editar esta resposta' });
            }

            const { conteudo } = req.body;

            if (!conteudo || conteudo.trim().length < 10) {
                return res.status(400).json({ error: 'Resposta deve ter pelo menos 10 caracteres' });
            }

            await ForumModel.updateAnswer(Number(id), { conteudo: conteudo.trim() });

            log.success('Resposta atualizada');
            res.json({ success: true, message: 'Resposta atualizada com sucesso' });
        } catch (error) {
            log.error('Erro ao atualizar resposta', { error: error.message });
            res.status(500).json({ error: 'Erro ao atualizar resposta', details: error.message });
        }
    },

    /**
     * Deleta resposta (autor ou admin)
     * DELETE /api/forum/answers/:id
     */
    async deleteAnswer(req, res) {
        try {
            const { id } = req.params;
            log.start('DELETE /answers/:id - Deletar resposta', { id });

            const answer = await ForumModel.getAnswerById(Number(id));

            if (!answer) {
                return res.status(404).json({ error: 'Resposta não encontrada' });
            }

            // Verificar permissão: autor ou admin
            const isAdmin = req.user.role === 'admin';
            const isAuthor = answer.autor_id === req.user.id;

            if (!isAdmin && !isAuthor) {
                log.warn('Usuário sem permissão para deletar');
                return res.status(403).json({ error: 'Você não tem permissão para deletar esta resposta' });
            }

            await ForumModel.deleteAnswer(Number(id));

            log.success('Resposta deletada');
            res.json({ success: true, message: 'Resposta deletada com sucesso' });
        } catch (error) {
            log.error('Erro ao deletar resposta', { error: error.message });
            res.status(500).json({ error: 'Erro ao deletar resposta', details: error.message });
        }
    },

    /**
     * Aceita/desaceita uma resposta
     * POST /api/forum/answers/:id/accept
     */
    async acceptAnswer(req, res) {
        try {
            const { id } = req.params;
            log.start('POST /answers/:id/accept - Aceitar resposta', { id });

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
                log.warn('Usuário sem permissão para aceitar resposta');
                return res.status(403).json({ error: 'Apenas o autor da pergunta ou admin pode aceitar respostas' });
            }

            const isNowAccepted = await ForumService.acceptAnswer(Number(id), answer.question_id, answer.autor_id);

            log.success('Resposta ' + (isNowAccepted ? 'aceita' : 'desaceita'));
            res.json({
                success: true,
                isAccepted: isNowAccepted,
                message: isNowAccepted ? 'Resposta aceita' : 'Resposta desaceita'
            });
        } catch (error) {
            log.error('Erro ao aceitar resposta', { error: error.message });
            res.status(500).json({ error: 'Erro ao aceitar resposta', details: error.message });
        }
    }
};
