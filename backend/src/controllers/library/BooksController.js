/* Gerencia as operações de controle para livros, conectando as rotas aos serviços.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const BooksService = require('../../services/library/BooksService');
const BooksModel = require('../../models/library/BooksModel');


class BooksController {

    async addBook(req, res) {
        console.log("🔵 [BooksController] req.body:", req.body);
        const { bookData, addType, selectedBook } = req.body;
        try {
            const result = await BooksService.addBook(bookData, addType, selectedBook);
            console.log("🟢 [BooksController] Livro adicionado com sucesso:", result);
            res.status(201).json(result);
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao adicionar livro:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    async importBooksFromCSV(req, res) {  
        console.log('🔵 [BooksController] Iniciando importação de livros via CSV');
        const file = req.file;
        if (!file) {
            console.warn('🟡 [BooksController] Nenhum arquivo CSV fornecido para importação');
            res.status(400).json({ success: false, message: 'Nenhum arquivo CSV fornecido' });
            return;
        }
        try {
            const result = await BooksService.importBooksFromCSV(file);
            console.log('🟢 [BooksController] Importação de livros via CSV concluída');
            res.status(200).json(result);
        } catch (error) {
            console.error('🔴 [BooksController] Erro ao importar livros via CSV:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async borrowBook(req, res) {
        const { bookId, userId } = req.body;
        console.log(`🔵 [BooksController] Emprestando livro bookId=${bookId} para userId=${userId}`);
        try {
            await BooksService.borrowBook(bookId, userId);
            console.log(`🟢 [BooksController] Livro emprestado com sucesso: bookId=${bookId}, userId=${userId}`);
            res.status(200).json({ success: true, message: 'Livro emprestado com sucesso' });
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao emprestar livro: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async returnBook(req, res) {
        const { bookId } = req.body;
        console.log(`🔵 [BooksController] Devolvendo livro bookId=${bookId}`);
        try {
            await BooksService.returnBook(bookId);
            console.log(`🟢 [BooksController] Livro devolvido com sucesso: bookId=${bookId}`);
            res.status(200).json({ success: true, message: 'Livro devolvido com sucesso' });
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao devolver livro: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async searchBooks(req, res) {
        const { q, limit } = req.query;
        console.log(`🔵 [BooksController] Autocomplete: query="${q}", limit=${limit}`);
        try {
            const results = await BooksService.searchBooks(q, limit);
            console.log(`🟢 [BooksController] ${results.length} resultados de autocomplete`);
            res.json(results);
        } catch (error) {
            console.error("🔴 [BooksController] Erro no autocomplete:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    async getBooks(req, res) {
        const { limit, offset, filters } = req.query;
        console.log(`🔵 [BooksController] Buscando livros com filtros:`, filters);    
        try {
            const books = await BooksService.getBooks(filters, limit, offset);
            console.log(`🟢 [BooksController] Livros encontrados: ${books.length}`);
            res.json(books);
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao buscar livros:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    async countBooks(req, res) {
        const filters = { ...req.query };
        console.log(`🔵 [BooksController] Contando livros com filtros:`, filters);
        try {
            const count = await BooksService.countBooks(filters);
            console.log(`🟢 [BooksController] Total: ${count} livros`);
            res.json({ count });
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao contar livros:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    async exportBooksToCSV(req, res) {
        console.log('🔵 [BooksController] Iniciando exportação de livros para CSV');
        try {
            const csvContent = await BooksService.exportBooksToCSV();
            console.log('🟢 [BooksController] Exportação de livros para CSV concluída');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="catalogo_livros_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send('\ufeff' + csvContent);
        } catch (error) {
            console.error('🔴 [BooksController] Erro ao exportar livros para CSV:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async setReservedStatus(req, res) {
        const { bookId, isReserved } = req.body;
        console.log(`🔵 [BooksController] Definindo status de reserva didática para livro bookId=${bookId}`);
        try {
            const result = await BooksService.setReservedStatus(bookId, isReserved);
            console.log(`🟢 [BooksController] Status de reserva didática atualizado para livro bookId=${bookId}`);
            res.status(200).json(result);
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao definir status de reserva didática para livro bookId=${bookId}: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async clearAllReservedBooks(req, res) {
        console.log('🔵 [BooksController] Removendo todos os livros da reserva didática');
        try {
            const result = await BooksService.clearAllReservedBooks();
            console.log('🟢 [BooksController] Todos os livros removidos da reserva didática');
            res.status(200).json(result);
        } catch (error) {
            console.error('🔴 [BooksController] Erro ao limpar reserva didática:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getReservedBooks(req, res) {
        console.log('🔵 [BooksController] Buscando livros reservados');
        try {
            const books = await BooksService.getReservedBooks();
            console.log(`🟢 [BooksController] Livros reservados encontrados: ${books.length}`);
            res.status(200).json(books);
        } catch (error) {
            console.error('🔴 [BooksController] Erro ao buscar livros reservados:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getBookById(req, res) {
        const { id } = req.params;
        console.log(`🔵 [BooksController] Buscando livro por id: ${id}`);
        try {
            const book = await BooksService.getBookById(id);
            console.log("🟢 [BooksController] Livro encontrado:", book);
            res.status(200).json(book);
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao buscar livro:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    async deleteBook(req, res) {
        const { id } = req.params;
        console.log(`🔵 [BooksController] Removendo livro id=${id}`);
        try {
            await BooksService.removeBookById(id);
            console.log(`🟢 [BooksController] Livro removido com sucesso: id=${id}`);
            res.status(200).json({ success: true, message: 'Livro removido com sucesso' });
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao remover livro: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new BooksController();