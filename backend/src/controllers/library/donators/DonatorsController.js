/**
 * Responsabilidade: orquestrar handlers HTTP unificados de doadores.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de donators e delega para handlers especializados.
 * Dependencias criticas: commandHandlers, queryHandlers e csvHandlers.
 */

const commandHandlers = require('./handlers/commandHandlers');
const queryHandlers = require('./handlers/queryHandlers');
const csvHandlers = require('./handlers/csvHandlers');

class DonatorsController {}

Object.assign(
    DonatorsController.prototype,
    commandHandlers,
    queryHandlers,
    csvHandlers
);

module.exports = new DonatorsController();
