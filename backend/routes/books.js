const express = require('express');
const router = express.Router();
const booksController = require('../booksController');
const { areaCodes, subareaCodes } = require('../books'); // Exporte esses objetos do books.js


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

router.get('/', async (req, res) => {
    try {
        const books = await booksController.getBooks();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving books: ' + error.message });
    }
});

router.get('/options', (req, res) => {
    res.json({
        areaCodes,
        subareaCodes
    });
});


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


module.exports = router;