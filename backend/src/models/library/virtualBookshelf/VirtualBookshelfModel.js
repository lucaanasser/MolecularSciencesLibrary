/**
 * Responsabilidade: orquestrar operacoes de persistencia da estante virtual.
 * Camada: model.
 * Entradas/Saidas: expoe API publica para leitura e escrita da tabela virtual_bookshelf.
 * Dependencias criticas: queryVirtualBookshelfModel e writeVirtualBookshelfModel.
 */

const queryVirtualBookshelfModel = require('./modules/queryVirtualBookshelfModel');
const writeVirtualBookshelfModel = require('./modules/writeVirtualBookshelfModel');

class VirtualBookshelfModel {}

Object.assign(
    VirtualBookshelfModel.prototype,
    queryVirtualBookshelfModel,
    writeVirtualBookshelfModel
);

module.exports = new VirtualBookshelfModel();
