/**
 * Responsabilidade: consultas de avaliacoes e estatisticas de disciplina.
 * Camada: model.
 * Entradas/Saidas: codigo de disciplina e user_id; retorna colecoes/estatisticas.
 * Dependencias criticas: db helpers e logger padronizado.
 */

const { getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: lista avaliacoes por codigo de disciplina com dados de usuario.
 * Onde e usada: endpoint publico de avaliacoes.
 * Dependencias chamadas: allQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getEvaluationsByDisciplineCodigo(disciplineCodigo, currentUserId = null) {
    log.start('Buscando avaliacoes da disciplina', { codigo: disciplineCodigo, current_user_id: currentUserId });

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

    const rows = await allQuery(query, [currentUserId, currentUserId, disciplineCodigo]);
    log.success('Avaliacoes carregadas', { codigo: disciplineCodigo, count: rows.length });
    return rows;
}

/**
 * O que faz: busca avaliacao de um usuario para uma disciplina.
 * Onde e usada: endpoint mine por disciplina.
 * Dependencias chamadas: getQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getUserEvaluationForDiscipline(userId, disciplineCodigo) {
    log.start('Buscando avaliacao do usuario para disciplina', { user_id: userId, codigo: disciplineCodigo });

    const query = `
        SELECT e.*
        FROM discipline_evaluations e
        INNER JOIN disciplines d ON e.discipline_id = d.id
        WHERE e.user_id = ? AND d.codigo = ?
    `;

    const row = await getQuery(query, [userId, disciplineCodigo]);
    if (!row) {
        log.warn('Usuario ainda nao avaliou disciplina', { user_id: userId, codigo: disciplineCodigo });
        return null;
    }

    log.success('Avaliacao do usuario encontrada', { user_id: userId, evaluation_id: row.id });
    return row;
}

/**
 * O que faz: calcula medias e contadores agregados de avaliacao.
 * Onde e usada: endpoint de stats de avaliacao.
 * Dependencias chamadas: getQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getAggregatedRatings(disciplineCodigo) {
    log.start('Calculando ratings agregados', { codigo: disciplineCodigo });

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

    const stats = await getQuery(query, [disciplineCodigo]);
    log.success('Ratings agregados calculados', { codigo: disciplineCodigo, total: stats?.total_avaliacoes || 0 });
    return stats;
}

/**
 * O que faz: busca avaliacao por id.
 * Onde e usada: validacao antes de like/update.
 * Dependencias chamadas: getQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getEvaluationById(evaluationId) {
    log.start('Buscando avaliacao por id', { evaluation_id: evaluationId });
    const row = await getQuery('SELECT * FROM discipline_evaluations WHERE id = ?', [evaluationId]);
    if (!row) {
        log.warn('Avaliacao nao encontrada por id', { evaluation_id: evaluationId });
        return null;
    }
    log.success('Avaliacao encontrada por id', { evaluation_id: evaluationId });
    return row;
}

/**
 * O que faz: lista avaliacoes do usuario logado.
 * Onde e usada: endpoint mine.
 * Dependencias chamadas: allQuery.
 * Efeitos colaterais: consulta em DB.
 */
async function getUserEvaluations(userId) {
    log.start('Buscando avaliacoes do usuario', { user_id: userId });

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

    const rows = await allQuery(query, [userId]);
    log.success('Avaliacoes do usuario carregadas', { user_id: userId, count: rows.length });
    return rows;
}

module.exports = {
    getEvaluationsByDisciplineCodigo,
    getUserEvaluationForDiscipline,
    getAggregatedRatings,
    getEvaluationById,
    getUserEvaluations
};
