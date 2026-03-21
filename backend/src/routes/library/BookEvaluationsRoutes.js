/**
 * Responsabilidade: manter compatibilidade da rota legado de avaliacoes de livros.
 * Camada: routes.
 * Entradas/Saidas: preserva endpoints antigos e delega para controller unificado de books.
 * Dependencias criticas: BooksController, authenticateToken e logger compartilhado.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const BooksController = require('../../controllers/library/books/BooksController');
const authenticateToken = require('../../middlewares/authenticateToken');
const { getLogger } = require('../../shared/logging/logger');

const router = express.Router();
const log = getLogger(__filename);
const deprecation = {
    scope: 'legacy-route-wrapper',
    replacement: 'routes/library/books/BooksRoutes',
    sunsetDate: '2026-06-30'
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'sua_chave_secreta';

    try {
        req.user = jwt.verify(token, secret);
    } catch (_error) {
        // Mantem endpoint publico sem usuario autenticado.
    }

    return next();
};

router.use((req, _res, next) => {
    log.warn('Router legado de book evaluations em uso; migrar para roteador unificado de books', {
        route: `${req.method} ${req.originalUrl}`,
        replacement: '/api/books/* (books unificado)',
        ...deprecation
    });
    next();
});

router.get('/:id/evaluations', optionalAuth, (req, res) => BooksController.getEvaluationsByBook(req, res));
router.get('/:id/evaluations/stats', (req, res) => BooksController.getAggregatedRatings(req, res));
router.get('/:id/evaluations/mine', authenticateToken, (req, res) => BooksController.getUserEvaluationForBook(req, res));
router.get('/evaluations/mine', authenticateToken, (req, res) => BooksController.getUserEvaluations(req, res));
router.post('/evaluations', authenticateToken, (req, res) => BooksController.createEvaluation(req, res));
router.put('/evaluations/:id', authenticateToken, (req, res) => BooksController.updateEvaluation(req, res));
router.delete('/evaluations/:id', authenticateToken, (req, res) => BooksController.deleteEvaluation(req, res));
router.post('/evaluations/:id/like', authenticateToken, (req, res) => BooksController.toggleLike(req, res));

module.exports = router;
