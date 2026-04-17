/**
 * Responsabilidade: handlers HTTP de catalogo de livros.
 * Camada: controller.
 * Entradas/Saidas: requests de livros e respostas HTTP para operacoes de catalogo.
 * Dependencias criticas: BooksService unificado e logger compartilhado.
 */

const BooksService = require('../../../../services/library/books/BooksService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    async addBook(req, res) {
        const { bookData, selectedBookcode } = req.body || {};
        log.start('Iniciando adicao de livro', { title: bookData?.title, selected_bookcode: selectedBookcode });

        try {
            const result = await BooksService.addBook(bookData, selectedBookcode);
            log.success('Livro adicionado com sucesso', { book_id: result?.lastID || bookData?.id, title: bookData?.title });
            return res.status(201).json(result);
        } catch (error) {
            log.error('Falha ao adicionar livro', { err: error.message, title: bookData?.title });
            return res.status(500).json({ error: error.message });
        }
    },

    async importBooksFromCSV(req, res) {
        const file = req.file;
        log.start('Iniciando importacao de livros via CSV', { has_file: Boolean(file) });

        if (!file) {
            log.warn('Nenhum arquivo CSV fornecido para importacao');
            return res.status(400).json({ success: false, message: 'Nenhum arquivo CSV fornecido' });
        }

        try {
            const result = await BooksService.importBooksFromCSV(file);
            if (result.failed > 0) {
                let errorMsg = `Importacao de livros concluida com ${result.success} livros importados com sucesso e ${result.failed} erros.`;
                for (const err of result.errors) {
                    errorMsg += `\nLinha ${err.row}: ${err.error}`;
                }
                log.warn('Importacao CSV finalizada com falhas', { success: result.success, failed: result.failed });
                return res.status(200).json({ success: false, message: errorMsg });
            }

            const successMsg = `Importacao de livros concluida com ${result.success} livros importados com sucesso e ${result.failed} falhas.`;
            log.success('Importacao CSV finalizada com sucesso', { success: result.success, failed: result.failed });
            return res.status(200).json({ success: true, message: successMsg });
        } catch (error) {
            log.error('Falha na importacao de livros via CSV', { err: error.message });
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async searchBooks(req, res) {
        const { q, limit } = req.query || {};
        try {
            const results = await BooksService.searchBooks(q, limit);
            return res.json(results);
        } catch (error) {
            log.error('Falha no autocomplete de livros', { err: error.message, q });
            return res.status(500).json({ error: error.message });
        }
    },

    async getBooks(req, res) {
        const filters = req.query || {};
        try {
            const books = await BooksService.getBooks(filters);
            return res.json({ results: books, total: books.length });
        } catch (error) {
            log.error('Falha ao buscar livros', { err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    async countBooks(req, res) {
        try {
            const count = await BooksService.countBooks({ ...(req.query || {}) });
            return res.json({ count });
        } catch (error) {
            log.error('Falha ao contar livros', { err: error.message });
            return res.status(500).json({ error: error.message });
        }
    },

    async exportBooksToCSV(req, res) {
        try {
            const csvContent = await BooksService.exportBooksToCSV();
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="catalogo_livros_${new Date().toISOString().split('T')[0]}.csv"`);
            return res.send('\ufeff' + csvContent);
        } catch (error) {
            log.error('Falha ao exportar catalogo CSV', { err: error.message });
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async setReservedStatus(req, res, status) {
        const { bookId } = req.body || {};
        if (!bookId) {
            return res.status(400).json({ success: false, message: 'Parametros invalidos: bookId e obrigatorio' });
        }

        try {
            const result = await BooksService.setReservedStatus(bookId, status);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async clearAllReservedBooks(req, res) {
        try {
            const result = await BooksService.clearAllReservedBooks();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async getReservedBooks(req, res) {
        try {
            const books = await BooksService.getReservedBooks();
            return res.status(200).json(books);
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async getBookById(req, res) {
        const { id } = req.params;
        try {
            const book = await BooksService.getBookById(id);
            return res.status(200).json(book);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async getBooksByCode(req, res) {
        const { code } = req.params;
        try {
            const books = await BooksService.getBooksByCode(code);
            return res.status(200).json(books);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async deleteBook(req, res) {
        const { id } = req.params;
        try {
            await BooksService.deleteBook(id);
            return res.status(200).json({ success: true, message: 'Livro removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};
