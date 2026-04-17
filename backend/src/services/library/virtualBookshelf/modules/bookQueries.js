/**
 * Responsabilidade: consultar, ordenar e filtrar livros para estante virtual.
 * Camada: service.
 * Entradas/Saidas: recebe filtros de prateleira/codigo e devolve livros ordenados ou validados.
 * Dependencias criticas: BooksModel, constants e logger compartilhado.
 */

const BooksModel = require('../../../../models/library/BooksModel');
const { AREA_NAME_TO_CODE } = require('./constants');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: retorna todos os livros ordenados na regra da estante virtual.
     * Onde e usada: queryHandlers.getOrderedBooks e getBooksForShelf.
     * Dependencias chamadas: BooksModel.getAllBooks e sortBooks.
     * Efeitos colaterais: nenhum.
     */
    async getAllBooksOrdered() {
        log.start('Ordenando livros para estante virtual');

        try {
            const books = await BooksModel.getAllBooks();
            const borrowedSet = new Set(
                books
                    .filter((book) => book.status === 'emprestado')
                    .map((book) => Number(book.book_id))
            );

            const booksWithAvailability = books.map((book) => ({
                ...book,
                area: AREA_NAME_TO_CODE[book.area] || book.area,
                available: !borrowedSet.has(Number(book.id))
            }));

            const orderedBooks = this.sortBooks(booksWithAvailability);
            log.success('Livros ordenados com sucesso', { total_books: orderedBooks.length });

            return orderedBooks;
        } catch (error) {
            log.error('Falha ao ordenar livros para estante virtual', { err: error.message });
            throw error;
        }
    },

    /**
     * O que faz: filtra os livros pertencentes ao intervalo de uma prateleira.
     * Onde e usada: queryHandlers.getBooksForShelf.
     * Dependencias chamadas: getAllBooksOrdered, calculateEndCodes e isCodeInRange.
     * Efeitos colaterais: nenhum.
     */
    async getBooksForShelf(shelf, allShelves, allBooks = null) {
        log.start('Obtendo livros para prateleira especifica', {
            shelf_number: shelf?.shelf_number,
            shelf_row: shelf?.shelf_row
        });

        try {
            if (!shelf?.book_code_start) {
                log.warn('Prateleira sem codigo inicial definido', {
                    shelf_number: shelf?.shelf_number,
                    shelf_row: shelf?.shelf_row
                });
                return [];
            }

            const books = allBooks || await this.getAllBooksOrdered();
            const shelvesWithEndCodes = await this.calculateEndCodes(allShelves);
            const currentShelfWithEndCode = shelvesWithEndCodes.find((item) =>
                Number(item.shelf_number) === Number(shelf.shelf_number)
                && Number(item.shelf_row) === Number(shelf.shelf_row)
            );

            if (!currentShelfWithEndCode?.calculated_book_code_end) {
                log.warn('Prateleira sem codigo final calculado', {
                    shelf_number: shelf?.shelf_number,
                    shelf_row: shelf?.shelf_row
                });
                return [];
            }

            const startCode = shelf.book_code_start;
            const endCode = currentShelfWithEndCode.calculated_book_code_end;

            const booksForShelf = books.filter((book) => this.isCodeInRange(book.code, startCode, endCode));

            log.success('Livros da prateleira obtidos com sucesso', {
                shelf_number: shelf?.shelf_number,
                shelf_row: shelf?.shelf_row,
                total_books: booksForShelf.length
            });

            return booksForShelf;
        } catch (error) {
            log.error('Falha ao obter livros da prateleira', {
                shelf_number: shelf?.shelf_number,
                shelf_row: shelf?.shelf_row,
                err: error.message
            });
            throw error;
        }
    },

    /**
     * O que faz: valida se um codigo informado existe entre os livros catalogados.
     * Onde e usada: commandHandlers de atualizacao de codigos e queryHandlers.validateBookCode.
     * Dependencias chamadas: BooksModel.getAllBooks e formatComparableCode.
     * Efeitos colaterais: nenhum.
     */
    async validateBookCode(bookCode) {
        log.start('Validando codigo de livro', { code: bookCode });

        try {
            const books = await BooksModel.getAllBooks();
            const target = this.formatComparableCode(bookCode);
            const book = books.find((item) => this.formatComparableCode(item.code) === target);
            const isValid = Boolean(book);

            log.success('Codigo de livro validado', { code: bookCode, is_valid: isValid });
            return { isValid, book };
        } catch (error) {
            log.error('Falha ao validar codigo de livro', { code: bookCode, err: error.message });
            throw error;
        }
    }
};
