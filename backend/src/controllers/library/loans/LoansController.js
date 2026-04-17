/**
 * Responsabilidade: orquestrar os handlers HTTP do bloco de emprestimos.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de loans e delega para handlers especializados.
 * Dependencias criticas: handlers de borrow/query/renew.
 */

const borrowHandlers = require('./handlers/borrowHandlers');
const queryHandlers = require('./handlers/queryHandlers');
const renewHandlers = require('./handlers/renewHandlers');

const LoansController = {};

Object.assign(
    LoansController,
    borrowHandlers,
    queryHandlers,
    renewHandlers
);

module.exports = LoansController;
