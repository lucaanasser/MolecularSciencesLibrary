const express = require('express');
const router = express.Router();
const booksController = require('../../controllers/library/BooksController');
const multer = require('multer');

// Configurar multer para upload de arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
        console.log("[BooksRoutes] GET / - Buscar livros");
        // Recebe todos os filtros da query
        const filters = { ...req.query };
        const books = await booksController.getBooks(filters);
        console.log(`[BooksRoutes] Livros encontrados: ${books.length}`);
        res.status(200).json(books);
    } catch (error) {
        console.error("[BooksRoutes] Erro ao buscar livros:", error.message);
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

// Lista livros reservados didaticamente
// IMPORTANTE: Esta rota deve vir ANTES de /:id para evitar que "reserved" seja interpretado como um ID
router.get('/reserved', (req, res) => {
    console.log("🔵 [BooksRoutes] GET /reserved - Listar livros reservados didaticamente");
    booksController.getReservedBooks(req, res);
});

// Remove todos os livros da reserva didática
router.delete('/reserved/clear', (req, res) => {
    console.log("🔵 [BooksRoutes] DELETE /reserved/clear - Remover todos os livros da reserva");
    booksController.clearAllReservedBooks(req, res);
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

// Define ou remove reserva didática
router.post('/reserve', (req, res) => {
    console.log("🔵 [BooksRoutes] POST /reserve - Definir/remover reserva didática");
    booksController.setReservedStatus(req, res);
});

// Importa livros a partir de arquivo CSV
router.post('/import/csv', upload.single('csvFile'), (req, res) => {
    console.log("🔵 [BooksRoutes] POST /import/csv - Importar livros via CSV");
    booksController.importBooksFromCSV(req, res);
});

// Exporta catálogo de livros em CSV
router.get('/export/csv', (req, res) => {
    console.log("🔵 [BooksRoutes] GET /export/csv - Exportar catálogo em CSV");
    booksController.exportBooksToCSV(req, res);
});

module.exports = router;