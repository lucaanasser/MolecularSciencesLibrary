/**
 * Responsabilidade: manter compatibilidade de import legado do service de estante virtual.
 * Camada: service.
 * Entradas/Saidas: reexporta o service modular em services/library/virtualBookshelf.
 * Dependencias criticas: VirtualBookshelfService (novo).
 */

module.exports = require('./virtualBookshelf/VirtualBookshelfService');