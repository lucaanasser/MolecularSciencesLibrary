/**
 * Responsabilidade: orquestrar handlers HTTP unificados de catalogo e avaliacoes de livros.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de books e delega para handlers especializados.
 * Dependencias criticas: catalogHandlers e evaluationHandlers.
 */

const catalogHandlers = require('./handlers/catalogHandlers');
const evaluationHandlers = require('./handlers/evaluationHandlers');

class BooksController {}

Object.assign(
    BooksController.prototype,
    catalogHandlers,
    evaluationHandlers
);

module.exports = new BooksController();
