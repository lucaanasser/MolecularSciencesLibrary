// BooksController gerencia as operações de controle para livros, 
// conectando as rotas aos serviços.
const booksService = require('../services/BooksService');

class BooksController {
    constructor() {
        // Inicializações ou configurações do controller, se necessário
    }

    /**
     * Adiciona um novo livro ou exemplar, delegando ao serviço
     * @param {Object} bookData - Dados do livro a ser adicionado
     * @returns {Promise<Object>} Resultado da operação
     */
    async addBook(bookData) {
        return await booksService.addBook(bookData);
    }

    /**
     * Busca um livro pelo ID, delegando ao serviço
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Livro encontrado
     */
    async getBookById(id) {
        return await booksService.getBookById(id);
    }

    /**
     * Busca livros por categoria e subcategoria, delegando ao serviço
     * @param {string} category - Nome da categoria
     * @param {string|number} subcategory - Código da subcategoria
     * @returns {Promise<Array>} Lista de livros encontrados
     */
    async getBooks(category, subcategory, searchTerm) {
        return await booksService.getBooks(
            category, 
            subcategory ? parseInt(subcategory, 10) : undefined, 
            searchTerm
        );
    }

    /**
     * Retorna os mapeamentos de códigos de área e subárea
     * @returns {Object} Objeto com areaCodes e subareaCodes
     */
    getCategoryMappings() {
        return booksService.getCategoryMappings();
    }

    /**
     * Remove um livro pelo ID, delegando ao serviço
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Resultado da operação
     */
    async deleteBook(id) {
        console.log(`[CONTROLLER] Chamando service para remover livro ${id}`);
        await booksService.removeBookById(id);
        return { success: true, message: 'Livro removido com sucesso' };
    }

    /**
     * Empresta um livro a um estudante, delegando ao serviço
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async borrowBook(req, res) {
        const { bookId, studentId } = req.body;
        const sid = studentId || Math.floor(Math.random() * 10000);
        await booksService.borrowBook(bookId, sid);
        res.status(200).json({ success: true, message: 'Livro emprestado com sucesso' });
    }

    /**
     * Devolve um livro emprestado, delegando ao serviço
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async returnBook(req, res) {
        const { bookId } = req.body;
        await booksService.returnBook(bookId);
        res.status(200).json({ success: true, message: 'Livro devolvido com sucesso' });
    }
}

// Exporta uma instância única do controlador
module.exports = new BooksController();