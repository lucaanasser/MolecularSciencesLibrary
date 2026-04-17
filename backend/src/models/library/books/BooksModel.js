/**
 * Responsabilidade: orquestrar persistencia unificada de catalogo e avaliacoes de livros.
 * Camada: model.
 * Entradas/Saidas: expoe API de leitura/escrita para livros e book evaluations.
 * Dependencias criticas: catalogModelBridge e evaluationModelBridge.
 */

const catalogModelBridge = require('./modules/catalogModelBridge');
const evaluationModelBridge = require('./modules/evaluationModelBridge');

class BooksModel {}

Object.assign(
    BooksModel.prototype,
    catalogModelBridge,
    evaluationModelBridge
);

module.exports = new BooksModel();
