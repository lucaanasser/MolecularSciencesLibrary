const express = require('express');
const router = express.Router();
const disciplineEvaluationsController = require('../controllers/DisciplineEvaluationsController');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * Rotas relacionadas a avaliações de disciplinas.
 * 
 * Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
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

// Buscar avaliações de uma disciplina (ordenadas por likes)
// GET /api/evaluations/discipline/:codigo
router.get('/discipline/:codigo', (req, res, next) => {
    console.log(`🔵 [DisciplineEvaluationsRoutes] GET /discipline/${req.params.codigo} - Buscar avaliações`);
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
    disciplineEvaluationsController.getEvaluationsByDiscipline(req, res);
});

// Buscar ratings agregados (médias) de uma disciplina
// GET /api/evaluations/discipline/:codigo/stats
router.get('/discipline/:codigo/stats', (req, res) => {
    console.log(`🔵 [DisciplineEvaluationsRoutes] GET /discipline/${req.params.codigo}/stats - Buscar estatísticas`);
    disciplineEvaluationsController.getAggregatedRatings(req, res);
});

// ================== ROTAS PROTEGIDAS ==================

// Buscar minha avaliação para uma disciplina
// GET /api/evaluations/discipline/:codigo/mine
router.get('/discipline/:codigo/mine', authenticateToken, (req, res) => {
    console.log(`🔵 [DisciplineEvaluationsRoutes] GET /discipline/${req.params.codigo}/mine - Buscar minha avaliação`);
    disciplineEvaluationsController.getUserEvaluationForDiscipline(req, res);
});

// Buscar todas as minhas avaliações
// GET /api/evaluations/mine
router.get('/mine', authenticateToken, (req, res) => {
    console.log(`🔵 [DisciplineEvaluationsRoutes] GET /mine - Buscar minhas avaliações`);
    disciplineEvaluationsController.getUserEvaluations(req, res);
});

// Criar nova avaliação
// POST /api/evaluations
router.post('/', authenticateToken, (req, res) => {
    console.log(`🔵 [DisciplineEvaluationsRoutes] POST / - Criar avaliação`);
    disciplineEvaluationsController.createEvaluation(req, res);
});

// Atualizar avaliação (só própria)
// PUT /api/evaluations/:id
router.put('/:id', authenticateToken, (req, res) => {
    console.log(`🔵 [DisciplineEvaluationsRoutes] PUT /${req.params.id} - Atualizar avaliação`);
    disciplineEvaluationsController.updateEvaluation(req, res);
});

// Deletar avaliação (só própria)
// DELETE /api/evaluations/:id
router.delete('/:id', authenticateToken, (req, res) => {
    console.log(`🔵 [DisciplineEvaluationsRoutes] DELETE /${req.params.id} - Deletar avaliação`);
    disciplineEvaluationsController.deleteEvaluation(req, res);
});

// Toggle like em uma avaliação
// POST /api/evaluations/:id/like
router.post('/:id/like', authenticateToken, (req, res) => {
    console.log(`🔵 [DisciplineEvaluationsRoutes] POST /${req.params.id}/like - Toggle like`);
    disciplineEvaluationsController.toggleLike(req, res);
});

module.exports = router;
