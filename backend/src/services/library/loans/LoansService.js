/**
 * Responsabilidade: orquestrar os modulos de negocio de emprestimos.
 * Camada: service.
 * Entradas/Saidas: expoe metodos publicos consumidos por controllers/scripts.
 * Dependencias criticas: modulos loanBorrow, loanReturn, loanQueries, loanRenew e loanExtension.
 */

const loanBorrow = require('./modules/loanBorrow');
const loanReturn = require('./modules/loanReturn');
const loanQueries = require('./modules/loanQueries');
const loanRenew = require('./modules/loanRenew');
const loanExtension = require('./modules/loanExtension');

class LoansService {}

Object.assign(
    LoansService.prototype,
    loanBorrow,
    loanReturn,
    loanQueries,
    loanRenew,
    loanExtension
);

module.exports = new LoansService();