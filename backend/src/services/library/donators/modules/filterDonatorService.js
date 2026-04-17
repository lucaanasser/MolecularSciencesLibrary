/**
 * Responsabilidade: normalizacao de filtros de consultas de doadores.
 * Camada: service.
 * Entradas/Saidas: transforma query params e delega ao model.
 * Dependencias criticas: DonatorsModel.
 */

const DonatorsModel = require('../../../../models/library/donators/DonatorsModel');

module.exports = {
    /**
     * O que faz: normaliza filtros da API e executa consulta filtrada.
     * Onde e usada: controller de consultas.
     * Dependencias chamadas: DonatorsModel.getFilteredDonators.
     * Efeitos colaterais: nenhum.
     */
    async getFilteredDonators(filters = {}) {
        const normalized = {
            isUser: filters.isUser !== undefined ? filters.isUser === true || filters.isUser === 'true' : undefined,
            donationType: filters.donationType || undefined,
            name: filters.name || undefined
        };
        return DonatorsModel.getFilteredDonators(normalized);
    }
};
