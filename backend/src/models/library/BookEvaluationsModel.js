/**
 * Responsabilidade: compatibilidade de import para model legado de book evaluations.
 * Camada: model.
 * Entradas/Saidas: reexporta model unificado do dominio books.
 * Dependencias criticas: models/library/books/BooksModel.
 */

module.exports = require('./books/BooksModel');
