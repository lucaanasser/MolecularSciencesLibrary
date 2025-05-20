const express = require('express');
const router = express.Router();
const booksController = require('../controllers/BooksController');

// Adiciona um novo livro ou exemplar
router.post('/', async (req, res) => {
    try {
        const bookData = req.body;
        const result = await booksController.addBook(bookData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao adicionar livro: ' + (error.message || 'Erro desconhecido'),
            details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
});

// Busca livros, com filtros opcionais de categoria e subcategoria
router.get('/', async (req, res) => {
    try {
        const { category, subcategory, q } = req.query; // <-- adicione q
        const books = await booksController.getBooks(category, subcategory, q); // <-- passe q
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving books: ' + error.message });
    }
});

// Obtém os códigos de áreas e subáreas disponíveis
router.get('/options', (req, res) => {
    const mappings = booksController.getCategoryMappings();
    res.json(mappings);
});

// Busca um livro específico pelo ID
router.get('/:id', async (req, res) => {
    try {
        const book = await booksController.getBookById(req.params.id);
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving book: ' + error.message });
    }
});

// Remove um exemplar (ou livro) pelo ID e reordena
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await booksController.deleteBook(id);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Livro não encontrado') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ 
                message: 'Erro ao remover livro: ' + (error.message || 'Erro desconhecido'),
                details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            });
        }
    }
});

// Emprestar um livro
router.post('/borrow', (req, res) => booksController.borrowBook(req, res));

// Devolver um livro
router.post('/return', (req, res) => booksController.returnBook(req, res));

module.exports = router;