/**
 * Responsabilidade: orquestrar handlers HTTP do dominio de email.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de email e delega para handlers.
 * Dependencias criticas: inboxHandlers.
 */

const inboxHandlers = require('./handlers/inboxHandlers');

class EmailController {}

Object.assign(
    EmailController.prototype,
    inboxHandlers
);

module.exports = new EmailController();
