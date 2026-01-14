// Importa funções utilitárias para executar queries no banco de dados
const { executeQuery, getQuery, allQuery } = require('../database/db');

/**
 * Modelo para operações no banco de dados relacionadas a avaliações de disciplinas.
 * Responsável apenas pela persistência e recuperação de dados.
 * 
 * Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
 * Avaliações de estrelas são sempre anônimas
 * Comentários mostram nome por padrão, mas usuário pode escolher anonimato
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class DisciplineEvaluationsModel {

    /**
     * Cria uma nova avaliação de disciplina
     * Um usuário só pode ter uma avaliação por disciplina (UNIQUE constraint)
     */
    async createEvaluation({
        disciplineId,
        userId,
        turmaCodigo = null,
        semestre = null,
        ratingGeral = null,
        ratingDificuldade = null,
        ratingCargaTrabalho = null,
        ratingProfessores = null,
        ratingClareza = null,
        ratingUtilidade = null,
        ratingOrganizacao = null,
        comentario = null,
        isAnonymous = false
    }) {
        console.log(`🔵 [DisciplineEvaluationsModel] Criando avaliação: disciplineId=${disciplineId}, userId=${userId}`);
        
        const query = `
            INSERT INTO discipline_evaluations (
                discipline_id, user_id, turma_codigo, semestre,
                rating_geral, rating_dificuldade, rating_carga_trabalho,
                rating_professores, rating_clareza, rating_utilidade, rating_organizacao,
                comentario, is_anonymous
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const result = await executeQuery(query, [
                disciplineId, userId, turmaCodigo, semestre,
                ratingGeral, ratingDificuldade, ratingCargaTrabalho,
                ratingProfessores, ratingClareza, ratingUtilidade, ratingOrganizacao,
                comentario, isAnonymous ? 1 : 0
            ]);
            console.log(`🟢 [DisciplineEvaluationsModel] Avaliação criada com ID: ${result.lastID}`);
            return { id: result.lastID };
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                console.log(`🟡 [DisciplineEvaluationsModel] Usuário já avaliou esta disciplina`);
                throw new Error('USER_ALREADY_EVALUATED');
            }
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao criar avaliação:", error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma avaliação existente
     * Só permite atualizar se o userId for o dono da avaliação
     */
    async updateEvaluation(evaluationId, userId, {
        turmaCodigo,
        semestre,
        ratingGeral,
        ratingDificuldade,
        ratingCargaTrabalho,
        ratingProfessores,
        ratingClareza,
        ratingUtilidade,
        ratingOrganizacao,
        comentario,
        isAnonymous
    }) {
        console.log(`🔵 [DisciplineEvaluationsModel] Atualizando avaliação: id=${evaluationId}, userId=${userId}`);
        
        const query = `
            UPDATE discipline_evaluations SET
                turma_codigo = COALESCE(?, turma_codigo),
                semestre = COALESCE(?, semestre),
                rating_geral = ?,
                rating_dificuldade = ?,
                rating_carga_trabalho = ?,
                rating_professores = ?,
                rating_clareza = ?,
                rating_utilidade = ?,
                rating_organizacao = ?,
                comentario = ?,
                is_anonymous = COALESCE(?, is_anonymous),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `;
        
        try {
            const result = await executeQuery(query, [
                turmaCodigo, semestre,
                ratingGeral, ratingDificuldade, ratingCargaTrabalho,
                ratingProfessores, ratingClareza, ratingUtilidade, ratingOrganizacao,
                comentario, isAnonymous !== undefined ? (isAnonymous ? 1 : 0) : null,
                evaluationId, userId
            ]);
            
            if (result.changes === 0) {
                console.log(`🟡 [DisciplineEvaluationsModel] Avaliação não encontrada ou não pertence ao usuário`);
                return null;
            }
            
            console.log(`🟢 [DisciplineEvaluationsModel] Avaliação atualizada: id=${evaluationId}`);
            return { id: evaluationId, updated: true };
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao atualizar avaliação:", error.message);
            throw error;
        }
    }

    /**
     * Deleta uma avaliação
     * Só permite deletar se o userId for o dono da avaliação
     */
    async deleteEvaluation(evaluationId, userId) {
        console.log(`🔵 [DisciplineEvaluationsModel] Deletando avaliação: id=${evaluationId}, userId=${userId}`);
        
        const query = `DELETE FROM discipline_evaluations WHERE id = ? AND user_id = ?`;
        
        try {
            const result = await executeQuery(query, [evaluationId, userId]);
            
            if (result.changes === 0) {
                console.log(`🟡 [DisciplineEvaluationsModel] Avaliação não encontrada ou não pertence ao usuário`);
                return false;
            }
            
            console.log(`🟢 [DisciplineEvaluationsModel] Avaliação deletada: id=${evaluationId}`);
            return true;
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao deletar avaliação:", error.message);
            throw error;
        }
    }

    /**
     * Busca avaliações de uma disciplina por código
     * Ordenado por helpful_count DESC (mais úteis primeiro)
     * Inclui nome do usuário para comentários (respeitando anonimato)
     */
    async getEvaluationsByDisciplineCodigo(disciplineCodigo, currentUserId = null) {
        console.log(`🔵 [DisciplineEvaluationsModel] Buscando avaliações: disciplineCodigo=${disciplineCodigo}`);
        
        const query = `
            SELECT 
                e.id,
                e.discipline_id,
                e.user_id,
                e.turma_codigo,
                e.semestre,
                e.rating_geral,
                e.rating_dificuldade,
                e.rating_carga_trabalho,
                e.rating_professores,
                e.rating_clareza,
                e.rating_utilidade,
                e.rating_organizacao,
                e.comentario,
                e.is_anonymous,
                e.helpful_count,
                e.created_at,
                e.updated_at,
                CASE WHEN e.is_anonymous = 1 THEN 'Anônimo' ELSE u.name END as user_name,
                CASE WHEN e.user_id = ? THEN 1 ELSE 0 END as is_own_evaluation,
                (SELECT COUNT(*) FROM evaluation_votes v WHERE v.evaluation_id = e.id AND v.user_id = ?) as user_has_voted
            FROM discipline_evaluations e
            INNER JOIN disciplines d ON e.discipline_id = d.id
            INNER JOIN users u ON e.user_id = u.id
            WHERE d.codigo = ?
            ORDER BY e.helpful_count DESC, e.created_at DESC
        `;
        
        try {
            const evaluations = await allQuery(query, [currentUserId, currentUserId, disciplineCodigo]);
            console.log(`🟢 [DisciplineEvaluationsModel] ${evaluations.length} avaliações encontradas`);
            return evaluations;
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao buscar avaliações:", error.message);
            throw error;
        }
    }

    /**
     * Busca avaliação do usuário para uma disciplina específica
     */
    async getUserEvaluationForDiscipline(userId, disciplineCodigo) {
        console.log(`🔵 [DisciplineEvaluationsModel] Buscando avaliação do usuário: userId=${userId}, codigo=${disciplineCodigo}`);
        
        const query = `
            SELECT e.*
            FROM discipline_evaluations e
            INNER JOIN disciplines d ON e.discipline_id = d.id
            WHERE e.user_id = ? AND d.codigo = ?
        `;
        
        try {
            const evaluation = await getQuery(query, [userId, disciplineCodigo]);
            if (evaluation) {
                console.log(`🟢 [DisciplineEvaluationsModel] Avaliação do usuário encontrada`);
            } else {
                console.log(`🟡 [DisciplineEvaluationsModel] Usuário ainda não avaliou esta disciplina`);
            }
            return evaluation;
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao buscar avaliação do usuário:", error.message);
            throw error;
        }
    }

    /**
     * Calcula ratings agregados (médias) de uma disciplina
     */
    async getAggregatedRatings(disciplineCodigo) {
        console.log(`🔵 [DisciplineEvaluationsModel] Calculando ratings agregados: codigo=${disciplineCodigo}`);
        
        const query = `
            SELECT 
                COUNT(*) as total_avaliacoes,
                ROUND(AVG(rating_geral), 1) as media_geral,
                ROUND(AVG(rating_dificuldade), 1) as media_dificuldade,
                ROUND(AVG(rating_carga_trabalho), 1) as media_carga_trabalho,
                ROUND(AVG(rating_professores), 1) as media_professores,
                ROUND(AVG(rating_clareza), 1) as media_clareza,
                ROUND(AVG(rating_utilidade), 1) as media_utilidade,
                ROUND(AVG(rating_organizacao), 1) as media_organizacao,
                COUNT(CASE WHEN comentario IS NOT NULL AND comentario != '' THEN 1 END) as total_comentarios
            FROM discipline_evaluations e
            INNER JOIN disciplines d ON e.discipline_id = d.id
            WHERE d.codigo = ?
        `;
        
        try {
            const stats = await getQuery(query, [disciplineCodigo]);
            console.log(`🟢 [DisciplineEvaluationsModel] Ratings agregados calculados: ${stats.total_avaliacoes} avaliações`);
            return stats;
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao calcular ratings:", error.message);
            throw error;
        }
    }

    /**
     * Toggle like em uma avaliação
     * Retorna true se adicionou like, false se removeu
     */
    async toggleLike(evaluationId, userId) {
        console.log(`🔵 [DisciplineEvaluationsModel] Toggle like: evaluationId=${evaluationId}, userId=${userId}`);
        
        // Verifica se já votou
        const existingVote = await getQuery(
            `SELECT id FROM evaluation_votes WHERE evaluation_id = ? AND user_id = ?`,
            [evaluationId, userId]
        );
        
        try {
            if (existingVote) {
                // Remove o voto
                await executeQuery(
                    `DELETE FROM evaluation_votes WHERE evaluation_id = ? AND user_id = ?`,
                    [evaluationId, userId]
                );
                // Decrementa contador
                await executeQuery(
                    `UPDATE discipline_evaluations SET helpful_count = helpful_count - 1 WHERE id = ?`,
                    [evaluationId]
                );
                console.log(`🟢 [DisciplineEvaluationsModel] Like removido`);
                return { liked: false };
            } else {
                // Adiciona o voto
                await executeQuery(
                    `INSERT INTO evaluation_votes (evaluation_id, user_id) VALUES (?, ?)`,
                    [evaluationId, userId]
                );
                // Incrementa contador
                await executeQuery(
                    `UPDATE discipline_evaluations SET helpful_count = helpful_count + 1 WHERE id = ?`,
                    [evaluationId]
                );
                console.log(`🟢 [DisciplineEvaluationsModel] Like adicionado`);
                return { liked: true };
            }
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao toggle like:", error.message);
            throw error;
        }
    }

    /**
     * Busca avaliação por ID
     */
    async getEvaluationById(evaluationId) {
        console.log(`🔵 [DisciplineEvaluationsModel] Buscando avaliação por ID: ${evaluationId}`);
        
        const query = `SELECT * FROM discipline_evaluations WHERE id = ?`;
        
        try {
            const evaluation = await getQuery(query, [evaluationId]);
            if (evaluation) {
                console.log(`🟢 [DisciplineEvaluationsModel] Avaliação encontrada`);
            } else {
                console.log(`🟡 [DisciplineEvaluationsModel] Avaliação não encontrada`);
            }
            return evaluation;
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao buscar avaliação:", error.message);
            throw error;
        }
    }

    /**
     * Busca todas as avaliações de um usuário
     */
    async getUserEvaluations(userId) {
        console.log(`🔵 [DisciplineEvaluationsModel] Buscando avaliações do usuário: userId=${userId}`);
        
        const query = `
            SELECT 
                e.*,
                d.codigo as discipline_codigo,
                d.nome as discipline_nome
            FROM discipline_evaluations e
            INNER JOIN disciplines d ON e.discipline_id = d.id
            WHERE e.user_id = ?
            ORDER BY e.updated_at DESC
        `;
        
        try {
            const evaluations = await allQuery(query, [userId]);
            console.log(`🟢 [DisciplineEvaluationsModel] ${evaluations.length} avaliações do usuário encontradas`);
            return evaluations;
        } catch (error) {
            console.error("🔴 [DisciplineEvaluationsModel] Erro ao buscar avaliações do usuário:", error.message);
            throw error;
        }
    }
}

module.exports = new DisciplineEvaluationsModel();
