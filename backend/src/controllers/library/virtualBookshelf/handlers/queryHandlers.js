/**
 * Responsabilidade: concentrar handlers de leitura da estante virtual.
 * Camada: controller.
 * Entradas/Saidas: valida params de consulta e responde payloads HTTP de listagem/consulta.
 * Dependencias criticas: VirtualBookshelfService e logger compartilhado.
 */

const VirtualBookshelfService = require('../../../../services/library/virtualBookshelf/VirtualBookshelfService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: retorna a configuracao completa das prateleiras.
     * Onde e usada: rotas GET / e GET /shelves.
     * Dependencias chamadas: VirtualBookshelfService.getShelvesConfig.
     * Efeitos colaterais: nenhum.
     */
    async getShelvesConfig(req, res) {
        log.start('Iniciando consulta de configuracao das prateleiras', {
            route: req.route?.path,
            method: req.method
        });

        try {
            const shelves = await VirtualBookshelfService.getShelvesConfig();
            log.success('Configuracao de prateleiras retornada com sucesso', {
                total_shelves: shelves.length
            });
            return res.json(shelves);
        } catch (error) {
            log.error('Falha ao consultar configuracao das prateleiras', { err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: retorna lista ordenada de livros para estante virtual.
     * Onde e usada: rotas GET /books e GET /books/ordered.
     * Dependencias chamadas: VirtualBookshelfService.getAllBooksOrdered.
     * Efeitos colaterais: nenhum.
     */
    async getOrderedBooks(req, res) {
        log.start('Iniciando consulta de livros ordenados da estante virtual', {
            route: req.route?.path,
            method: req.method
        });

        try {
            const books = await VirtualBookshelfService.getAllBooksOrdered();
            log.success('Livros ordenados retornados com sucesso', { total_books: books.length });
            return res.json(books);
        } catch (error) {
            log.error('Falha ao consultar livros ordenados', { err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: valida existencia de codigo de livro no catalogo.
     * Onde e usada: rotas GET /validate e GET /books/validate.
     * Dependencias chamadas: VirtualBookshelfService.validateBookCode.
     * Efeitos colaterais: nenhum.
     */
    async validateBookCode(req, res) {
        const { bookCode } = req.query;

        log.start('Iniciando validacao de codigo de livro', {
            route: req.route?.path,
            method: req.method,
            code: bookCode
        });

        if (!bookCode) {
            log.warn('Requisicao de validacao sem parametro obrigatorio', { required: 'bookCode' });
            return res.status(400).json({ error: 'bookCode e obrigatorio' });
        }

        try {
            const result = await VirtualBookshelfService.validateBookCode(bookCode);
            log.success('Codigo de livro validado com sucesso', {
                code: bookCode,
                is_valid: result.isValid
            });
            return res.json(result);
        } catch (error) {
            log.error('Falha ao validar codigo de livro', { code: bookCode, err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: consulta livros de uma prateleira especifica por estante e linha.
     * Onde e usada: rotas GET /shelf-books e GET /shelves/:shelfNumber/:shelfRow/books.
     * Dependencias chamadas: VirtualBookshelfService.getShelfConfigByPosition e getBooksForShelf.
     * Efeitos colaterais: nenhum.
     */
    async getBooksForShelf(req, res) {
        const shelfNumber = req.query.shelf_number || req.params.shelfNumber;
        const shelfRow = req.query.shelf_row || req.params.shelfRow;

        log.start('Iniciando consulta de livros por prateleira', {
            route: req.route?.path,
            method: req.method,
            shelf_number: shelfNumber,
            shelf_row: shelfRow
        });

        if (!shelfNumber || !shelfRow) {
            log.warn('Consulta de prateleira sem parametros obrigatorios', {
                required: 'shelf_number,shelf_row'
            });
            return res.status(400).json({ error: 'shelf_number e shelf_row sao obrigatorios' });
        }

        try {
            const { shelf, allShelves } = await VirtualBookshelfService.getShelfConfigByPosition(shelfNumber, shelfRow);

            if (!shelf) {
                log.warn('Prateleira nao encontrada para consulta de livros', {
                    shelf_number: shelfNumber,
                    shelf_row: shelfRow
                });
                return res.status(404).json({ error: 'Prateleira nao encontrada' });
            }

            const books = await VirtualBookshelfService.getBooksForShelf(shelf, allShelves);
            log.success('Livros da prateleira retornados com sucesso', {
                shelf_number: shelfNumber,
                shelf_row: shelfRow,
                total_books: books.length
            });

            return res.json(books);
        } catch (error) {
            log.error('Falha ao consultar livros da prateleira', {
                shelf_number: shelfNumber,
                shelf_row: shelfRow,
                err: error.message
            });
            return res.status(500).json({ error: error.message });
        }
    }
};
