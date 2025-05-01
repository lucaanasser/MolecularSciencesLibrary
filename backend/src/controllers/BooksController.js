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
    async getBooks(category, subcategory) {
        // subcategory é convertido para inteiro se existir
        return await booksService.getBooks(category, subcategory ? parseInt(subcategory, 10) : undefined);
    }

    /**
     * Retorna os mapeamentos de códigos de área e subárea
     * @returns {Object} Objeto com areaCodes e subareaCodes
     */
    getCategoryMappings() {
        return booksService.getCategoryMappings();
    }
}

// Exporta uma instância única do controlador
module.exports = new BooksController();