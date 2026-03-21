/**
 * Responsabilidade: compatibilidade de import para controller legado de book evaluations.
 * Camada: controller.
 * Entradas/Saidas: reexporta controller unificado sem alterar contrato publico.
 * Dependencias criticas: controllers/library/books/BooksController.
 */

module.exports = require('./books/BooksController');
