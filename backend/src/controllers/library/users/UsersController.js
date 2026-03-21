/**
 * Responsabilidade: orquestrar handlers HTTP unificados de usuarios.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de users e delega para handlers especializados.
 * Dependencias criticas: commandHandlers, queryHandlers, authHandlers e csvHandlers.
 */

const commandHandlers = require('./handlers/commandHandlers');
const queryHandlers = require('./handlers/queryHandlers');
const authHandlers = require('./handlers/authHandlers');
const csvHandlers = require('./handlers/csvHandlers');

class UsersController {}

Object.assign(
    UsersController.prototype,
    commandHandlers,
    queryHandlers,
    authHandlers,
    csvHandlers
);

module.exports = new UsersController();
