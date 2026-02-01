// BookEvaluationsController gerencia as operações de controle para avaliações de livros,
// conectando as rotas aos modelos.
//
// Ratings: 0.5 a 5.0 em incrementos de 0.5 
// Critérios: Geral, Qualidade do Conteúdo, Legibilidade, Utilidade, Precisão
//
// Avaliações de estrelas são sempre anônimas
// Comentários mostram nome por padrão, mas usuário pode escolher anonimato
//
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const bookEvaluationsModel = require('../../models/library/BookEvaluationsModel');
const booksModel = require('../../models/library/BooksModel');

class BookEvaluationsController {

    /**
     * Valida se os ratings estão no formato correto (0.5 a 5.0, incrementos de 0.5)
     */
    _validateRating(rating) {
        if (rating === null || rating === undefined) return true;
        const num = parseFloat(rating);
        if (isNaN(num)) return false;
        if (num < 0.5 || num > 5.0) return false;
        // Verifica se é múltiplo de 0.5
        return (num * 2) % 1 === 0;
    }

    /**
     * Cria uma nova avaliação
     * POST /api/books/evaluations
     * Requer autenticação
     */
    async createEvaluation(req, res) {
        try {
            const userId = req.user.id;
            const {
                bookId,
                ratingGeral,
                ratingQualidade,
                ratingLegibilidade,
                ratingUtilidade,
                ratingPrecisao,
                comentario,
                isAnonymous
            } = req.body;

            console.log(`🔵 [BookEvaluationsController] Criando avaliação: bookId=${bookId}, user=${userId}`);

            // Validação: ID do livro obrigatório
            if (!bookId) {
                console.warn(`🟡 [BookEvaluationsController] ID do livro não fornecido`);
                return res.status(400).json({ error: 'ID do livro é obrigatório' });
            }

            // Validação: pelo menos um rating OU comentário deve ser fornecido
            const hasRating = [ratingGeral, ratingQualidade, ratingLegibilidade, ratingUtilidade, ratingPrecisao]
                .some(r => r !== null && r !== undefined);
            const hasComment = comentario && comentario.trim().length > 0;

            if (!hasRating && !hasComment) {
                console.warn(`🟡 [BookEvaluationsController] Nenhum rating ou comentário fornecido`);
                return res.status(400).json({ error: 'Forneça pelo menos um rating ou um comentário' });
            }

            // Validação: todos os ratings devem estar no formato correto
            const ratings = { ratingGeral, ratingQualidade, ratingLegibilidade, ratingUtilidade, ratingPrecisao };
            for (const [key, value] of Object.entries(ratings)) {
                if (!this._validateRating(value)) {
                    console.warn(`🟡 [BookEvaluationsController] Rating inválido: ${key}=${value}`);
                    return res.status(400).json({ error: `Rating ${key} deve ser entre 0.5 e 5.0, em incrementos de 0.5` });
                }
            }

            // Verifica se o livro existe
            const book = await booksModel.getBookById(bookId);
            if (!book) {
                console.warn(`🟡 [BookEvaluationsController] Livro não encontrado: ${bookId}`);
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            const result = await bookEvaluationsModel.createEvaluation({
                bookId,
                userId,
                ratingGeral: ratingGeral || null,
                ratingQualidade: ratingQualidade || null,
                ratingLegibilidade: ratingLegibilidade || null,
                ratingUtilidade: ratingUtilidade || null,
                ratingPrecisao: ratingPrecisao || null,
                comentario: comentario?.trim() || null,
                isAnonymous: isAnonymous || false
            });

            console.log(`🟢 [BookEvaluationsController] Avaliação criada: id=${result.id}`);
            res.status(201).json(result);
        } catch (error) {
            if (error.message === 'USER_ALREADY_EVALUATED') {
                console.warn(`🟡 [BookEvaluationsController] Usuário já avaliou este livro`);
                return res.status(409).json({ error: 'Você já avaliou este livro. Use a opção de editar.' });
            }
            console.error("🔴 [BookEvaluationsController] Erro ao criar avaliação:", error.message);
            res.status(500).json({ error: 'Erro ao criar avaliação' });
        }
    }

    /**
     * Atualiza uma avaliação existente
     * PUT /api/books/evaluations/:id
     * Requer autenticação, só permite editar própria avaliação
     */
    async updateEvaluation(req, res) {
        try {
            const userId = req.user.id;
            const evaluationId = parseInt(req.params.id);
            const {
                ratingGeral,
                ratingQualidade,
                ratingLegibilidade,
                ratingUtilidade,
                ratingPrecisao,
                comentario,
                isAnonymous
            } = req.body;

            console.log(`🔵 [BookEvaluationsController] Atualizando avaliação: id=${evaluationId}, user=${userId}`);

            // Validação: pelo menos um rating OU comentário deve ser fornecido
            const hasRating = [ratingGeral, ratingQualidade, ratingLegibilidade, ratingUtilidade, ratingPrecisao]
                .some(r => r !== null && r !== undefined);
            const hasComment = comentario && comentario.trim().length > 0;

            if (!hasRating && !hasComment) {
                console.warn(`🟡 [BookEvaluationsController] Nenhum rating ou comentário fornecido`);
                return res.status(400).json({ error: 'Forneça pelo menos um rating ou um comentário' });
            }

            // Validação de ratings
            const ratings = { ratingGeral, ratingQualidade, ratingLegibilidade, ratingUtilidade, ratingPrecisao };
            for (const [key, value] of Object.entries(ratings)) {
                if (!this._validateRating(value)) {
                    console.warn(`🟡 [BookEvaluationsController] Rating inválido: ${key}=${value}`);
                    return res.status(400).json({ error: `Rating ${key} deve ser entre 0.5 e 5.0, em incrementos de 0.5` });
                }
            }

            const result = await bookEvaluationsModel.updateEvaluation(evaluationId, userId, {
                ratingGeral: ratingGeral !== undefined ? (ratingGeral || null) : undefined,
                ratingQualidade: ratingQualidade !== undefined ? (ratingQualidade || null) : undefined,
                ratingLegibilidade: ratingLegibilidade !== undefined ? (ratingLegibilidade || null) : undefined,
                ratingUtilidade: ratingUtilidade !== undefined ? (ratingUtilidade || null) : undefined,
                ratingPrecisao: ratingPrecisao !== undefined ? (ratingPrecisao || null) : undefined,
                comentario: comentario?.trim() || null,
                isAnonymous
            });

            if (!result) {
                console.warn(`🟡 [BookEvaluationsController] Avaliação não encontrada ou não pertence ao usuário`);
                return res.status(404).json({ error: 'Avaliação não encontrada ou você não tem permissão para editá-la' });
            }

            console.log(`🟢 [BookEvaluationsController] Avaliação atualizada: id=${evaluationId}`);
            res.json(result);
        } catch (error) {
            console.error("🔴 [BookEvaluationsController] Erro ao atualizar avaliação:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar avaliação' });
        }
    }

    /**
     * Deleta uma avaliação
     * DELETE /api/books/evaluations/:id
     * Requer autenticação, só permite deletar própria avaliação
     */
    async deleteEvaluation(req, res) {
        try {
            const userId = req.user.id;
            const evaluationId = parseInt(req.params.id);

            console.log(`🔵 [BookEvaluationsController] Deletando avaliação: id=${evaluationId}, user=${userId}`);

            const deleted = await bookEvaluationsModel.deleteEvaluation(evaluationId, userId);

            if (!deleted) {
                console.warn(`🟡 [BookEvaluationsController] Avaliação não encontrada ou não pertence ao usuário`);
                return res.status(404).json({ error: 'Avaliação não encontrada ou você não tem permissão para excluí-la' });
            }

            console.log(`🟢 [BookEvaluationsController] Avaliação deletada: id=${evaluationId}`);
            res.json({ message: 'Avaliação excluída com sucesso' });
        } catch (error) {
            console.error("🔴 [BookEvaluationsController] Erro ao deletar avaliação:", error.message);
            res.status(500).json({ error: 'Erro ao deletar avaliação' });
        }
    }

    /**
     * Busca avaliações de um livro por ID
     * GET /api/books/:id/evaluations
     * Público (mas currentUserId é usado se autenticado para marcar próprias avaliações)
     */
    async getEvaluationsByBook(req, res) {
        try {
            const bookId = parseInt(req.params.id);
            const currentUserId = req.user?.id || null;

            console.log(`🔵 [BookEvaluationsController] Buscando avaliações: bookId=${bookId}`);

            const evaluations = await bookEvaluationsModel.getEvaluationsByBookId(bookId, currentUserId);

            console.log(`🟢 [BookEvaluationsController] ${evaluations.length} avaliações encontradas`);
            res.json(evaluations);
        } catch (error) {
            console.error("🔴 [BookEvaluationsController] Erro ao buscar avaliações:", error.message);
            res.status(500).json({ error: 'Erro ao buscar avaliações' });
        }
    }

    /**
     * Busca ratings agregados de um livro
     * GET /api/books/:id/evaluations/stats
     * Público
     */
    async getAggregatedRatings(req, res) {
        try {
            const bookId = parseInt(req.params.id);

            console.log(`🔵 [BookEvaluationsController] Buscando ratings agregados: bookId=${bookId}`);

            const stats = await bookEvaluationsModel.getAggregatedRatings(bookId);

            console.log(`🟢 [BookEvaluationsController] Ratings agregados retornados`);
            res.json(stats);
        } catch (error) {
            console.error("🔴 [BookEvaluationsController] Erro ao buscar ratings agregados:", error.message);
            res.status(500).json({ error: 'Erro ao buscar ratings' });
        }
    }

    /**
     * Busca a avaliação do usuário logado para um livro
     * GET /api/books/:id/evaluations/mine
     * Requer autenticação
     */
    async getUserEvaluationForBook(req, res) {
        try {
            const userId = req.user.id;
            const bookId = parseInt(req.params.id);

            console.log(`🔵 [BookEvaluationsController] Buscando avaliação do usuário: user=${userId}, bookId=${bookId}`);

            const evaluation = await bookEvaluationsModel.getUserEvaluationForBook(userId, bookId);

            if (!evaluation) {
                console.log(`🟡 [BookEvaluationsController] Usuário ainda não avaliou este livro`);
                return res.status(404).json({ error: 'Você ainda não avaliou este livro' });
            }

            console.log(`🟢 [BookEvaluationsController] Avaliação do usuário encontrada`);
            res.json(evaluation);
        } catch (error) {
            console.error("🔴 [BookEvaluationsController] Erro ao buscar avaliação do usuário:", error.message);
            res.status(500).json({ error: 'Erro ao buscar sua avaliação' });
        }
    }

    /**
     * Busca todas as avaliações do usuário logado
     * GET /api/books/evaluations/mine
     * Requer autenticação
     */
    async getUserEvaluations(req, res) {
        try {
            const userId = req.user.id;

            console.log(`🔵 [BookEvaluationsController] Buscando todas avaliações do usuário: user=${userId}`);

            const evaluations = await bookEvaluationsModel.getUserEvaluations(userId);

            console.log(`🟢 [BookEvaluationsController] ${evaluations.length} avaliações do usuário encontradas`);
            res.json(evaluations);
        } catch (error) {
            console.error("🔴 [BookEvaluationsController] Erro ao buscar avaliações do usuário:", error.message);
            res.status(500).json({ error: 'Erro ao buscar suas avaliações' });
        }
    }

    /**
     * Toggle like em uma avaliação
     * POST /api/books/evaluations/:id/like
     * Requer autenticação
     */
    async toggleLike(req, res) {
        try {
            const userId = req.user.id;
            const evaluationId = parseInt(req.params.id);

            console.log(`🔵 [BookEvaluationsController] Toggle like: evaluation=${evaluationId}, user=${userId}`);

            // Verifica se a avaliação existe
            const evaluation = await bookEvaluationsModel.getEvaluationById(evaluationId);
            if (!evaluation) {
                console.warn(`🟡 [BookEvaluationsController] Avaliação não encontrada: ${evaluationId}`);
                return res.status(404).json({ error: 'Avaliação não encontrada' });
            }

            // Não permite dar like na própria avaliação
            if (evaluation.user_id === userId) {
                console.warn(`🟡 [BookEvaluationsController] Usuário tentou dar like na própria avaliação`);
                return res.status(400).json({ error: 'Você não pode dar like na própria avaliação' });
            }

            const result = await bookEvaluationsModel.toggleLike(evaluationId, userId);

            console.log(`🟢 [BookEvaluationsController] Like ${result.liked ? 'adicionado' : 'removido'}`);
            res.json(result);
        } catch (error) {
            console.error("🔴 [BookEvaluationsController] Erro ao toggle like:", error.message);
            res.status(500).json({ error: 'Erro ao processar like' });
        }
    }
}

module.exports = new BookEvaluationsController();
