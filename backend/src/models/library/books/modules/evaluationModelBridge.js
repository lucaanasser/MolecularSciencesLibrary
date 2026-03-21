/**
 * Responsabilidade: persistencia de avaliacoes de livros no dominio unificado books.
 * Camada: model.
 * Entradas/Saidas: CRUD e agregacoes de book_evaluations e votos.
 * Dependencias criticas: database/db.
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');

module.exports = {
    async createEvaluation({
        bookId,
        userId,
        ratingGeral = null,
        ratingQualidade = null,
        ratingLegibilidade = null,
        ratingUtilidade = null,
        ratingPrecisao = null,
        comentario = null,
        isAnonymous = false
    }) {
        const query = `
            INSERT INTO book_evaluations (
                book_id, user_id,
                rating_geral, rating_qualidade, rating_legibilidade,
                rating_utilidade, rating_precisao,
                comentario, is_anonymous
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const result = await executeQuery(query, [
                bookId,
                userId,
                ratingGeral,
                ratingQualidade,
                ratingLegibilidade,
                ratingUtilidade,
                ratingPrecisao,
                comentario,
                isAnonymous ? 1 : 0
            ]);
            return { id: result.lastID };
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('USER_ALREADY_EVALUATED');
            }
            throw error;
        }
    },

    async updateEvaluation(evaluationId, userId, {
        ratingGeral,
        ratingQualidade,
        ratingLegibilidade,
        ratingUtilidade,
        ratingPrecisao,
        comentario,
        isAnonymous
    }) {
        const query = `
            UPDATE book_evaluations SET
                rating_geral = ?,
                rating_qualidade = ?,
                rating_legibilidade = ?,
                rating_utilidade = ?,
                rating_precisao = ?,
                comentario = ?,
                is_anonymous = COALESCE(?, is_anonymous),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `;

        const result = await executeQuery(query, [
            ratingGeral,
            ratingQualidade,
            ratingLegibilidade,
            ratingUtilidade,
            ratingPrecisao,
            comentario,
            isAnonymous !== undefined ? (isAnonymous ? 1 : 0) : null,
            evaluationId,
            userId
        ]);

        if (result.changes === 0) return null;
        return { id: evaluationId, updated: true };
    },

    async deleteEvaluation(evaluationId, userId) {
        const result = await executeQuery('DELETE FROM book_evaluations WHERE id = ? AND user_id = ?', [evaluationId, userId]);
        return result.changes > 0;
    },

    async getEvaluationsByBookId(bookId, currentUserId = null) {
        const query = `
            SELECT
                e.id,
                e.book_id,
                e.user_id,
                e.rating_geral,
                e.rating_qualidade,
                e.rating_legibilidade,
                e.rating_utilidade,
                e.rating_precisao,
                e.comentario,
                e.is_anonymous,
                e.helpful_count,
                e.created_at,
                e.updated_at,
                CASE WHEN e.is_anonymous = 1 THEN 'Anônimo' ELSE u.name END as user_name,
                CASE WHEN e.user_id = ? THEN 1 ELSE 0 END as is_own_evaluation,
                (SELECT COUNT(*) FROM book_evaluation_votes v WHERE v.evaluation_id = e.id AND v.user_id = ?) as user_has_voted
            FROM book_evaluations e
            INNER JOIN users u ON e.user_id = u.id
            WHERE e.book_id = ?
            ORDER BY e.helpful_count DESC, e.created_at DESC
        `;
        return allQuery(query, [currentUserId, currentUserId, bookId]);
    },

    async getUserEvaluationForBook(userId, bookId) {
        return getQuery('SELECT e.* FROM book_evaluations e WHERE e.user_id = ? AND e.book_id = ?', [userId, bookId]);
    },

    async getAggregatedRatings(bookId) {
        const query = `
            SELECT
                COUNT(*) as total_avaliacoes,
                ROUND(AVG(rating_geral), 1) as media_geral,
                ROUND(AVG(rating_qualidade), 1) as media_qualidade,
                ROUND(AVG(rating_legibilidade), 1) as media_legibilidade,
                ROUND(AVG(rating_utilidade), 1) as media_utilidade,
                ROUND(AVG(rating_precisao), 1) as media_precisao,
                COUNT(CASE WHEN comentario IS NOT NULL AND comentario != '' THEN 1 END) as total_comentarios
            FROM book_evaluations
            WHERE book_id = ?
        `;
        return getQuery(query, [bookId]);
    },

    async toggleLike(evaluationId, userId) {
        const existingVote = await getQuery('SELECT id FROM book_evaluation_votes WHERE evaluation_id = ? AND user_id = ?', [evaluationId, userId]);

        if (existingVote) {
            await executeQuery('DELETE FROM book_evaluation_votes WHERE evaluation_id = ? AND user_id = ?', [evaluationId, userId]);
            await executeQuery('UPDATE book_evaluations SET helpful_count = helpful_count - 1 WHERE id = ?', [evaluationId]);
            return { liked: false };
        }

        await executeQuery('INSERT INTO book_evaluation_votes (evaluation_id, user_id) VALUES (?, ?)', [evaluationId, userId]);
        await executeQuery('UPDATE book_evaluations SET helpful_count = helpful_count + 1 WHERE id = ?', [evaluationId]);
        return { liked: true };
    },

    async getEvaluationById(evaluationId) {
        return getQuery('SELECT * FROM book_evaluations WHERE id = ?', [evaluationId]);
    },

    async getUserEvaluations(userId) {
        const query = `
            SELECT
                e.*,
                b.title as book_title,
                b.authors as book_authors,
                b.code as book_code
            FROM book_evaluations e
            INNER JOIN books b ON e.book_id = b.id
            WHERE e.user_id = ?
            ORDER BY e.updated_at DESC
        `;
        return allQuery(query, [userId]);
    }
};
