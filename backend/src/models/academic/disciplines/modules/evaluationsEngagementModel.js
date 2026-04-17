/**
 * Responsabilidade: interacoes sociais em avaliacoes (votes/likes).
 * Camada: model.
 * Entradas/Saidas: evaluation_id e user_id; retorna estado final do like.
 * Dependencias criticas: db helpers e logger padronizado.
 */

const { executeQuery, getQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: alterna like em avaliacao e atualiza contador de utilidade.
 * Onde e usada: AcademicDisciplinesService.toggleLike.
 * Dependencias chamadas: getQuery, executeQuery.
 * Efeitos colaterais: escrita em DB em duas tabelas.
 */
async function toggleLike(evaluationId, userId) {
    log.start('Executando toggle like', { evaluation_id: evaluationId, user_id: userId });

    const existingVote = await getQuery(
        'SELECT id FROM evaluation_votes WHERE evaluation_id = ? AND user_id = ?',
        [evaluationId, userId]
    );

    if (existingVote) {
        await executeQuery(
            'DELETE FROM evaluation_votes WHERE evaluation_id = ? AND user_id = ?',
            [evaluationId, userId]
        );
        await executeQuery(
            'UPDATE discipline_evaluations SET helpful_count = helpful_count - 1 WHERE id = ?',
            [evaluationId]
        );

        log.success('Like removido', { evaluation_id: evaluationId, user_id: userId });
        return { liked: false };
    }

    await executeQuery(
        'INSERT INTO evaluation_votes (evaluation_id, user_id) VALUES (?, ?)',
        [evaluationId, userId]
    );
    await executeQuery(
        'UPDATE discipline_evaluations SET helpful_count = helpful_count + 1 WHERE id = ?',
        [evaluationId]
    );

    log.success('Like adicionado', { evaluation_id: evaluationId, user_id: userId });
    return { liked: true };
}

module.exports = {
    toggleLike
};
