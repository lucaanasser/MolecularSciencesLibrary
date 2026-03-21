/**
 * Responsabilidade: compatibilidade de import para model legado de books.
 * Camada: model.
 * Entradas/Saidas: reexporta model unificado do dominio books.
 * Dependencias criticas: models/library/books/BooksModel.
 */

module.exports = require('./books/BooksModel');