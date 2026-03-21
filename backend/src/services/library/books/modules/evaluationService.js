/**
 * Responsabilidade: casos de uso de avaliacoes de livros.
 * Camada: service.
 * Entradas/Saidas: cria, atualiza, remove e consulta avaliacoes de livros.
 * Dependencias criticas: BooksModel unificado e logger compartilhado.
 */

const BooksModel = require('../../../../models/library/books/BooksModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria avaliacao de livro para usuario autenticado.
     * Onde e usada: BooksController.createEvaluation.
     * Dependencias chamadas: validateEvaluationPayload, BooksModel.getBookById e BooksModel.createEvaluation.
     * Efeitos colaterais: persiste avaliacao no banco.
     */
    async createEvaluation(userId, payload) {
        const { bookId } = payload || {};
        log.start('Iniciando criacao de avaliacao', { user_id: userId, book_id: bookId });

        if (!bookId) {
            const error = new Error('ID do livro e obrigatorio');
            error.code = 'BOOK_ID_REQUIRED';
            throw error;
        }

        this.validateEvaluationPayload(payload);

        const book = await BooksModel.getBookById(bookId);
        if (!book) {
            const error = new Error('Livro nao encontrado');
            error.code = 'BOOK_NOT_FOUND';
            throw error;
        }

        try {
            const result = await BooksModel.createEvaluation({
                bookId,
                userId,
                ratingGeral: payload.ratingGeral || null,
                ratingQualidade: payload.ratingQualidade || null,
                ratingLegibilidade: payload.ratingLegibilidade || null,
                ratingUtilidade: payload.ratingUtilidade || null,
                ratingPrecisao: payload.ratingPrecisao || null,
                comentario: payload.comentario?.trim() || null,
                isAnonymous: Boolean(payload.isAnonymous)
            });
            log.success('Avaliacao criada com sucesso', { user_id: userId, book_id: bookId, evaluation_id: result.id });
            return result;
        } catch (error) {
            if (error.message === 'USER_ALREADY_EVALUATED') {
                const businessError = new Error('Voce ja avaliou este livro. Use a opcao de editar.');
                businessError.code = 'USER_ALREADY_EVALUATED';
                throw businessError;
            }
            log.error('Falha ao criar avaliacao', { user_id: userId, book_id: bookId, err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza avaliacao existente do proprio usuario.
     * Onde e usada: BooksController.updateEvaluation.
     * Dependencias chamadas: validateEvaluationPayload e BooksModel.updateEvaluation.
     * Efeitos colaterais: atualiza avaliacao no banco.
     */
    async updateEvaluation(evaluationId, userId, payload) {
        log.start('Iniciando atualizacao de avaliacao', { evaluation_id: evaluationId, user_id: userId });
        this.validateEvaluationPayload(payload);

        const result = await BooksModel.updateEvaluation(evaluationId, userId, {
            ratingGeral: payload.ratingGeral !== undefined ? (payload.ratingGeral || null) : undefined,
            ratingQualidade: payload.ratingQualidade !== undefined ? (payload.ratingQualidade || null) : undefined,
            ratingLegibilidade: payload.ratingLegibilidade !== undefined ? (payload.ratingLegibilidade || null) : undefined,
            ratingUtilidade: payload.ratingUtilidade !== undefined ? (payload.ratingUtilidade || null) : undefined,
            ratingPrecisao: payload.ratingPrecisao !== undefined ? (payload.ratingPrecisao || null) : undefined,
            comentario: payload.comentario?.trim() || null,
            isAnonymous: payload.isAnonymous
        });

        if (!result) {
            const error = new Error('Avaliacao nao encontrada ou sem permissao para editar');
            error.code = 'EVALUATION_NOT_FOUND_OR_FORBIDDEN';
            throw error;
        }

        log.success('Avaliacao atualizada com sucesso', { evaluation_id: evaluationId, user_id: userId });
        return result;
    },

    /**
     * O que faz: remove avaliacao do proprio usuario.
     * Onde e usada: BooksController.deleteEvaluation.
     * Dependencias chamadas: BooksModel.deleteEvaluation.
     * Efeitos colaterais: remove avaliacao no banco.
     */
    async deleteEvaluation(evaluationId, userId) {
        log.start('Iniciando remocao de avaliacao', { evaluation_id: evaluationId, user_id: userId });
        const deleted = await BooksModel.deleteEvaluation(evaluationId, userId);

        if (!deleted) {
            const error = new Error('Avaliacao nao encontrada ou sem permissao para excluir');
            error.code = 'EVALUATION_NOT_FOUND_OR_FORBIDDEN';
            throw error;
        }

        log.success('Avaliacao removida com sucesso', { evaluation_id: evaluationId, user_id: userId });
        return { message: 'Avaliacao excluida com sucesso' };
    },

    async getEvaluationsByBook(bookId, currentUserId = null) {
        return BooksModel.getEvaluationsByBookId(bookId, currentUserId);
    },

    async getAggregatedRatings(bookId) {
        return BooksModel.getAggregatedRatings(bookId);
    },

    async getUserEvaluationForBook(userId, bookId) {
        const evaluation = await BooksModel.getUserEvaluationForBook(userId, bookId);
        if (!evaluation) {
            const error = new Error('Voce ainda nao avaliou este livro');
            error.code = 'USER_EVALUATION_NOT_FOUND';
            throw error;
        }
        return evaluation;
    },

    async getUserEvaluations(userId) {
        return BooksModel.getUserEvaluations(userId);
    },

    /**
     * O que faz: alterna like em avaliacao com regras de propriedade.
     * Onde e usada: BooksController.toggleLike.
     * Dependencias chamadas: BooksModel.getEvaluationById e BooksModel.toggleLike.
     * Efeitos colaterais: cria/remove voto util e altera helpful_count.
     */
    async toggleLike(evaluationId, userId) {
        const evaluation = await BooksModel.getEvaluationById(evaluationId);
        if (!evaluation) {
            const error = new Error('Avaliacao nao encontrada');
            error.code = 'EVALUATION_NOT_FOUND';
            throw error;
        }

        if (evaluation.user_id === userId) {
            const error = new Error('Voce nao pode dar like na propria avaliacao');
            error.code = 'LIKE_OWN_EVALUATION_FORBIDDEN';
            throw error;
        }

        return BooksModel.toggleLike(evaluationId, userId);
    }
};
