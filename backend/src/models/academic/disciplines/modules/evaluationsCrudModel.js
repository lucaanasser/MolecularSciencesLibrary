/**
 * Responsabilidade: CRUD principal de avaliacoes de disciplina.
 * Camada: model.
 * Entradas/Saidas: payload de avaliacao e identificadores; retorna resultado de persistencia.
 * Dependencias criticas: db helpers e logger padronizado.
 */

const { executeQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: cria avaliacao de disciplina para usuario.
 * Onde e usada: AcademicDisciplinesService.createEvaluation.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function createEvaluation({
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
    log.start('Criando avaliacao', { discipline_id: disciplineId, user_id: userId });

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
            disciplineId,
            userId,
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
            isAnonymous ? 1 : 0
        ]);

        log.success('Avaliacao criada', { evaluation_id: result.lastID, user_id: userId });
        return { id: result.lastID };
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            log.warn('Usuario ja avaliou disciplina', { discipline_id: disciplineId, user_id: userId });
            throw new Error('USER_ALREADY_EVALUATED');
        }
        log.error('Falha ao criar avaliacao', { err: error.message, user_id: userId, discipline_id: disciplineId });
        throw error;
    }
}

/**
 * O que faz: atualiza avaliacao de um usuario.
 * Onde e usada: AcademicDisciplinesService.updateEvaluation.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function updateEvaluation(evaluationId, userId, payload) {
    log.start('Atualizando avaliacao', { evaluation_id: evaluationId, user_id: userId });

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

    const result = await executeQuery(query, [
        payload.turmaCodigo,
        payload.semestre,
        payload.ratingGeral,
        payload.ratingDificuldade,
        payload.ratingCargaTrabalho,
        payload.ratingProfessores,
        payload.ratingClareza,
        payload.ratingUtilidade,
        payload.ratingOrganizacao,
        payload.comentario,
        payload.isAnonymous !== undefined ? (payload.isAnonymous ? 1 : 0) : null,
        evaluationId,
        userId
    ]);

    if (result.changes === 0) {
        log.warn('Avaliacao nao encontrada para update', { evaluation_id: evaluationId, user_id: userId });
        return null;
    }

    log.success('Avaliacao atualizada', { evaluation_id: evaluationId, user_id: userId });
    return { id: evaluationId, updated: true };
}

/**
 * O que faz: deleta avaliacao do proprio usuario.
 * Onde e usada: AcademicDisciplinesService.deleteEvaluation.
 * Dependencias chamadas: executeQuery.
 * Efeitos colaterais: escrita em DB.
 */
async function deleteEvaluation(evaluationId, userId) {
    log.start('Removendo avaliacao', { evaluation_id: evaluationId, user_id: userId });

    const result = await executeQuery(
        'DELETE FROM discipline_evaluations WHERE id = ? AND user_id = ?',
        [evaluationId, userId]
    );

    if (result.changes === 0) {
        log.warn('Avaliacao nao encontrada para delete', { evaluation_id: evaluationId, user_id: userId });
        return false;
    }

    log.success('Avaliacao removida', { evaluation_id: evaluationId, user_id: userId });
    return true;
}

module.exports = {
    createEvaluation,
    updateEvaluation,
    deleteEvaluation
};
