/**
 * Rotas relacionadas a livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const express = require('express');
const router = express.Router();
const BooksController = require('../../controllers/library/BooksController');
const multer = require('multer');

// Configurar multer para upload de arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/* ===================== ADIÇÃO AO ACERVO ====================== */

/**
 * @route POST /
 * @desc Adiciona um novo livro ao acervo
 * @body {
 *   id?: number,       // código de barras EAN-13 (opcional, pode ser gerado automaticamente)
 *   code?: string,     // código de posição (opcional, pode ser gerado automaticamente)
 *   area: string,
 *   subarea: string,
 *   title: string,
 *   subtitle?: string,
 *   authors: string,
 *   edition: number,
 *   volume: number,
 *   language: string,  // "Português", "Inglês", "Espanhol", "Outro"
 *   status?: string,   // "disponível" (padrão), "emprestado", "reservado", "indisponível" (livros perdidos ou danificados)
 * }
 * @returns {Object} Livro criado
 */
router.post('/', async (req, res) => {
    console.log("🔵 [BooksRoutes] POST / - Adicionar novo livro");
    BooksController.addBook(req, res);
});

/**
 * @route POST /import/csv
 * @desc Importa livros via arquivo CSV
 * @formData { csvFile: File (CSV) }
 * @returns {Object} Resultado da importação
 */
router.post('/import/csv', upload.single('csvFile'), (req, res) => {
    console.log("🔵 [BooksRoutes] POST /import/csv - Importar livros via CSV");
    BooksController.importBooksFromCSV(req, res);
});

/* ===================== EMPRÉSTIMO E DEVOLUÇÃO ====================== */


/**
 * @route POST /borrow
 * @desc Empresta um livro para um usuário
 * @body {
 *   bookId: number, // id do livro (EAN-13)
 *   userId: number  // id do usuário
 * }
 * @returns {Object} Resultado do empréstimo
 */
router.post('/borrow', (req, res) => {
    console.log("🔵 [BooksRoutes] POST /borrow - Emprestar livro");
    BooksController.borrowBook(req, res);
});


/**
 * @route POST /return
 * @desc Devolve um livro emprestado
 * @body {
 *   bookId: number // id do livro (EAN-13)
 * }
 * @returns {Object} Resultado da devolução
 */
router.post('/return', (req, res) => {
    console.log("🔵 [BooksRoutes] POST /return - Devolver livro");
    BooksController.returnBook(req, res);
});

/* ========================= BUSCA ========================= */


/**
 * @route GET /search
 * @desc Busca livros para autocomplete
 * @query {
 *   q: string,     // termo de busca - procurado em título, autores e código
 *   limit?: number // limite de resultados (opcional, padrão: 10)
 * }
 * @returns {Array<Object>} Livros encontrados (apenas os campos básicos)
 */
router.get('/search', async (req, res) => {
    console.log("🔵 [BooksRoutes] GET /search - Autocomplete de livros");
    BooksController.searchBooks(req, res);
});


/**
 * @route GET /
 * @desc Busca livros com filtros (opcionais), retorna dados completos
 * @query {
 *   q?: string,                 // termo de busca - procurado em título, subtítulo, autores e código
 *   area?: string | string[],
 *   subarea?: string | string[],
 *   status?: string | string[],
 *   limit?: number,            // para paginação
 *   offset?: number            // para paginação (começa a exibir a partir deste índice)
 * }
 * @returns {Array<Object>} Livros encontrados (formato completo)
 */
router.get('/', async (req, res) => {
    console.log("🔵 [BooksRoutes] GET / - Buscar livros");
    BooksController.getBooks(req, res);
});


/* ========================= DADOS DO ACERVO ========================= */


/**
 * @route GET /count
 * @desc Conta total de livros encontrados com filtros (opcionais)
 * @query {
 *   q?: string,                 // termo de busca - procurado em título, subtítulo, autores e código
 *   area?: string | string[],
 *   subarea?: string | string[],
 *   status?: string | string[]
 * }
 * @returns {Object} { count: number }
 */
router.get('/count', async (req, res) => {
    console.log("🔵 [BooksRoutes] GET /count - Contar livros"); 
    BooksController.countBooks(req, res);
});


/**
 * @route GET /export/csv
 * @desc Exporta catálogo de livros em CSV
 * @returns {text/csv} Arquivo CSV com todos os livros
 */
router.get('/export/csv', (req, res) => {
    console.log("🔵 [BooksRoutes] GET /export/csv - Exportar catálogo em CSV");
    BooksController.exportBooksToCSV(req, res);
});


/* ========================= RESERVA DIDÁTICA ========================= */


/**
 * @route POST /reserve
 * @desc Define ou remove reserva didática para um livro
 * @body {
 *   bookId: number,          // id do livro (EAN-13)
 *   isReserved: boolean      // true para reservar, false para remover
 * }
 * @returns {Object} Resultado da operação
 */
router.post('/reserve', (req, res) => {
    console.log("🔵 [BooksRoutes] POST /reserve - Definir/remover reserva didática");
    BooksController.setReservedStatus(req, res);
});


/**
 * @route DELETE /reserved/clear
 * @desc Remove todos os livros da reserva didática
 * @returns {Object} Resultado da operação
 */
router.delete('/reserved/clear', (req, res) => {
    console.log("🔵 [BooksRoutes] DELETE /reserved/clear - Remover todos os livros da reserva");
    BooksController.clearAllReservedBooks(req, res);
});


/**
 * @route GET /reserved
 * @desc Lista todos os livros reservados didaticamente
 * @returns {Array<Object>} Livros reservados
 */
router.get('/reserved', (req, res) => {
    console.log("🔵 [BooksRoutes] GET /reserved - Listar livros reservados didaticamente");
    BooksController.getReservedBooks(req, res);
});

/* ========================= ROTAS COM ID ========================= */
/*          IMPORTANTE: Essas rotas devem vir por útlimo            */

/**
 * @route GET /:id
 * @desc Busca um livro específico pelo ID
 * @param {id} number // id do livro (EAN-13)
 * @returns {Object} Livro encontrado (formato completo) ou erro se não encontrado
 */
router.get('/:id', async (req, res) => {
    console.log("🔵 [BooksRoutes] GET /:id - Buscar livro por id");
    BooksController.getBookById(req, res);
});


/**
 * @route DELETE /:id
 * @desc Remove um livro pelo ID
 * @param {id} number // id do livro (EAN-13)
 * @returns {Object} Resultado da remoção
 */
router.delete('/:id', async (req, res) => {
    console.log("🔵 [BooksRoutes] DELETE /:id - Remover livro por id");  
    BooksController.deleteBook(req, res);
});

module.exports = router;