/**
 * Responsabilidade: declarar endpoints HTTP do dominio de email.
 * Camada: routes.
 * Entradas/Saidas: recebe requests em /api/email e delega para EmailController.
 * Dependencias criticas: EmailController, authenticateToken e logger compartilhado.
 */

const express = require('express');
const router = express.Router();
const EmailController = require('../../controllers/utilities/email/EmailController');
const authenticateToken = require('../../middlewares/authenticateToken');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

// Lista emails da caixa de entrada (admin)
router.get('/inbox', authenticateToken, (req, res) => {
    log.start('Encaminhando requisicao para listagem da inbox de email', { route: 'GET /inbox', requester_id: req?.user?.id });
    EmailController.getInbox(req, res);
});

// Exclui email da caixa de entrada (admin)
router.delete('/inbox/:emailId', authenticateToken, (req, res) => {
    log.start('Encaminhando requisicao para exclusao de email da inbox', {
        route: 'DELETE /inbox/:emailId',
        requester_id: req?.user?.id,
        email_id: req.params.emailId
    });
    EmailController.deleteInboxEmail(req, res);
});

module.exports = router;
