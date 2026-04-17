/**
 * Responsabilidade: comandos de negocio para criar/editar/remover avaliacoes.
 * Camada: service.
 * Entradas/Saidas: payload de avaliacao e identificadores; retorna estado consolidado.
 * Dependencias criticas: AcademicDisciplinesModel, validationsService e logger padronizado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: cria avaliacao garantindo disciplina existente e payload valido.
 * Onde e usada: handler POST de avaliacoes.
 * Dependencias chamadas: validateEvaluationPayload, model.getDisciplineByCodigo, model.createEvaluation.
 * Efeitos colaterais: escrita em DB.
 */
async function createEvaluation(userId, payload) {
    log.start('Service criando avaliacao', { user_id: userId, codigo: payload.disciplineCodigo });

    const validation = this.validateEvaluationPayload(payload);
    if (!validation.ok) {
        return { error: validation.error, status: 400 };
    }

    if (!payload.disciplineCodigo) {
        return { error: 'Código da disciplina é obrigatório', status: 400 };
    }

    const discipline = await this.model.getDisciplineByCodigo(payload.disciplineCodigo);
    if (!discipline) {
        return { error: 'Disciplina não encontrada', status: 404 };
    }

    try {
        const result = await this.model.createEvaluation({
            disciplineId: discipline.id,
            userId,
            turmaCodigo: payload.turmaCodigo,
            semestre: payload.semestre,
            ratingGeral: payload.ratingGeral || null,
            ratingDificuldade: payload.ratingDificuldade || null,
            ratingCargaTrabalho: payload.ratingCargaTrabalho || null,
            ratingProfessores: payload.ratingProfessores || null,
            ratingClareza: payload.ratingClareza || null,
            ratingUtilidade: payload.ratingUtilidade || null,
            ratingOrganizacao: payload.ratingOrganizacao || null,
            comentario: payload.comentario?.trim() || null,
            isAnonymous: payload.isAnonymous || false
        });

        return { data: result, status: 201 };
    } catch (error) {
        if (error.message === 'USER_ALREADY_EVALUATED') {
            return { error: 'Você já avaliou esta disciplina. Use a opção de editar.', status: 409 };
        }
        log.error('Falha ao criar avaliacao', { err: error.message, user_id: userId });
        throw error;
    }
}

/**
 * O que faz: atualiza avaliacao do usuario logado com validacao de payload.
 * Onde e usada: handler PUT de avaliacoes.
 * Dependencias chamadas: validateEvaluationPayload e model.updateEvaluation.
 * Efeitos colaterais: escrita em DB.
 */
async function updateEvaluation(evaluationId, userId, payload) {
    const validation = this.validateEvaluationPayload(payload);
    if (!validation.ok) {
        return { error: validation.error, status: 400 };
    }

    const result = await this.model.updateEvaluation(evaluationId, userId, {
        turmaCodigo: payload.turmaCodigo,
        semestre: payload.semestre,
        ratingGeral: payload.ratingGeral !== undefined ? (payload.ratingGeral || null) : undefined,
        ratingDificuldade: payload.ratingDificuldade !== undefined ? (payload.ratingDificuldade || null) : undefined,
        ratingCargaTrabalho: payload.ratingCargaTrabalho !== undefined ? (payload.ratingCargaTrabalho || null) : undefined,
        ratingProfessores: payload.ratingProfessores !== undefined ? (payload.ratingProfessores || null) : undefined,
        ratingClareza: payload.ratingClareza !== undefined ? (payload.ratingClareza || null) : undefined,
        ratingUtilidade: payload.ratingUtilidade !== undefined ? (payload.ratingUtilidade || null) : undefined,
        ratingOrganizacao: payload.ratingOrganizacao !== undefined ? (payload.ratingOrganizacao || null) : undefined,
        comentario: payload.comentario?.trim() || null,
        isAnonymous: payload.isAnonymous
    });

    if (!result) {
        return {
            error: 'Avaliação não encontrada ou você não tem permissão para editá-la',
            status: 404
        };
    }

    return { data: result, status: 200 };
}

/**
 * O que faz: remove avaliacao do usuario logado.
 * Onde e usada: handler DELETE de avaliacoes.
 * Dependencias chamadas: model.deleteEvaluation.
 * Efeitos colaterais: escrita em DB.
 */
async function deleteEvaluation(evaluationId, userId) {
    const deleted = await this.model.deleteEvaluation(evaluationId, userId);
    if (!deleted) {
        return {
            error: 'Avaliação não encontrada ou você não tem permissão para excluí-la',
            status: 404
        };
    }

    return { data: { message: 'Avaliação excluída com sucesso' }, status: 200 };
}

/**
 * O que faz: alterna like em avaliacao, bloqueando auto-like.
 * Onde e usada: handler POST like.
 * Dependencias chamadas: model.getEvaluationById e model.toggleLike.
 * Efeitos colaterais: escrita em DB.
 */
async function toggleLike(evaluationId, userId) {
    const evaluation = await this.model.getEvaluationById(evaluationId);
    if (!evaluation) {
        return { error: 'Avaliação não encontrada', status: 404 };
    }

    if (evaluation.user_id === userId) {
        return { error: 'Você não pode dar like na própria avaliação', status: 400 };
    }

    const result = await this.model.toggleLike(evaluationId, userId);
    return { data: result, status: 200 };
}

module.exports = {
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    toggleLike
};
