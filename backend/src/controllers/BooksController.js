// BooksController gerencia as operações de controle para livros, 
// conectando as rotas aos serviços.
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const booksService = require('../services/BooksService');
const BooksModel = require('../models/BooksModel');

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
        try {
            console.log("🔵 [BooksController] Iniciando adição de livro:", bookData.title || bookData.code);
            const result = await booksService.addBook(bookData);
            console.log("🟢 [BooksController] Livro adicionado com sucesso:", result);
            return result;
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao adicionar livro:", error.message);
            throw error;
        }
    }

    /**
     * Busca um livro pelo ID, delegando ao serviço
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Livro encontrado
     */
    async getBookById(id) {
        try {
            console.log(`🔵 [BooksController] Buscando livro por id: ${id}`);
            const book = await booksService.getBookById(id);
            if (book) {
                console.log("🟢 [BooksController] Livro encontrado:", book);
            } else {
                console.warn("🟡 [BooksController] Livro não encontrado para id:", id);
            }
            return book;
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao buscar livro:", error.message);
            throw error;
        }
    }

    /**
     * Busca livros por categoria e subcategoria, delegando ao serviço
     * @param {string} category - Nome da categoria
     * @param {string|number} subcategory - Código da subcategoria
     * @returns {Promise<Array>} Lista de livros encontrados
     */
    async getBooks(category, subcategory, searchTerm) {
        try {
            console.log(`🔵 [BooksController] Buscando livros: category=${category}, subcategory=${subcategory}, searchTerm=${searchTerm}`);
            const books = await booksService.getBooks(category, subcategory, searchTerm);
            console.log(`🟢 [BooksController] Livros encontrados: ${books.length}`);
            return books;
        } catch (error) {
            console.error("🔴 [BooksController] Erro ao buscar livros:", error.message);
            throw error;
        }
    }

    /**
     * Retorna os mapeamentos de códigos de área e subárea
     * @returns {Object} Objeto com areaCodes e subareaCodes
     */
    getCategoryMappings() {
        console.log("🔵 [BooksController] Obtendo mapeamentos de categorias e subcategorias");
        const mappings = booksService.getCategoryMappings();
        console.log("🟢 [BooksController] Mapeamentos obtidos");
        return mappings;
    }

    /**
     * Remove um livro pelo ID, delegando ao serviço
     * @param {number} id - ID do livro
     * @returns {Promise<Object>} Resultado da operação
     */
    async deleteBook(id) {
        try {
            console.log(`🔵 [BooksController] Removendo livro id=${id}`);
            await booksService.removeBookById(id);
            console.log(`🟢 [BooksController] Livro removido com sucesso: id=${id}`);
            return { success: true, message: 'Livro removido com sucesso' };
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao remover livro: ${error.message}`);
            throw error;
        }
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
        console.log(`🔵 [BooksController] Emprestando livro bookId=${bookId} para studentId=${sid}`);
        try {
            await booksService.borrowBook(bookId, sid);
            console.log(`🟢 [BooksController] Livro emprestado com sucesso: bookId=${bookId}, studentId=${sid}`);
            res.status(200).json({ success: true, message: 'Livro emprestado com sucesso' });
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao emprestar livro: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Devolve um livro emprestado, delegando ao serviço
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async returnBook(req, res) {
        const { bookId } = req.body;
        console.log(`🔵 [BooksController] Devolvendo livro bookId=${bookId}`);
        try {
            await booksService.returnBook(bookId);
            console.log(`🟢 [BooksController] Livro devolvido com sucesso: bookId=${bookId}`);
            res.status(200).json({ success: true, message: 'Livro devolvido com sucesso' });
        } catch (error) {
            console.error(`🔴 [BooksController] Erro ao devolver livro: ${error.message}`);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Lista todos os livros ordenados, delegando ao modelo e à função de ordenação
     * @param {Object} req - Objeto da requisição
     * @param {Object} res - Objeto da resposta
     * @returns {Promise<void>}
     */
    async listOrdered(req, res) {
        try {
            const books = await BooksModel.getAll();
            // Apenas retorna os livros sem ordenar aqui, pois a ordenação é feita na VirtualBookShelfService
            res.json(books);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * Lista todos os livros ordenados conforme a estante virtual
     */
    async listVirtualOrdered(req, res) {
        try {
            const books = await require('../services/VirtualBookShelfService').getAllBooksOrdered();
            res.json(books);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * Gera um PDF com etiquetas para os livros informados
     * @param {Array} books - Lista de livros [{id, code, ...}]
     * @param {string} spineType - 'normal' ou 'fina'
     * @returns {Promise<Buffer>} PDF buffer
     */
    async generateLabelsPdf(books, spineType) {
        return await booksService.generateLabelsPdf(books, spineType);
    }
}

// Exporta uma instância única do controlador
module.exports = new BooksController();