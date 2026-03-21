/**
 * Responsabilidade: rota unificada v2 para disciplinas e avaliacoes (bloco academic/disciplines).
 * Camada: routes.
 * Entradas/Saidas: endpoints v2, autenticao e delegacao para controller unificado.
 * Dependencias criticas: AcademicDisciplinesController, authenticateToken e optionalAuth.
 */

const express = require('express');
const authenticateToken = require('../../../middlewares/authenticateToken');
const academicDisciplinesController = require('../../../controllers/academic/disciplines/AcademicDisciplinesController');
const { optionalAuth } = require('./registerAcademicDisciplinesLegacyRoutes');

const router = express.Router();

router.post('/', (req, res) => academicDisciplinesController.createDiscipline(req, res));
router.get('/search', (req, res) => academicDisciplinesController.searchDisciplines(req, res));
router.get('/stats', (req, res) => academicDisciplinesController.getStats(req, res));
router.get('/count', (req, res) => academicDisciplinesController.countDisciplines(req, res));
router.get('/campi', (req, res) => academicDisciplinesController.getCampi(req, res));
router.get('/unidades', (req, res) => academicDisciplinesController.getUnidades(req, res));
router.get('/check-exact/:codigo', (req, res) => academicDisciplinesController.checkExactMatch(req, res));
router.get('/', (req, res) => academicDisciplinesController.getDisciplines(req, res));
router.get('/:codigo/full', (req, res) => academicDisciplinesController.getFullDiscipline(req, res));
router.get('/:codigo', (req, res) => academicDisciplinesController.getDisciplineByCodigo(req, res));

router.get('/:codigo/evaluations', optionalAuth, (req, res) => {
    academicDisciplinesController.getEvaluationsByDiscipline(req, res);
});
router.get('/:codigo/evaluations/stats', (req, res) => {
    academicDisciplinesController.getAggregatedRatings(req, res);
});
router.get('/:codigo/evaluations/mine', authenticateToken, (req, res) => {
    academicDisciplinesController.getUserEvaluationForDiscipline(req, res);
});
router.post('/:codigo/evaluations', authenticateToken, (req, res) => {
    req.body.disciplineCodigo = req.params.codigo;
    academicDisciplinesController.createEvaluation(req, res);
});

router.get('/evaluations/mine', authenticateToken, (req, res) => {
    academicDisciplinesController.getUserEvaluations(req, res);
});
router.put('/evaluations/:id', authenticateToken, (req, res) => {
    academicDisciplinesController.updateEvaluation(req, res);
});
router.delete('/evaluations/:id', authenticateToken, (req, res) => {
    academicDisciplinesController.deleteEvaluation(req, res);
});
router.post('/evaluations/:id/like', authenticateToken, (req, res) => {
    academicDisciplinesController.toggleLike(req, res);
});

module.exports = router;
