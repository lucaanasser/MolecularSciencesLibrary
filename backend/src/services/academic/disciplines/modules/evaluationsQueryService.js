/**
 * Responsabilidade: consultas de negocio para avaliacoes de disciplinas.
 * Camada: service.
 * Entradas/Saidas: codigo de disciplina e user_id; retorna dados de resposta HTTP.
 * Dependencias criticas: AcademicDisciplinesModel e logger padronizado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: lista avaliacoes de disciplina com contexto opcional do usuario atual.
 * Onde e usada: handler GET publico de avaliacoes.
 * Dependencias chamadas: model.getEvaluationsByDisciplineCodigo.
 * Efeitos colaterais: leitura em DB.
 */
async function getEvaluationsByDiscipline(codigo, currentUserId = null) {
    log.start('Service buscando avaliacoes por disciplina', { codigo, current_user_id: currentUserId });
    return this.model.getEvaluationsByDisciplineCodigo(codigo, currentUserId);
}

/**
 * O que faz: retorna estatisticas agregadas de avaliacao da disciplina.
 * Onde e usada: handler GET stats de avaliacoes.
 * Dependencias chamadas: model.getAggregatedRatings.
 * Efeitos colaterais: leitura em DB.
 */
async function getAggregatedRatings(codigo) {
    return this.model.getAggregatedRatings(codigo);
}

/**
 * O que faz: retorna avaliacao do usuario logado para uma disciplina.
 * Onde e usada: handler GET mine por disciplina.
 * Dependencias chamadas: model.getUserEvaluationForDiscipline.
 * Efeitos colaterais: leitura em DB.
 */
async function getUserEvaluationForDiscipline(userId, codigo) {
    return this.model.getUserEvaluationForDiscipline(userId, codigo);
}

/**
 * O que faz: lista todas as avaliacoes do usuario logado.
 * Onde e usada: handler GET mine.
 * Dependencias chamadas: model.getUserEvaluations.
 * Efeitos colaterais: leitura em DB.
 */
async function getUserEvaluations(userId) {
    return this.model.getUserEvaluations(userId);
}

module.exports = {
    getEvaluationsByDiscipline,
    getAggregatedRatings,
    getUserEvaluationForDiscipline,
    getUserEvaluations
};
