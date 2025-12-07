const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/NotificationsController');
const authenticateToken = require('../middlewares/authenticateToken');

// Lista notificações do usuário autenticado
router.get('/me', authenticateToken, (req, res) => {
    notificationsController.getMyNotifications(req, res);
});

// Cria uma notificação (pode ser usada para "cutucar")
router.post('/', authenticateToken, (req, res) => {
    notificationsController.createNotification(req, res);
});

// Rota específica para nudge (sem autenticação para facilitar uso)
router.post('/nudge', (req, res) => {
    notificationsController.createNotification(req, res);
});

// Marca notificação como lida
router.patch('/:id/read', authenticateToken, (req, res) => {
    notificationsController.markAsRead(req, res);
});

// Lista todas as notificações (admin)
router.get('/', authenticateToken, (req, res) => {
    notificationsController.getAllNotifications(req, res);
});

// Exclui notificação apenas para o usuário autenticado (soft delete)
router.delete('/:id', authenticateToken, (req, res) => {
    notificationsController.deleteForUser(req, res);
});

// Lista emails da caixa de entrada do Gmail (admin)
router.get('/inbox', authenticateToken, (req, res) => {
    notificationsController.getInbox(req, res);
});

// Deleta email da caixa de entrada do Gmail (admin)
router.delete('/inbox/:emailId', authenticateToken, (req, res) => {
    notificationsController.deleteInboxEmail(req, res);
});

module.exports = router;