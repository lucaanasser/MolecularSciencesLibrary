/**
 * Responsabilidade: declarar endpoints HTTP do dominio de notificacoes.
 * Camada: routes.
 * Entradas/Saidas: recebe requests em /api/notifications e delega ao NotificationsController.
 * Dependencias criticas: NotificationsController, EmailController, authenticateToken e logger.
 */

const express = require('express');
const router = express.Router();
const NotificationsController = require('../../controllers/utilities/notifications/NotificationsController');
const EmailController = require('../../controllers/utilities/email/EmailController');
const authenticateToken = require('../../middlewares/authenticateToken');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

// Lista notificacoes do usuario autenticado
router.get('/me', authenticateToken, (req, res) => {
    log.start('Encaminhando requisicao para listagem de notificacoes do usuario', {
        route: 'GET /me',
        requester_id: req?.user?.id
    });
    NotificationsController.getMyNotifications(req, res);
});

// Cria notificacao (rota principal)
router.post('/', authenticateToken, (req, res) => {
    log.start('Encaminhando requisicao para criacao de notificacao', {
        route: 'POST /',
        requester_id: req?.user?.id,
        type: req.body?.type
    });
    NotificationsController.createNotification(req, res);
});

// Rota legada para nudge
router.post('/nudge', (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para POST /api/notifications', {
        route: 'POST /nudge',
        replacement: 'POST /'
    });
    NotificationsController.createNotification(req, res);
});

// Marca notificacao como lida
router.patch('/:id/read', authenticateToken, (req, res) => {
    log.start('Encaminhando requisicao para marcar notificacao como lida', {
        route: 'PATCH /:id/read',
        notification_id: req.params.id,
        requester_id: req?.user?.id
    });
    NotificationsController.markAsRead(req, res);
});

// Lista todas as notificacoes (admin)
router.get('/', authenticateToken, (req, res) => {
    log.start('Encaminhando requisicao para listagem administrativa de notificacoes', {
        route: 'GET /',
        requester_id: req?.user?.id,
        user_id: req.query?.user_id
    });
    NotificationsController.getAllNotifications(req, res);
});

// Exclui notificacao para usuario autenticado
router.delete('/:id', authenticateToken, (req, res) => {
    log.start('Encaminhando requisicao para exclusao de notificacao', {
        route: 'DELETE /:id',
        notification_id: req.params.id,
        requester_id: req?.user?.id
    });
    NotificationsController.deleteForUser(req, res);
});

// Endpoint legado: inbox foi movida para /api/email/inbox
router.get('/inbox', authenticateToken, (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para GET /api/email/inbox', {
        route: 'GET /inbox',
        replacement: '/api/email/inbox'
    });
    EmailController.getInbox(req, res);
});

// Endpoint legado: exclusao de inbox foi movida para /api/email/inbox/:emailId
router.delete('/inbox/:emailId', authenticateToken, (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para DELETE /api/email/inbox/:emailId', {
        route: 'DELETE /inbox/:emailId',
        replacement: '/api/email/inbox/:emailId',
        email_id: req.params.emailId
    });
    EmailController.deleteInboxEmail(req, res);
});

module.exports = router;