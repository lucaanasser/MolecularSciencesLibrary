// Importa funções utilitárias para executar queries no banco de dados
const { executeQuery, getQuery, allQuery } = require('../../database/db');

/**
 * Modelo para operações no banco de dados relacionadas a avaliações de livros.
 * Responsável apenas pela persistência e recuperação de dados.
 * 
 * Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
 * Critérios: Geral, Qualidade do Conteúdo, Legibilidade, Utilidade, Precisão
 * 
 * Avaliações de estrelas são sempre anônimas
 * Comentários mostram nome por padrão, mas usuário pode escolher anonimato
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class BookEvaluationsModel {

    /**
     * Cria uma nova avaliação de livro
     * Um usuário só pode ter uma avaliação por livro (UNIQUE constraint)
     */
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
        console.log(`🔵 [BookEvaluationsModel] Criando avaliação: bookId=${bookId}, userId=${userId}`);
        
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
                bookId, userId,
                ratingGeral, ratingQualidade, ratingLegibilidade,
                ratingUtilidade, ratingPrecisao,
                comentario, isAnonymous ? 1 : 0
            ]);
            console.log(`🟢 [BookEvaluationsModel] Avaliação criada com ID: ${result.lastID}`);
            return { id: result.lastID };
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                console.log(`🟡 [BookEvaluationsModel] Usuário já avaliou este livro`);
                throw new Error('USER_ALREADY_EVALUATED');
            }
            console.error("🔴 [BookEvaluationsModel] Erro ao criar avaliação:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma avaliação existente
     * Só permite atualizar se o userId for o dono da avaliação
     */
    async updateEvaluation(evaluationId, userId, {
        ratingGeral,
        ratingQualidade,
        ratingLegibilidade,
        ratingUtilidade,
        ratingPrecisao,
        comentario,
        isAnonymous
    }) {
        console.log(`🔵 [BookEvaluationsModel] Atualizando avaliação: id=${evaluationId}, userId=${userId}`);
        
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
        
        try {
            const result = await executeQuery(query, [
                ratingGeral, ratingQualidade, ratingLegibilidade,
                ratingUtilidade, ratingPrecisao,
                comentario, isAnonymous !== undefined ? (isAnonymous ? 1 : 0) : null,
                evaluationId, userId
            ]);
            
            if (result.changes === 0) {
                console.log(`🟡 [BookEvaluationsModel] Avaliação não encontrada ou não pertence ao usuário`);
                return null;
            }
            
            console.log(`🟢 [BookEvaluationsModel] Avaliação atualizada: id=${evaluationId}`);
            return { id: evaluationId, updated: true };
        } catch (error) {
            console.error("🔴 [BookEvaluationsModel] Erro ao atualizar avaliação:", error.message);
            throw error;
        }
    }

    /**
     * Deleta uma avaliação
     * Só permite deletar se o userId for o dono da avaliação
     */
    async deleteEvaluation(evaluationId, userId) {
        console.log(`🔵 [BookEvaluationsModel] Deletando avaliação: id=${evaluationId}, userId=${userId}`);
        
        const query = `DELETE FROM book_evaluations WHERE id = ? AND user_id = ?`;
        
        try {
            const result = await executeQuery(query, [evaluationId, userId]);
            
            if (result.changes === 0) {
                console.log(`🟡 [BookEvaluationsModel] Avaliação não encontrada ou não pertence ao usuário`);
                return false;
            }
            
            console.log(`🟢 [BookEvaluationsModel] Avaliação deletada: id=${evaluationId}`);
            return true;
        } catch (error) {
            console.error("🔴 [BookEvaluationsModel] Erro ao deletar avaliação:", error.message);
            throw error;
        }
    }

    /**
     * Busca avaliações de um livro por ID
     * Ordenado por helpful_count DESC (mais úteis primeiro)
     * Inclui nome do usuário para comentários (respeitando anonimato)
     */
    async getEvaluationsByBookId(bookId, currentUserId = null) {
        console.log(`🔵 [BookEvaluationsModel] Buscando avaliações: bookId=${bookId}`);
        
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
        
        try {
            const evaluations = await allQuery(query, [currentUserId, currentUserId, bookId]);
            console.log(`🟢 [BookEvaluationsModel] ${evaluations.length} avaliações encontradas`);
            return evaluations;
        } catch (error) {
            console.error("🔴 [BookEvaluationsModel] Erro ao buscar avaliações:", error.message);
            throw error;
        }
    }

    /**
     * Busca avaliação do usuário para um livro específico
     */
    async getUserEvaluationForBook(userId, bookId) {
        console.log(`🔵 [BookEvaluationsModel] Buscando avaliação do usuário: userId=${userId}, bookId=${bookId}`);
        
        const query = `
            SELECT e.*
            FROM book_evaluations e
            WHERE e.user_id = ? AND e.book_id = ?
        `;
        
        try {
            const evaluation = await getQuery(query, [userId, bookId]);
            if (evaluation) {
                console.log(`🟢 [BookEvaluationsModel] Avaliação do usuário encontrada`);
            } else {
                console.log(`🟡 [BookEvaluationsModel] Usuário ainda não avaliou este livro`);
            }
            return evaluation;
        } catch (error) {
            console.error("🔴 [BookEvaluationsModel] Erro ao buscar avaliação do usuário:", error.message);
            throw error;
        }
    }

    /**
     * Calcula ratings agregados (médias) de um livro
     */
    async getAggregatedRatings(bookId) {
        console.log(`🔵 [BookEvaluationsModel] Calculando ratings agregados: bookId=${bookId}`);
        
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
        
        try {
            const stats = await getQuery(query, [bookId]);
            console.log(`🟢 [BookEvaluationsModel] Ratings agregados calculados: ${stats.total_avaliacoes} avaliações`);
            return stats;
        } catch (error) {
            console.error("🔴 [BookEvaluationsModel] Erro ao calcular ratings:", error.message);
            throw error;
        }
    }

    /**
     * Toggle like em uma avaliação
     * Retorna true se adicionou like, false se removeu
     */
    async toggleLike(evaluationId, userId) {
        console.log(`🔵 [BookEvaluationsModel] Toggle like: evaluationId=${evaluationId}, userId=${userId}`);
        
        // Verifica se já votou
        const existingVote = await getQuery(
            `SELECT id FROM book_evaluation_votes WHERE evaluation_id = ? AND user_id = ?`,
            [evaluationId, userId]
        );
        
        try {
            if (existingVote) {
                // Remove o voto
                await executeQuery(
                    `DELETE FROM book_evaluation_votes WHERE evaluation_id = ? AND user_id = ?`,
                    [evaluationId, userId]
                );
                // Decrementa contador
                await executeQuery(
                    `UPDATE book_evaluations SET helpful_count = helpful_count - 1 WHERE id = ?`,
                    [evaluationId]
                );
                console.log(`🟢 [BookEvaluationsModel] Like removido`);
                return { liked: false };
            } else {
                // Adiciona o voto
                await executeQuery(
                    `INSERT INTO book_evaluation_votes (evaluation_id, user_id) VALUES (?, ?)`,
                    [evaluationId, userId]
                );
                // Incrementa contador
                await executeQuery(
                    `UPDATE book_evaluations SET helpful_count = helpful_count + 1 WHERE id = ?`,
                    [evaluationId]
                );
                console.log(`🟢 [BookEvaluationsModel] Like adicionado`);
                return { liked: true };
            }
        } catch (error) {
            console.error("🔴 [BookEvaluationsModel] Erro ao toggle like:", error.message);
            throw error;
        }
    }

    /**
     * Busca avaliação por ID
     */
    async getEvaluationById(evaluationId) {
        console.log(`🔵 [BookEvaluationsModel] Buscando avaliação por ID: ${evaluationId}`);
        
        const query = `SELECT * FROM book_evaluations WHERE id = ?`;
        
        try {
            const evaluation = await getQuery(query, [evaluationId]);
            if (evaluation) {
                console.log(`🟢 [BookEvaluationsModel] Avaliação encontrada`);
            } else {
                console.log(`🟡 [BookEvaluationsModel] Avaliação não encontrada`);
            }
            return evaluation;
        } catch (error) {
            console.error("🔴 [BookEvaluationsModel] Erro ao buscar avaliação:", error.message);
            throw error;
        }
    }

    /**
     * Busca todas as avaliações de um usuário
     */
    async getUserEvaluations(userId) {
        console.log(`🔵 [BookEvaluationsModel] Buscando avaliações do usuário: userId=${userId}`);
        
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
        
        try {
            const evaluations = await allQuery(query, [userId]);
            console.log(`🟢 [BookEvaluationsModel] ${evaluations.length} avaliações do usuário encontradas`);
            return evaluations;
        } catch (error) {
            console.error("🔴 [BookEvaluationsModel] Erro ao buscar avaliações do usuário:", error.message);
            throw error;
        }
    }
}

module.exports = new BookEvaluationsModel();
