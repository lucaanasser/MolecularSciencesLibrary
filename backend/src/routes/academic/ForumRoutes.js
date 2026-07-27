const express = require('express');
const router = express.Router();
const forumController = require('../../controllers/academic/ForumController');
const authenticateToken = require('../../middlewares/authenticateToken');

/**
 * Rotas do Fórum - Stack UnderFlow
 * 
 * Rotas públicas (leitura):
 * - GET /questions - Lista perguntas
 * - GET /questions/:id - Detalhes da pergunta
 * - GET /tags - Lista todas as tags
 * - GET /tags/popular - Tags populares
 * - GET /stats - Estatísticas globais
 * - GET /top-contributors - Top contributors
 * 
 * Rotas autenticadas (escrita):
 * - POST /questions - Criar pergunta
 * - PUT /questions/:id - Editar pergunta
 * - DELETE /questions/:id - Deletar pergunta
 * - POST /questions/:id/answers - Criar resposta
 * - POST /questions/:id/vote - Votar em pergunta
 * - PUT /answers/:id - Editar resposta
 * - DELETE /answers/:id - Deletar resposta
 * - POST /answers/:id/accept - Aceitar resposta
 * - POST /answers/:id/vote - Votar em resposta
 * 
 * Rotas de moderação (admin):
 * - POST /questions/:id/close - Fechar/reabrir pergunta
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// Middleware opcional para rotas que podem ou não ter usuário logado
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        req.user = null;
        return next();
    }

    const jwt = require('jsonwebtoken');
    const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
    
    jwt.verify(token, SECRET, (err, user) => {
        req.user = err ? null : user;
        next();
    });
};

// =====================================================
// QUESTIONS - Perguntas
// =====================================================

// Lista perguntas (público, mas com info de votos se logado)
router.get('/questions', optionalAuth, (req, res) => {
    console.log("🔵 [ForumRoutes] GET /questions");
    forumController.getQuestions(req, res);
});

// Detalhes de uma pergunta (público, mas com info de votos se logado)
router.get('/questions/:id', optionalAuth, (req, res) => {
    console.log("🔵 [ForumRoutes] GET /questions/:id");
    forumController.getQuestionById(req, res);
});

// Criar pergunta (autenticado)
router.post('/questions', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /questions");
    forumController.createQuestion(req, res);
});

// Editar pergunta (autenticado - autor ou admin)
router.put('/questions/:id', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] PUT /questions/:id");
    forumController.updateQuestion(req, res);
});

// Deletar pergunta (autenticado - autor ou admin)
router.delete('/questions/:id', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] DELETE /questions/:id");
    forumController.deleteQuestion(req, res);
});

// Votar em pergunta (autenticado)
router.post('/questions/:id/vote', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /questions/:id/vote");
    forumController.voteQuestion(req, res);
});

// Fechar/reabrir pergunta (admin)
router.post('/questions/:id/close', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /questions/:id/close");
    forumController.toggleCloseQuestion(req, res);
});

// Fixar/desafixar pergunta (admin)
router.post('/questions/:id/pin', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /questions/:id/pin");
    forumController.togglePinQuestion(req, res);
});

// Seguir/deixar de seguir pergunta (autenticado)
router.post('/questions/:id/subscribe', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /questions/:id/subscribe");
    forumController.toggleSubscription(req, res);
});

// Salvar/remover pergunta dos favoritos (autenticado)
router.post('/questions/:id/bookmark', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /questions/:id/bookmark");
    forumController.toggleBookmark(req, res);
});

// Listar perguntas salvas do usuário logado (autenticado)
router.get('/bookmarks', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] GET /bookmarks");
    forumController.getMyBookmarks(req, res);
});

// =====================================================
// ANSWERS - Respostas
// =====================================================

// Criar resposta (autenticado)
router.post('/questions/:id/answers', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /questions/:id/answers");
    forumController.createAnswer(req, res);
});

// Editar resposta (autenticado - autor ou admin)
router.put('/answers/:id', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] PUT /answers/:id");
    forumController.updateAnswer(req, res);
});

// Deletar resposta (autenticado - autor ou admin)
router.delete('/answers/:id', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] DELETE /answers/:id");
    forumController.deleteAnswer(req, res);
});

// Aceitar resposta (autenticado - autor da pergunta ou admin)
router.post('/answers/:id/accept', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /answers/:id/accept");
    forumController.acceptAnswer(req, res);
});

// Votar em resposta (autenticado)
router.post('/answers/:id/vote', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /answers/:id/vote");
    forumController.voteAnswer(req, res);
});

// =====================================================
// TAGS - Tags
// =====================================================

// Listar todas as tags (público)
router.get('/tags', (req, res) => {
    console.log("🔵 [ForumRoutes] GET /tags");
    forumController.getTags(req, res);
});

// Tags populares (público)
router.get('/tags/popular', (req, res) => {
    console.log("🔵 [ForumRoutes] GET /tags/popular");
    forumController.getPopularTags(req, res);
});

// Criar nova tag (autenticado)
router.post('/tags', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /tags");
    forumController.createTag(req, res);
});

// Listar tags pendentes (admin)
router.get('/tags/pending', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] GET /tags/pending");
    forumController.getPendingTags(req, res);
});

// Aprovar tag (admin)
router.post('/tags/:id/approve', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /tags/:id/approve");
    forumController.approveTag(req, res);
});

// Deletar tag (admin)
router.delete('/tags/:id', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] DELETE /tags/:id");
    forumController.deleteTag(req, res);
});

// Listar tópicos disponíveis (público)
router.get('/topics', (req, res) => {
    console.log("🔵 [ForumRoutes] GET /topics");
    forumController.getTopics(req, res);
});

// =====================================================
// COMMENTS - Comentários
// =====================================================

// Criar comentário (autenticado)
router.post('/comments', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /comments");
    forumController.createComment(req, res);
});

// Remover comentário (autor ou admin)
router.delete('/comments/:id', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] DELETE /comments/:id");
    forumController.deleteComment(req, res);
});

// =====================================================
// REPORTS - Denúncias de conteúdo
// =====================================================

// Registrar denúncia (autenticado)
router.post('/reports', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /reports");
    forumController.createReport(req, res);
});

// Listar denúncias (admin)
router.get('/reports', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] GET /reports");
    forumController.getReports(req, res);
});

// Resolver/descartar denúncia (admin)
router.post('/reports/:id/resolve', authenticateToken, (req, res) => {
    console.log("🔵 [ForumRoutes] POST /reports/:id/resolve");
    forumController.resolveReport(req, res);
});

// =====================================================
// STATISTICS - Estatísticas
// =====================================================

// Estatísticas globais (público)
router.get('/stats', (req, res) => {
    console.log("🔵 [ForumRoutes] GET /stats");
    forumController.getStats(req, res);
});

// Top contributors (público)
router.get('/top-contributors', (req, res) => {
    console.log("🔵 [ForumRoutes] GET /top-contributors");
    forumController.getTopContributors(req, res);
});

// Estatísticas do usuário (público)
router.get('/users/:id/stats', (req, res) => {
    console.log("🔵 [ForumRoutes] GET /users/:id/stats");
    forumController.getUserStats(req, res);
});

// Respostas de um usuário (público)
router.get('/users/:id/answers', (req, res) => {
    console.log("🔵 [ForumRoutes] GET /users/:id/answers");
    forumController.getUserAnswers(req, res);
});

module.exports = router;
