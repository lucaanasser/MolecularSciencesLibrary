/**
 * Responsabilidade: centralizar operacoes de escrita da estante virtual.
 * Camada: model.
 * Entradas/Saidas: atualiza e cria registros na tabela virtual_bookshelf.
 * Dependencias criticas: database/db e logger compartilhado.
 */

const { executeQuery, runInTransaction } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: atualiza o codigo inicial de uma prateleira.
     * Onde e usada: shelfConfig.updateShelfStartCode.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: persiste alteracao em DB.
     */
    async updateShelfStartCode(shelf_number, shelf_row, book_code_start) {
        try {
            return await executeQuery(`
                UPDATE virtual_bookshelf
                SET book_code_start = ?
                WHERE shelf_number = ? AND shelf_row = ?
            `, [book_code_start, shelf_number, shelf_row]);
        } catch (error) {
            log.error('Falha ao atualizar codigo inicial da prateleira', {
                shelf_number,
                shelf_row,
                err: error.message
            });
            throw error;
        }
    },

    /**
     * O que faz: atualiza o codigo final manual de uma prateleira.
     * Onde e usada: shelfConfig.updateShelfEndCode.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: persiste alteracao em DB.
     */
    async updateShelfEndCode(shelf_number, shelf_row, book_code_end) {
        try {
            return await executeQuery(`
                UPDATE virtual_bookshelf
                SET book_code_end = ?
                WHERE shelf_number = ? AND shelf_row = ?
            `, [book_code_end, shelf_number, shelf_row]);
        } catch (error) {
            log.error('Falha ao atualizar codigo final da prateleira', {
                shelf_number,
                shelf_row,
                err: error.message
            });
            throw error;
        }
    },

    /**
     * O que faz: atualiza em lote a configuracao de varias prateleiras em transacao.
     * Onde e usada: shelfConfig.updateShelvesConfig.
     * Dependencias chamadas: runInTransaction.
     * Efeitos colaterais: persiste multiplas alteracoes em DB de forma atomica.
     */
    async updateShelvesConfig(shelvesConfig) {
        const queries = shelvesConfig.map((shelf) => [
            'UPDATE virtual_bookshelf SET book_code_start = ?, book_code_end = ? WHERE shelf_number = ? AND shelf_row = ?',
            [
                shelf.book_code_start || null,
                shelf.book_code_end || null,
                shelf.shelf_number,
                shelf.shelf_row
            ]
        ]);

        try {
            await runInTransaction(queries);
        } catch (error) {
            log.error('Falha ao atualizar configuracao completa de prateleiras', {
                total_shelves: shelvesConfig.length,
                err: error.message
            });
            throw error;
        }
    },

    /**
     * O que faz: insere uma nova prateleira na configuracao.
     * Onde e usada: shelfManagement.addShelf.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: cria registro em DB.
     */
    async insertShelf(shelf_number, shelf_row, book_code_start = null, book_code_end = null) {
        try {
            return await executeQuery(`
                INSERT INTO virtual_bookshelf (shelf_number, shelf_row, book_code_start, book_code_end)
                VALUES (?, ?, ?, ?)
            `, [shelf_number, shelf_row, book_code_start, book_code_end]);
        } catch (error) {
            log.error('Falha ao inserir nova prateleira', {
                shelf_number,
                shelf_row,
                err: error.message
            });
            throw error;
        }
    }
};
