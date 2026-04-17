/**
 * Responsabilidade: consultas de negocio para disciplinas.
 * Camada: service.
 * Entradas/Saidas: filtros e codigos de disciplina; retorna dados formatados para controllers.
 * Dependencias criticas: AcademicDisciplinesModel e logger padronizado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: lista disciplinas com filtros.
 * Onde e usada: handlers de listagem e busca.
 * Dependencias chamadas: model.getDisciplines.
 * Efeitos colaterais: leitura em DB.
 */
async function getDisciplines(filters = {}) {
    log.start('Service listando disciplinas', { has_filters: Object.keys(filters).length > 0 });
    const rows = await this.model.getDisciplines(filters);
    log.success('Service listagem concluida', { count: rows.length });
    return rows;
}

/**
 * O que faz: busca disciplina por codigo.
 * Onde e usada: handlers de detalhe e validacao.
 * Dependencias chamadas: model.getDisciplineByCodigo.
 * Efeitos colaterais: leitura em DB.
 */
async function getDisciplineByCodigo(codigo) {
    log.start('Service buscando disciplina por codigo', { codigo });
    return this.model.getDisciplineByCodigo(codigo);
}

/**
 * O que faz: retorna disciplina completa com estrutura de turmas.
 * Onde e usada: handler de GET /:codigo/full.
 * Dependencias chamadas: model.getFullDiscipline.
 * Efeitos colaterais: leitura em DB.
 */
async function getFullDiscipline(codigo) {
    log.start('Service buscando disciplina completa', { codigo });
    return this.model.getFullDiscipline(codigo);
}

/**
 * O que faz: conta disciplinas por filtros.
 * Onde e usada: handler de count.
 * Dependencias chamadas: model.countDisciplines.
 * Efeitos colaterais: leitura em DB.
 */
async function countDisciplines(filters = {}) {
    log.start('Service contando disciplinas');
    return this.model.countDisciplines(filters);
}

/**
 * O que faz: lista campi distintos.
 * Onde e usada: handler de campi.
 * Dependencias chamadas: model.getCampi.
 * Efeitos colaterais: leitura em DB.
 */
async function getCampi() {
    return this.model.getCampi();
}

/**
 * O que faz: lista unidades distintas com filtro opcional de campus.
 * Onde e usada: handler de unidades.
 * Dependencias chamadas: model.getUnidades.
 * Efeitos colaterais: leitura em DB.
 */
async function getUnidades(campus = null) {
    return this.model.getUnidades(campus);
}

/**
 * O que faz: autocomplete de disciplinas por codigo/nome.
 * Onde e usada: handler de search.
 * Dependencias chamadas: model.getDisciplines.
 * Efeitos colaterais: leitura em DB.
 */
async function searchDisciplines(term, limit = 10) {
    log.start('Service executando autocomplete', { term, limit });
    const rows = await this.model.getDisciplines({ searchTerm: term, limit });
    return rows.map(row => ({
        codigo: row.codigo,
        nome: row.nome,
        unidade: row.unidade,
        campus: row.campus
    }));
}

/**
 * O que faz: consolida estatisticas basicas de disciplinas.
 * Onde e usada: handler de stats.
 * Dependencias chamadas: countDisciplines, getCampi, getUnidades.
 * Efeitos colaterais: leitura em DB.
 */
async function getStats() {
    log.start('Service consolidando stats de disciplinas');

    const [total, campi, unidades] = await Promise.all([
        this.model.countDisciplines(),
        this.model.getCampi(),
        this.model.getUnidades()
    ]);

    return {
        total_disciplinas: total,
        total_campi: campi.length,
        total_unidades: unidades.length,
        campi,
        unidades_count: unidades.length
    };
}

module.exports = {
    getDisciplines,
    getDisciplineByCodigo,
    getFullDiscipline,
    countDisciplines,
    getCampi,
    getUnidades,
    searchDisciplines,
    getStats
};
