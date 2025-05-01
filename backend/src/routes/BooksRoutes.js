// Importa o Express e inicializa o roteador
const express = require('express');
const router = express.Router();

// Importa o controlador de livros
const booksController = require('../controllers/BooksController');

// Rota para adicionar um novo livro ou exemplar
router.post('/', async (req, res) => {
    try {
        const bookData = req.body;
        const result = await booksController.addBook(bookData);
        res.status(201).json(result);
    } catch (error) {
        // Retorna erro detalhado em ambiente de desenvolvimento
        res.status(500).json({
            message: 'Erro ao adicionar livro: ' + (error.message || 'Erro desconhecido'),
            details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
});

// Rota para buscar livros, com filtros opcionais de categoria e subcategoria
router.get('/', async (req, res) => {
    try {
        const { category, subcategory } = req.query;
        console.log('GET /api/books', { category, subcategory });
        const books = await booksController.getBooks(category, subcategory);
        console.log('Books encontrados:', books);
        res.status(200).json(books);
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ message: 'Error retrieving books: ' + error.message });
    }
});

// Rota para obter os códigos de áreas e subáreas disponíveis
router.get('/options', (req, res) => {
    const mappings = booksController.getCategoryMappings();
    res.json(mappings);
});

// Rota para buscar um livro específico pelo ID
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

// Exporta o roteador para ser usado na aplicação principal
module.exports = router;