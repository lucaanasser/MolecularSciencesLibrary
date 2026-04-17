/**
 * Responsabilidade: manter compatibilidade do import legacy do LoansModel.
 * Camada: model.
 * Entradas/Saidas: reexporta o model modular sem alterar API publica existente.
 * Dependencias criticas: models/library/loans/LoansModel.
 */

module.exports = require('./loans/LoansModel');