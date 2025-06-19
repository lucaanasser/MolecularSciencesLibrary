const express = require('express');
const router = express.Router();
const booksController = require('../controllers/BooksController');

/**
 * Rotas relacionadas a livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// Adiciona um novo livro
router.post('/', async (req, res) => {
    try {
        console.log("🔵 [BooksRoutes] POST / - Adicionar novo livro");
        const bookData = req.body;
        const result = await booksController.addBook(bookData);
        console.log("🟢 [BooksRoutes] Livro adicionado com sucesso:", result);
        res.status(201).json(result);
    } catch (error) {
        console.error("🔴 [BooksRoutes] Erro ao adicionar livro:", error.message);
        res.status(500).json({
            message: 'Erro ao adicionar livro: ' + (error.message || 'Erro desconhecido'),
            details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
});

// Busca livros, com filtros opcionais de categoria e subcategoria
router.get('/', async (req, res) => {
    try {
        console.log("🔵 [BooksRoutes] GET / - Buscar livros");
        const { category, subcategory, q } = req.query;
        const books = await booksController.getBooks(category, subcategory, q);
        console.log(`🟢 [BooksRoutes] Livros encontrados: ${books.length}`);
        res.status(200).json(books);
    } catch (error) {
        console.error("🔴 [BooksRoutes] Erro ao buscar livros:", error.message);
        res.status(500).json({ message: 'Error retrieving books: ' + error.message });
    }
});

// Obtém os códigos de áreas e subáreas disponíveis
router.get('/options', (req, res) => {
    console.log("🔵 [BooksRoutes] GET /options - Buscar mapeamentos de categorias");
    const mappings = booksController.getCategoryMappings();
    console.log("🟢 [BooksRoutes] Mapeamentos de categorias retornados");
    res.json(mappings);
});

// Busca um livro específico pelo ID
router.get('/:id', async (req, res) => {
    try {
        console.log(`🔵 [BooksRoutes] GET /:id - Buscar livro por id: ${req.params.id}`);
        const book = await booksController.getBookById(Number(req.params.id));
        if (book) {
            console.log("🟢 [BooksRoutes] Livro encontrado:", book);
            res.status(200).json(book);
        } else {
            console.warn("🟡 [BooksRoutes] Livro não encontrado para id:", req.params.id);
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        console.error("🔴 [BooksRoutes] Erro ao buscar livro:", error.message);
        res.status(500).json({ message: 'Error retrieving book: ' + error.message });
    }
});

// Remove um livro pelo ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`🔵 [BooksRoutes] DELETE /:id - Remover livro id=${id}`);
        const result = await booksController.deleteBook(Number(id));
        console.log("🟢 [BooksRoutes] Livro removido com sucesso:", result);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Livro não encontrado') {
            console.warn("🟡 [BooksRoutes] Livro não encontrado para remoção:", id);
            res.status(404).json({ message: error.message });
        } else {
            console.error("🔴 [BooksRoutes] Erro ao remover livro:", error.message);
            res.status(500).json({ 
                message: 'Erro ao remover livro: ' + (error.message || 'Erro desconhecido'),
                details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            });
        }
    }
});

// Emprestar um livro
router.post('/borrow', (req, res) => {
    console.log("🔵 [BooksRoutes] POST /borrow - Emprestar livro");
    booksController.borrowBook(req, res);
});

// Devolver um livro
router.post('/return', (req, res) => {
    console.log("🔵 [BooksRoutes] POST /return - Devolver livro");
    booksController.returnBook(req, res);
});

// Gerar PDF de etiquetas para livros selecionados
router.post('/labels/pdf', async (req, res) => {
    try {
        const { books, spineType } = req.body; // books: [{id, code, ...}], spineType: 'normal'|'fina'
        console.log("🔵 [BooksRoutes] POST /labels/pdf - Gerar etiquetas PDF");
        const pdfBuffer = await booksController.generateLabelsPdf(books, spineType);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="etiquetas.pdf"',
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error("🔴 [BooksRoutes] Erro ao gerar etiquetas PDF:", error.message);
        res.status(500).json({ message: 'Erro ao gerar etiquetas PDF: ' + error.message });
    }
});

module.exports = router;