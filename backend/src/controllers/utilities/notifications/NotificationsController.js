/**
 * Responsabilidade: orquestrar handlers HTTP do dominio de notificacoes.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res de rotas de notifications e delega para handlers.
 * Dependencias criticas: commandHandlers e queryHandlers.
 */

const commandHandlers = require('./handlers/commandHandlers');
const queryHandlers = require('./handlers/queryHandlers');

class NotificationsController {}

Object.assign(
    NotificationsController.prototype,
    commandHandlers,
    queryHandlers
);

module.exports = new NotificationsController();
