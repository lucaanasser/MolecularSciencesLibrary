/**
 * Responsabilidade: compatibilidade de import do controller legacy de emprestimos.
 * Camada: controller.
 * Entradas/Saidas: reexporta o controller modular sem alterar contrato publico.
 * Dependencias criticas: controllers/library/loans/LoansController.
 */

module.exports = require('./loans/LoansController');