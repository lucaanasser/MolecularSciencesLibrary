/**
 * Responsabilidade: validacoes de negocio para avaliacoes de livros.
 * Camada: service.
 * Entradas/Saidas: valida ratings e payload de avaliacao.
 * Dependencias criticas: nenhuma.
 */

module.exports = {
    /**
     * O que faz: valida formato de rating no intervalo 0.5-5.0 em incrementos de 0.5.
     * Onde e usada: createEvaluation e updateEvaluation.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum; validacao pura.
     */
    _validateRating(rating) {
        if (rating === null || rating === undefined) return true;
        const num = parseFloat(rating);
        if (Number.isNaN(num)) return false;
        if (num < 0.5 || num > 5.0) return false;
        return (num * 2) % 1 === 0;
    },

    /**
     * O que faz: valida se payload contem rating ou comentario e se ratings sao validos.
     * Onde e usada: createEvaluation e updateEvaluation.
     * Dependencias chamadas: _validateRating.
     * Efeitos colaterais: nenhum; pode lancar erro de validacao.
     */
    validateEvaluationPayload(payload) {
        const {
            ratingGeral,
            ratingQualidade,
            ratingLegibilidade,
            ratingUtilidade,
            ratingPrecisao,
            comentario
        } = payload || {};

        const hasRating = [ratingGeral, ratingQualidade, ratingLegibilidade, ratingUtilidade, ratingPrecisao]
            .some((rating) => rating !== null && rating !== undefined);

        const hasComment = Boolean(comentario && String(comentario).trim().length > 0);

        if (!hasRating && !hasComment) {
            const error = new Error('Forneca pelo menos um rating ou um comentario');
            error.code = 'INVALID_EVALUATION_EMPTY';
            throw error;
        }

        const ratings = { ratingGeral, ratingQualidade, ratingLegibilidade, ratingUtilidade, ratingPrecisao };
        for (const [key, value] of Object.entries(ratings)) {
            if (!this._validateRating(value)) {
                const error = new Error(`Rating ${key} deve ser entre 0.5 e 5.0, em incrementos de 0.5`);
                error.code = 'INVALID_RATING_FORMAT';
                error.field = key;
                error.value = value;
                throw error;
            }
        }
    }
};
