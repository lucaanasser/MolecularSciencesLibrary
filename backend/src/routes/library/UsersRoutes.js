const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/library/UsersController');
const authenticateToken = require('../../middlewares/authenticateToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Middleware inline: exige que o usuário autenticado seja administrador.
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        console.warn('🟡 [UsersRoutes] Acesso negado: usuário não é admin. Role:', req.user?.role);
        return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }
    next();
}

/**
 * Rotas relacionadas a usuários.
 * Inclui autenticação, criação, busca, listagem, deleção e perfil do usuário autenticado.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// Rota de perfil do usuário autenticado (DEVE vir antes de /:id)
router.get('/me', authenticateToken, (req, res) => {
    console.log("🔵 [UsersRoutes] GET /me - Perfil do usuário autenticado");
    usersController.getProfile(req, res);
});

// Atualizar imagem de perfil do usuário autenticado
router.put('/me/profile-image', authenticateToken, (req, res) => {
    console.log("🔵 [UsersRoutes] PUT /me/profile-image - Atualizar imagem de perfil");
    usersController.updateProfileImage(req, res);
});

// Buscar usuários (autocomplete) - DEVE vir antes de /:id
router.get('/search', authenticateToken, (req, res) => {
    console.log("🔵 [UsersRoutes] GET /search - Buscar usuários:", req.query.q);
    usersController.searchUsers(req, res);
});

// Listar cadastros pendentes (admin only) — DEVE vir antes de /:id
router.get('/pending', authenticateToken, requireAdmin, (req, res) => {
    console.log("🔵 [UsersRoutes] GET /pending - Listar cadastros pendentes");
    usersController.getPendingUsers(req, res);
});

// Exportar todos os usuários para CSV (apenas admin) — DEVE vir antes de /:id
router.get('/export/csv', authenticateToken, requireAdmin, (req, res) => {
    console.log("🔵 [UsersRoutes] GET /export/csv - Exportar usuários para CSV");
    usersController.exportUsersToCSV(req, res);
});

// Buscar usuário por ID
router.get('/:id', (req, res) => {
    console.log("🔵 [UsersRoutes] GET /:id - Buscar usuário por ID:", req.params.id);
    usersController.getUserById(req, res);
});

// Auto-cadastro público — cria usuário com status 'pending' (sem autenticação)
router.post('/register', (req, res) => {
    console.log("🔵 [UsersRoutes] POST /register - Auto-cadastro de usuário");
    usersController.registerUser(req, res);
});

// Rota para criar usuário pelo admin (apenas admin)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    console.log("🔵 [UsersRoutes] POST / - Criar novo usuário");
    usersController.createUser(req, res);
});

// Rota para autenticação (login)
router.post('/login', (req, res) => {
    console.log("🔵 [UsersRoutes] POST /login - Autenticação de usuário");
    usersController.authenticateUser(req, res);
});

// Solicitar redefinição de senha
router.post('/forgot-password', (req, res) => {
    console.log("🔵 [UsersRoutes] POST /forgot-password - Solicitar redefinição de senha");
    usersController.requestPasswordReset(req, res);
});

// Redefinir senha
router.post('/reset-password', (req, res) => {
    console.log("🔵 [UsersRoutes] POST /reset-password - Redefinir senha");
    usersController.resetPassword(req, res);
});

// Aprovar cadastro pendente (admin only)
router.patch('/:id/approve', authenticateToken, requireAdmin, (req, res) => {
    console.log("🔵 [UsersRoutes] PATCH /:id/approve - Aprovar cadastro pendente:", req.params.id);
    usersController.approveUser(req, res);
});

// Rejeitar e deletar cadastro pendente (admin only)
router.delete('/:id/reject', authenticateToken, requireAdmin, (req, res) => {
    console.log("🔵 [UsersRoutes] DELETE /:id/reject - Rejeitar cadastro pendente:", req.params.id);
    usersController.rejectUser(req, res);
});

// Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
    console.log("🔵 [UsersRoutes] GET / - Listar todos os usuários");
    usersController.getAllUsers(req, res);
});

// Deletar usuário por ID (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
    console.log("🔵 [UsersRoutes] DELETE /:id - Deletar usuário por ID:", req.params.id);
    usersController.deleteUserById(req, res);
});

// Importar usuários via CSV (apenas admin)
router.post('/import/csv', authenticateToken, requireAdmin, upload.single('csvFile'), (req, res) => {
    console.log("🔵 [UsersRoutes] POST /import/csv - Importar usuários via CSV");
    usersController.importUsersFromCSV(req, res);
});

module.exports = router;