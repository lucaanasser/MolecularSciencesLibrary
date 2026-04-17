/**
 * Responsabilidade: handlers HTTP de avaliacoes de livros.
 * Camada: controller.
 * Entradas/Saidas: requests de avaliacoes e respostas HTTP para CRUD/likes/stats.
 * Dependencias criticas: BooksService unificado e logger compartilhado.
 */

const BooksService = require('../../../../services/library/books/BooksService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

const mapEvaluationErrorToHttp = (error) => {
    const code = error?.code;
    if (code === 'BOOK_ID_REQUIRED') return { status: 400, body: { error: error.message } };
    if (code === 'BOOK_NOT_FOUND') return { status: 404, body: { error: error.message } };
    if (code === 'INVALID_EVALUATION_EMPTY') return { status: 400, body: { error: error.message } };
    if (code === 'INVALID_RATING_FORMAT') return { status: 400, body: { error: error.message } };
    if (code === 'USER_ALREADY_EVALUATED') return { status: 409, body: { error: error.message } };
    if (code === 'EVALUATION_NOT_FOUND_OR_FORBIDDEN') return { status: 404, body: { error: error.message } };
    if (code === 'USER_EVALUATION_NOT_FOUND') return { status: 404, body: { error: error.message } };
    if (code === 'EVALUATION_NOT_FOUND') return { status: 404, body: { error: error.message } };
    if (code === 'LIKE_OWN_EVALUATION_FORBIDDEN') return { status: 400, body: { error: error.message } };
    return { status: 500, body: { error: 'Erro interno ao processar avaliacao' } };
};

module.exports = {
    async createEvaluation(req, res) {
        const userId = req?.user?.id;
        try {
            const result = await BooksService.createEvaluation(userId, req.body || {});
            return res.status(201).json(result);
        } catch (error) {
            log.error('Falha ao criar avaliacao', { user_id: userId, err: error.message });
            const mapped = mapEvaluationErrorToHttp(error);
            return res.status(mapped.status).json(mapped.body);
        }
    },

    async updateEvaluation(req, res) {
        const userId = req?.user?.id;
        const evaluationId = Number(req.params.id);
        try {
            const result = await BooksService.updateEvaluation(evaluationId, userId, req.body || {});
            return res.json(result);
        } catch (error) {
            log.error('Falha ao atualizar avaliacao', { user_id: userId, evaluation_id: evaluationId, err: error.message });
            const mapped = mapEvaluationErrorToHttp(error);
            return res.status(mapped.status).json(mapped.body);
        }
    },

    async deleteEvaluation(req, res) {
        const userId = req?.user?.id;
        const evaluationId = Number(req.params.id);
        try {
            const result = await BooksService.deleteEvaluation(evaluationId, userId);
            return res.json(result);
        } catch (error) {
            const mapped = mapEvaluationErrorToHttp(error);
            return res.status(mapped.status).json(mapped.body);
        }
    },

    async getEvaluationsByBook(req, res) {
        const bookId = Number(req.params.id);
        const currentUserId = req?.user?.id || null;
        try {
            const evaluations = await BooksService.getEvaluationsByBook(bookId, currentUserId);
            return res.json(evaluations);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar avaliacoes' });
        }
    },

    async getAggregatedRatings(req, res) {
        const bookId = Number(req.params.id);
        try {
            const stats = await BooksService.getAggregatedRatings(bookId);
            return res.json(stats);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar ratings' });
        }
    },

    async getUserEvaluationForBook(req, res) {
        const userId = req?.user?.id;
        const bookId = Number(req.params.id);
        try {
            const evaluation = await BooksService.getUserEvaluationForBook(userId, bookId);
            return res.json(evaluation);
        } catch (error) {
            const mapped = mapEvaluationErrorToHttp(error);
            return res.status(mapped.status).json(mapped.body);
        }
    },

    async getUserEvaluations(req, res) {
        const userId = req?.user?.id;
        try {
            const evaluations = await BooksService.getUserEvaluations(userId);
            return res.json(evaluations);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar suas avaliacoes' });
        }
    },

    async toggleLike(req, res) {
        const userId = req?.user?.id;
        const evaluationId = Number(req.params.id);
        try {
            const result = await BooksService.toggleLike(evaluationId, userId);
            return res.json(result);
        } catch (error) {
            const mapped = mapEvaluationErrorToHttp(error);
            return res.status(mapped.status).json(mapped.body);
        }
    }
};
