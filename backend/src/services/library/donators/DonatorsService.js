/**
 * Responsabilidade: orquestrar casos de uso unificados de doadores.
 * Camada: service.
 * Entradas/Saidas: expoe API publica para controllers de donators.
 * Dependencias criticas: coreDonatorService, filterDonatorService e csvDonatorService.
 */

const coreDonatorService = require('./modules/coreDonatorService');
const filterDonatorService = require('./modules/filterDonatorService');
const csvDonatorService = require('./modules/csvDonatorService');

class DonatorsService {}

Object.assign(
    DonatorsService.prototype,
    coreDonatorService,
    filterDonatorService,
    csvDonatorService
);

module.exports = new DonatorsService();
