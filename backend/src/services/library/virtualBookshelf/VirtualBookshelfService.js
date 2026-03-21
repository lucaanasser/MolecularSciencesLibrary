/**
 * Responsabilidade: orquestrar casos de uso da estante virtual.
 * Camada: service.
 * Entradas/Saidas: expoe API publica para controllers de VirtualBookshelf.
 * Dependencias criticas: codeRules, shelfConfig, bookQueries e shelfManagement.
 */

const codeRules = require('./modules/codeRules');
const shelfConfig = require('./modules/shelfConfig');
const bookQueries = require('./modules/bookQueries');
const shelfManagement = require('./modules/shelfManagement');

class VirtualBookshelfService {}

Object.assign(
    VirtualBookshelfService.prototype,
    codeRules,
    shelfConfig,
    bookQueries,
    shelfManagement
);

module.exports = new VirtualBookshelfService();
