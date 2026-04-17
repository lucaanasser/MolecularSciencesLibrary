/**
 * Responsabilidade: declarar endpoints HTTP unificados de usuarios.
 * Camada: routes.
 * Entradas/Saidas: recebe requests em /api/users e delega para UsersController.
 * Dependencias criticas: UsersController, authenticateToken e logger compartilhado.
 */

const express = require('express');
const multer = require('multer');
const authenticateToken = require('../../../middlewares/authenticateToken');
const UsersController = require('../../../controllers/library/users/UsersController');
const { getLogger } = require('../../../shared/logging/logger');

const router = express.Router();
const log = getLogger(__filename);
const upload = multer({ storage: multer.memoryStorage() });

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        log.warn('Acesso negado para usuario nao admin', { role: req.user?.role, route: `${req.method} ${req.originalUrl}` });
        return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }
    return next();
};

router.get('/me', authenticateToken, (req, res) => UsersController.getProfile(req, res));
router.put('/me/profile-image', authenticateToken, (req, res) => UsersController.updateProfileImage(req, res));
router.get('/search', authenticateToken, (req, res) => UsersController.searchUsers(req, res));
router.get('/pending', authenticateToken, requireAdmin, (req, res) => UsersController.getPendingUsers(req, res));
router.get('/export/csv', authenticateToken, requireAdmin, (req, res) => UsersController.exportUsersToCSV(req, res));
router.get('/:id', (req, res) => UsersController.getUserById(req, res));
router.post('/register', (req, res) => UsersController.registerUser(req, res));
router.post('/', authenticateToken, requireAdmin, (req, res) => UsersController.createUser(req, res));
router.post('/login', (req, res) => UsersController.authenticateUser(req, res));
router.post('/forgot-password', (req, res) => UsersController.requestPasswordReset(req, res));
router.post('/reset-password', (req, res) => UsersController.resetPassword(req, res));
router.patch('/:id/approve', authenticateToken, requireAdmin, (req, res) => UsersController.approveUser(req, res));
router.delete('/:id/reject', authenticateToken, requireAdmin, (req, res) => UsersController.rejectUser(req, res));
router.get('/', authenticateToken, requireAdmin, (req, res) => UsersController.getAllUsers(req, res));
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => UsersController.deleteUserById(req, res));
router.post('/import/csv', authenticateToken, requireAdmin, upload.single('csvFile'), (req, res) => UsersController.importUsersFromCSV(req, res));

module.exports = router;
