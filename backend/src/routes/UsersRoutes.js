const express = require('express');
const router = express.Router();
const usersController = require('../controllers/UsersController');
const authenticateToken = require('../middlewares/authenticateToken');

// Rota de perfil do usuário autenticado (DEVE vir antes de /:id)
router.get('/me', authenticateToken, (req, res) => usersController.getProfile(req, res));

// Buscar usuário por ID
router.get('/:id', (req, res) => usersController.getUserById(req, res));

// Rota para criar usuário (apenas admin deve poder usar na aplicação)
router.post('/', (req, res) => usersController.createUser(req, res));

// Rota para autenticação (login)
router.post('/login', (req, res) => usersController.authenticateUser(req, res));

// Listar todos os usuários (apenas admin)
router.get('/', (req, res) => usersController.getAllUsers(req, res));

// Deletar usuário por ID (apenas admin)
router.delete('/:id', (req, res) => usersController.deleteUserById(req, res));

module.exports = router;