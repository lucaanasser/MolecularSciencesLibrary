const express = require('express');
const router = express.Router();
const bookEvaluationsController = require('../../controllers/library/BookEvaluationsController');
const authenticateToken = require('../../middlewares/authenticateToken');

/**
 * Rotas relacionadas a avaliações de livros.
 * 
 * Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
 * Critérios: Geral, Qualidade do Conteúdo, Legibilidade, Utilidade, Precisão
 * 
 * Avaliações de estrelas são sempre anônimas
 * Comentários mostram nome por padrão, mas usuário pode escolher anonimato
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// ================== ROTAS PÚBLICAS ==================

// Buscar avaliações de um livro (ordenadas por likes)
// GET /api/books/:id/evaluations
router.get('/:id/evaluations', (req, res, next) => {
    console.log(`🔵 [BookEvaluationsRoutes] GET /${req.params.id}/evaluations - Buscar avaliações`);
    // Tenta extrair usuário do token se existir, mas não requer
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
        try {
            req.user = jwt.verify(token, SECRET);
        } catch (e) {
            // Token inválido, continua sem usuário
        }
    }
    bookEvaluationsController.getEvaluationsByBook(req, res);
});

// Buscar ratings agregados (médias) de um livro
// GET /api/books/:id/evaluations/stats
router.get('/:id/evaluations/stats', (req, res) => {
    console.log(`🔵 [BookEvaluationsRoutes] GET /${req.params.id}/evaluations/stats - Buscar estatísticas`);
    bookEvaluationsController.getAggregatedRatings(req, res);
});

// ================== ROTAS PROTEGIDAS ==================

// Buscar minha avaliação para um livro
// GET /api/books/:id/evaluations/mine
router.get('/:id/evaluations/mine', authenticateToken, (req, res) => {
    console.log(`🔵 [BookEvaluationsRoutes] GET /${req.params.id}/evaluations/mine - Buscar minha avaliação`);
    bookEvaluationsController.getUserEvaluationForBook(req, res);
});

// Buscar todas as minhas avaliações de livros
// GET /api/books/evaluations/mine
router.get('/evaluations/mine', authenticateToken, (req, res) => {
    console.log(`🔵 [BookEvaluationsRoutes] GET /evaluations/mine - Buscar minhas avaliações`);
    bookEvaluationsController.getUserEvaluations(req, res);
});

// Criar nova avaliação
// POST /api/books/evaluations
router.post('/evaluations', authenticateToken, (req, res) => {
    console.log(`🔵 [BookEvaluationsRoutes] POST /evaluations - Criar avaliação`);
    bookEvaluationsController.createEvaluation(req, res);
});

// Atualizar avaliação (só própria)
// PUT /api/books/evaluations/:id
router.put('/evaluations/:id', authenticateToken, (req, res) => {
    console.log(`🔵 [BookEvaluationsRoutes] PUT /evaluations/${req.params.id} - Atualizar avaliação`);
    bookEvaluationsController.updateEvaluation(req, res);
});

// Deletar avaliação (só própria)
// DELETE /api/books/evaluations/:id
router.delete('/evaluations/:id', authenticateToken, (req, res) => {
    console.log(`🔵 [BookEvaluationsRoutes] DELETE /evaluations/${req.params.id} - Deletar avaliação`);
    bookEvaluationsController.deleteEvaluation(req, res);
});

// Toggle like em uma avaliação
// POST /api/books/evaluations/:id/like
router.post('/evaluations/:id/like', authenticateToken, (req, res) => {
    console.log(`🔵 [BookEvaluationsRoutes] POST /evaluations/${req.params.id}/like - Toggle like`);
    bookEvaluationsController.toggleLike(req, res);
});

module.exports = router;
