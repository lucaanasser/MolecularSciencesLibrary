/**
 * Responsabilidade: orquestrar casos de uso unificados de catalogo e avaliacoes de livros.
 * Camada: service.
 * Entradas/Saidas: expoe API publica para controllers de books.
 * Dependencias criticas: catalogServiceBridge, evaluationValidation e evaluationService.
 */

const catalogServiceBridge = require('./modules/catalogServiceBridge');
const evaluationValidation = require('./modules/evaluationValidation');
const evaluationService = require('./modules/evaluationService');

class BooksService {}

Object.assign(
    BooksService.prototype,
    catalogServiceBridge,
    evaluationValidation,
    evaluationService
);

module.exports = new BooksService();
