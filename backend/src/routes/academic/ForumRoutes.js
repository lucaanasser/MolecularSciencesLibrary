const express = require('express');
const router = express.Router();
const forumController = require('../../controllers/academic/forum/ForumController');
const authenticateToken = require('../../middlewares/authenticateToken');
const optionalAuth = require('../../middlewares/optionalAuth');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * Rotas do Fórum - Stack UnderFlow.
 * Camada fachada: cada rota delega ao forumController (singleton) via wrapper.
 * Middlewares: optionalAuth (leitura com contexto de usuário), authenticateToken
 * (escrita/moderação) ou nenhum (endpoints totalmente públicos).
 */

// Log único de entrada para todas as rotas do fórum.
router.use((req, _res, next) => {
    log.start(`${req.method} ${req.originalUrl}`);
    next();
});

// =====================================================
// QUESTIONS - Perguntas
// =====================================================

router.get('/questions', optionalAuth, (req, res) => forumController.getQuestions(req, res));
router.get('/questions/:id', optionalAuth, (req, res) => forumController.getQuestionById(req, res));
router.post('/questions', authenticateToken, (req, res) => forumController.createQuestion(req, res));
router.put('/questions/:id', authenticateToken, (req, res) => forumController.updateQuestion(req, res));
router.delete('/questions/:id', authenticateToken, (req, res) => forumController.deleteQuestion(req, res));
router.post('/questions/:id/vote', authenticateToken, (req, res) => forumController.voteQuestion(req, res));
router.post('/questions/:id/close', authenticateToken, (req, res) => forumController.toggleCloseQuestion(req, res));
router.post('/questions/:id/pin', authenticateToken, (req, res) => forumController.togglePinQuestion(req, res));
router.post('/questions/:id/subscribe', authenticateToken, (req, res) => forumController.toggleSubscription(req, res));
router.post('/questions/:id/bookmark', authenticateToken, (req, res) => forumController.toggleBookmark(req, res));
router.get('/bookmarks', authenticateToken, (req, res) => forumController.getMyBookmarks(req, res));

// =====================================================
// ANSWERS - Respostas
// =====================================================

router.post('/questions/:id/answers', authenticateToken, (req, res) => forumController.createAnswer(req, res));
router.put('/answers/:id', authenticateToken, (req, res) => forumController.updateAnswer(req, res));
router.delete('/answers/:id', authenticateToken, (req, res) => forumController.deleteAnswer(req, res));
router.post('/answers/:id/accept', authenticateToken, (req, res) => forumController.acceptAnswer(req, res));
router.post('/answers/:id/vote', authenticateToken, (req, res) => forumController.voteAnswer(req, res));

// =====================================================
// TAGS - Tags
// =====================================================

router.get('/tags', (req, res) => forumController.getTags(req, res));
router.get('/tags/popular', (req, res) => forumController.getPopularTags(req, res));
router.post('/tags', authenticateToken, (req, res) => forumController.createTag(req, res));
router.get('/tags/pending', authenticateToken, (req, res) => forumController.getPendingTags(req, res));
router.post('/tags/:id/approve', authenticateToken, (req, res) => forumController.approveTag(req, res));
router.delete('/tags/:id', authenticateToken, (req, res) => forumController.deleteTag(req, res));
router.get('/topics', (req, res) => forumController.getTopics(req, res));

// =====================================================
// COMMENTS - Comentários
// =====================================================

router.post('/comments', authenticateToken, (req, res) => forumController.createComment(req, res));
router.delete('/comments/:id', authenticateToken, (req, res) => forumController.deleteComment(req, res));

// =====================================================
// REPORTS - Denúncias de conteúdo
// =====================================================

router.post('/reports', authenticateToken, (req, res) => forumController.createReport(req, res));
router.get('/reports', authenticateToken, (req, res) => forumController.getReports(req, res));
router.post('/reports/:id/resolve', authenticateToken, (req, res) => forumController.resolveReport(req, res));

// =====================================================
// STATISTICS - Estatísticas
// =====================================================

router.get('/stats', (req, res) => forumController.getStats(req, res));
router.get('/top-contributors', (req, res) => forumController.getTopContributors(req, res));
router.get('/users/:id/stats', (req, res) => forumController.getUserStats(req, res));
router.get('/users/:id/answers', (req, res) => forumController.getUserAnswers(req, res));

module.exports = router;
