/**
 * Responsabilidade: manter compatibilidade de import legado do model de estante virtual.
 * Camada: model.
 * Entradas/Saidas: reexporta o model modular em models/library/virtualBookshelf.
 * Dependencias criticas: VirtualBookshelfModel (novo).
 */

module.exports = require('./virtualBookshelf/VirtualBookshelfModel');