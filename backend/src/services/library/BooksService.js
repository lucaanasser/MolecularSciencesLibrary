/**
 * Responsabilidade: compatibilidade de import para service legado de books.
 * Camada: service.
 * Entradas/Saidas: reexporta service unificado do dominio books.
 * Dependencias criticas: services/library/books/BooksService.
 */

module.exports = require('./books/BooksService');