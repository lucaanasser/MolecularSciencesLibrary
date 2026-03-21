/**
 * Responsabilidade: manter compatibilidade de import legado das rotas de estante virtual.
 * Camada: routes.
 * Entradas/Saidas: reexporta rotas modulares em routes/library/virtualBookshelf.
 * Dependencias criticas: VirtualBookshelfRoutes (novo).
 */

module.exports = require('./virtualBookshelf/VirtualBookshelfRoutes');