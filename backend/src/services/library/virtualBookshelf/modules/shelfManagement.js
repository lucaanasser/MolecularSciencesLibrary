/**
 * Responsabilidade: gerenciar criacao de prateleiras na configuracao da estante virtual.
 * Camada: service.
 * Entradas/Saidas: recebe dados da prateleira e devolve resultado de criacao.
 * Dependencias criticas: VirtualBookshelfModel e logger compartilhado.
 */

const VirtualBookshelfModel = require('../../../../models/library/virtualBookshelf/VirtualBookshelfModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria nova prateleira quando a combinacao estante/linha ainda nao existe.
     * Onde e usada: commandHandlers.addShelf.
     * Dependencias chamadas: VirtualBookshelfModel.getShelf e VirtualBookshelfModel.insertShelf.
     * Efeitos colaterais: persiste nova linha em DB.
     */
    async addShelf({ shelf_number, shelf_row, book_code_start = null, book_code_end = null }) {
        log.start('Adicionando nova prateleira', { shelf_number, shelf_row });

        try {
            const existingShelf = await VirtualBookshelfModel.getShelf(shelf_number, shelf_row);
            if (existingShelf) {
                throw new Error('Ja existe uma prateleira com esse numero de estante e prateleira.');
            }

            await VirtualBookshelfModel.insertShelf(shelf_number, shelf_row, book_code_start, book_code_end);

            log.success('Nova prateleira adicionada com sucesso', { shelf_number, shelf_row });
            return { success: true };
        } catch (error) {
            log.error('Falha ao adicionar nova prateleira', {
                shelf_number,
                shelf_row,
                err: error.message
            });
            throw error;
        }
    }
};
