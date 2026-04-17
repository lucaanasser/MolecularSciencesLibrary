/**
 * Responsabilidade: centralizar consultas da estante virtual.
 * Camada: model.
 * Entradas/Saidas: consulta configuracoes de prateleiras por lista ou chave primaria composta.
 * Dependencias criticas: database/db e logger compartilhado.
 */

const { getQuery, allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: retorna todas as configuracoes de prateleiras ordenadas por estante e linha.
     * Onde e usada: VirtualBookshelfService.getShelvesConfig e fluxos de consulta de prateleira.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async getAllShelves() {
        try {
            return await allQuery(`
                SELECT * FROM virtual_bookshelf
                ORDER BY shelf_number, shelf_row
            `);
        } catch (error) {
            log.error('Falha ao buscar configuracoes das prateleiras', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: retorna uma prateleira pela chave composta shelf_number + shelf_row.
     * Onde e usada: shelfManagement.addShelf e fluxos de consulta por prateleira.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum.
     */
    async getShelf(shelf_number, shelf_row) {
        try {
            return await getQuery(`
                SELECT * FROM virtual_bookshelf
                WHERE shelf_number = ? AND shelf_row = ?
            `, [shelf_number, shelf_row]);
        } catch (error) {
            log.error('Falha ao buscar prateleira especifica', {
                shelf_number,
                shelf_row,
                err: error.message
            });
            throw error;
        }
    }
};
