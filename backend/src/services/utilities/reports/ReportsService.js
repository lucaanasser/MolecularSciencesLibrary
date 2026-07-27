/**
 * Responsabilidade: orquestrar os casos de uso de estatisticas e relatorios da biblioteca.
 * Camada: service.
 * Entradas/Saidas: expoe API publica (getLoansStatistics, getUsersStatistics, getBooksStatistics,
 *   getDonatorsStatistics, generateCompleteReport) para o ReportsController.
 * Dependencias criticas: modulos loansStatistics, usersStatistics, booksStatistics,
 *   donatorsStatistics e consolidatedReport.
 */

const loansStatistics = require('./modules/loansStatistics');
const usersStatistics = require('./modules/usersStatistics');
const booksStatistics = require('./modules/booksStatistics');
const donatorsStatistics = require('./modules/donatorsStatistics');
const consolidatedReport = require('./modules/consolidatedReport');

class ReportsService {}

Object.assign(
    ReportsService.prototype,
    loansStatistics,
    usersStatistics,
    booksStatistics,
    donatorsStatistics,
    consolidatedReport
);

module.exports = new ReportsService();
