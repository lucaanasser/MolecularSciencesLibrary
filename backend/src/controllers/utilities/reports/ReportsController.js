/**
 * Responsabilidade: orquestrador unico de controller para relatorios da biblioteca.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas e delega aos handlers de estatisticas/PDF.
 * Dependencias criticas: statisticsHandlers e pdfHandlers.
 */

const statisticsHandlers = require('./handlers/statisticsHandlers');
const pdfHandlers = require('./handlers/pdfHandlers');

class ReportsController {}

Object.assign(
    ReportsController.prototype,
    statisticsHandlers,
    pdfHandlers
);

module.exports = new ReportsController();
