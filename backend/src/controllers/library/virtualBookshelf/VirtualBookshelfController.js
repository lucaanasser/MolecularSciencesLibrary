/**
 * Responsabilidade: orquestrar handlers HTTP da estante virtual.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas e delega para handlers de consulta e comando.
 * Dependencias criticas: queryHandlers e commandHandlers.
 */

const queryHandlers = require('./handlers/queryHandlers');
const commandHandlers = require('./handlers/commandHandlers');

class VirtualBookshelfController {}

Object.assign(
    VirtualBookshelfController.prototype,
    queryHandlers,
    commandHandlers
);

module.exports = new VirtualBookshelfController();
