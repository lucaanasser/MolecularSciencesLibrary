const express = require('express');
const router = express.Router();
const usersController = require('../controllers/UsersController');
const authenticateToken = require('../middlewares/authenticateToken');

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

// Buscar usuário por ID
router.get('/:id', (req, res) => {
    console.log("🔵 [UsersRoutes] GET /:id - Buscar usuário por ID:", req.params.id);
    usersController.getUserById(req, res);
});

// Rota para criar usuário (apenas admin deve poder usar na aplicação)
router.post('/', (req, res) => {
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

// Listar todos os usuários (apenas admin)
router.get('/', (req, res) => {
    console.log("🔵 [UsersRoutes] GET / - Listar todos os usuários");
    usersController.getAllUsers(req, res);
});

// Deletar usuário por ID (apenas admin)
router.delete('/:id', (req, res) => {
    console.log("🔵 [UsersRoutes] DELETE /:id - Deletar usuário por ID:", req.params.id);
    usersController.deleteUserById(req, res);
});

module.exports = router;