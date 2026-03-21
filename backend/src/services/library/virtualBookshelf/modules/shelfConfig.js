/**
 * Responsabilidade: gerenciar leitura e atualizacao de configuracoes de prateleiras.
 * Camada: service.
 * Entradas/Saidas: recebe dados de configuracao e devolve configuracoes com codigo final calculado.
 * Dependencias criticas: VirtualBookshelfModel e logger compartilhado.
 */

const VirtualBookshelfModel = require('../../../../models/library/virtualBookshelf/VirtualBookshelfModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: retorna configuracoes de prateleiras com codigo final calculado automaticamente.
     * Onde e usada: controllers de consulta e fluxos de listagem por prateleira.
     * Dependencias chamadas: VirtualBookshelfModel.getAllShelves e calculateEndCodes.
     * Efeitos colaterais: nenhum.
     */
    async getShelvesConfig() {
        log.start('Obtendo configuracoes das prateleiras');

        try {
            const shelves = await VirtualBookshelfModel.getAllShelves();
            const shelvesWithCalculatedEnds = await this.calculateEndCodes(shelves);

            log.success('Configuracoes de prateleiras obtidas com sucesso', {
                total_shelves: shelvesWithCalculatedEnds.length
            });

            return shelvesWithCalculatedEnds;
        } catch (error) {
            log.error('Falha ao obter configuracoes de prateleiras', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: calcula codigo final de cada prateleira baseado no inicio da proxima.
     * Onde e usada: getShelvesConfig e getBooksForShelf.
     * Dependencias chamadas: getPreviousCode.
     * Efeitos colaterais: nenhum.
     */
    async calculateEndCodes(shelves) {
        const sortedShelves = [...shelves].sort((a, b) => {
            if (a.shelf_number !== b.shelf_number) {
                return a.shelf_number - b.shelf_number;
            }

            return a.shelf_row - b.shelf_row;
        });

        const result = [];

        for (let i = 0; i < sortedShelves.length; i += 1) {
            const currentShelf = { ...sortedShelves[i] };

            if (!currentShelf.book_code_start) {
                currentShelf.calculated_book_code_end = null;
                result.push(currentShelf);
                continue;
            }

            let nextShelfWithCode = null;
            for (let j = i + 1; j < sortedShelves.length; j += 1) {
                if (sortedShelves[j].book_code_start) {
                    nextShelfWithCode = sortedShelves[j];
                    break;
                }
            }

            if (nextShelfWithCode) {
                currentShelf.calculated_book_code_end = this.getPreviousCode(nextShelfWithCode.book_code_start);
            } else {
                currentShelf.calculated_book_code_end = currentShelf.book_code_end || null;
            }

            result.push(currentShelf);
        }

        return result;
    },

    /**
     * O que faz: atualiza configuracao em lote de prateleiras.
     * Onde e usada: commandHandlers.updateShelvesConfig.
     * Dependencias chamadas: VirtualBookshelfModel.updateShelvesConfig.
     * Efeitos colaterais: persiste alteracoes em DB.
     */
    async updateShelvesConfig(shelvesConfig) {
        log.start('Atualizando configuracao completa de prateleiras', {
            total_shelves: shelvesConfig.length
        });

        try {
            await VirtualBookshelfModel.updateShelvesConfig(shelvesConfig);
            log.success('Configuracao de prateleiras atualizada com sucesso');
            return { success: true };
        } catch (error) {
            log.error('Falha ao atualizar configuracao de prateleiras', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: atualiza codigo inicial de uma prateleira com validacao de codigo.
     * Onde e usada: commandHandlers.updateShelfStartCode.
     * Dependencias chamadas: validateBookCode e VirtualBookshelfModel.updateShelfStartCode.
     * Efeitos colaterais: persiste alteracao em DB.
     */
    async updateShelfStartCode(shelf_number, shelf_row, book_code_start) {
        log.start('Atualizando codigo inicial da prateleira', { shelf_number, shelf_row });

        try {
            if (book_code_start) {
                const validation = await this.validateBookCode(book_code_start);
                if (!validation.isValid) {
                    throw new Error(`Codigo de livro invalido: ${book_code_start}`);
                }
            }

            await VirtualBookshelfModel.updateShelfStartCode(shelf_number, shelf_row, book_code_start);
            log.success('Codigo inicial atualizado com sucesso', { shelf_number, shelf_row });
            return { success: true };
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
     * O que faz: atualiza codigo final manual de uma prateleira com validacao de codigo.
     * Onde e usada: commandHandlers.updateShelfEndCode.
     * Dependencias chamadas: validateBookCode e VirtualBookshelfModel.updateShelfEndCode.
     * Efeitos colaterais: persiste alteracao em DB.
     */
    async updateShelfEndCode(shelf_number, shelf_row, book_code_end) {
        log.start('Atualizando codigo final da prateleira', { shelf_number, shelf_row });

        try {
            if (book_code_end) {
                const validation = await this.validateBookCode(book_code_end);
                if (!validation.isValid) {
                    throw new Error(`Codigo de livro invalido: ${book_code_end}`);
                }
            }

            await VirtualBookshelfModel.updateShelfEndCode(shelf_number, shelf_row, book_code_end);
            log.success('Codigo final atualizado com sucesso', { shelf_number, shelf_row });
            return { success: true };
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
     * O que faz: busca uma prateleira calculada por posicao (estante/linha).
     * Onde e usada: queryHandlers.getBooksForShelf.
     * Dependencias chamadas: getShelvesConfig.
     * Efeitos colaterais: nenhum.
     */
    async getShelfConfigByPosition(shelf_number, shelf_row) {
        const allShelves = await this.getShelvesConfig();
        const shelf = allShelves.find((item) => Number(item.shelf_number) === Number(shelf_number)
            && Number(item.shelf_row) === Number(shelf_row));

        return { shelf, allShelves };
    }
};
