/**
 * Responsabilidade: declarar endpoints HTTP unificados de catalogo e avaliacoes de livros.
 * Camada: routes.
 * Entradas/Saidas: recebe requests em /api/books e delega para BooksController.
 * Dependencias criticas: BooksController, authenticateToken e logger compartilhado.
 */

const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const BooksController = require('../../../controllers/library/books/BooksController');
const authenticateToken = require('../../../middlewares/authenticateToken');
const { getLogger } = require('../../../shared/logging/logger');

const router = express.Router();
const log = getLogger(__filename);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'sua_chave_secreta';

    try {
        req.user = jwt.verify(token, secret);
    } catch (_error) {
        // Ignora token invalido para manter endpoint publico.
    }

    return next();
};

router.post('/', async (req, res) => BooksController.addBook(req, res));
router.post('/import/csv', upload.single('csvFile'), (req, res) => BooksController.importBooksFromCSV(req, res));
router.get('/search', async (req, res) => BooksController.searchBooks(req, res));
router.get('/', async (req, res) => BooksController.getBooks(req, res));
router.get('/by-code/:code', async (req, res) => BooksController.getBooksByCode(req, res));
router.get('/count', async (req, res) => BooksController.countBooks(req, res));
router.get('/export/csv', (req, res) => BooksController.exportBooksToCSV(req, res));
router.post('/reserve', (req, res) => BooksController.setReservedStatus(req, res, true));
router.post('/unreserve', (req, res) => BooksController.setReservedStatus(req, res, false));
router.delete('/reserve/clear', (req, res) => BooksController.clearAllReservedBooks(req, res));
router.get('/reserved', (req, res) => BooksController.getReservedBooks(req, res));

router.get('/:id/evaluations', optionalAuth, (req, res) => BooksController.getEvaluationsByBook(req, res));
router.get('/:id/evaluations/stats', (req, res) => BooksController.getAggregatedRatings(req, res));
router.get('/:id/evaluations/mine', authenticateToken, (req, res) => BooksController.getUserEvaluationForBook(req, res));
router.get('/evaluations/mine', authenticateToken, (req, res) => BooksController.getUserEvaluations(req, res));
router.post('/evaluations', authenticateToken, (req, res) => BooksController.createEvaluation(req, res));
router.put('/evaluations/:id', authenticateToken, (req, res) => BooksController.updateEvaluation(req, res));
router.delete('/evaluations/:id', authenticateToken, (req, res) => BooksController.deleteEvaluation(req, res));
router.post('/evaluations/:id/like', authenticateToken, (req, res) => BooksController.toggleLike(req, res));

router.get('/:id', async (req, res) => BooksController.getBookById(req, res));
router.delete('/:id', async (req, res) => BooksController.deleteBook(req, res));

module.exports = router;
