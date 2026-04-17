/**
 * Responsabilidade: manter compatibilidade de import legado do controller de estante virtual.
 * Camada: controller.
 * Entradas/Saidas: reexporta o controller modular em controllers/library/virtualBookshelf.
 * Dependencias criticas: VirtualBookshelfController (novo).
 */

module.exports = require('./virtualBookshelf/VirtualBookshelfController');