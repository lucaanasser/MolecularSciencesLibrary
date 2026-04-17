/**
 * Responsabilidade: validacoes de negocio para disciplinas e avaliacoes.
 * Camada: service.
 * Entradas/Saidas: payload de input; retorna estado de validacao padronizado.
 * Dependencias criticas: logger padronizado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: valida formato de rating (0.5 a 5.0 em passos de 0.5).
 * Onde e usada: createEvaluation e updateEvaluation.
 * Dependencias chamadas: nenhuma.
 * Efeitos colaterais: nenhum.
 */
function validateRating(rating) {
    if (rating === null || rating === undefined) return true;

    const parsed = parseFloat(rating);
    if (Number.isNaN(parsed)) return false;
    if (parsed < 0.5 || parsed > 5.0) return false;

    return (parsed * 2) % 1 === 0;
}

/**
 * O que faz: valida payload de avaliacao e retorna erros sem lancar excecao.
 * Onde e usada: handlers de avaliacao no controller.
 * Dependencias chamadas: validateRating.
 * Efeitos colaterais: log de warning em invalidacoes.
 */
function validateEvaluationPayload(payload = {}) {
    const ratingKeys = [
        'ratingGeral',
        'ratingDificuldade',
        'ratingCargaTrabalho',
        'ratingProfessores',
        'ratingClareza',
        'ratingUtilidade',
        'ratingOrganizacao'
    ];

    const hasRating = ratingKeys.some(key => payload[key] !== null && payload[key] !== undefined);
    const hasComment = Boolean(payload.comentario && String(payload.comentario).trim().length > 0);

    if (!hasRating && !hasComment) {
        log.warn('Payload de avaliacao sem rating e sem comentario');
        return { ok: false, error: 'Forneça pelo menos um rating ou um comentário' };
    }

    for (const key of ratingKeys) {
        if (!validateRating(payload[key])) {
            log.warn('Rating invalido no payload', { field: key, value: payload[key] });
            return {
                ok: false,
                error: `Rating ${key} deve ser entre 0.5 e 5.0, em incrementos de 0.5`
            };
        }
    }

    return { ok: true };
}

module.exports = {
    validateRating,
    validateEvaluationPayload
};
