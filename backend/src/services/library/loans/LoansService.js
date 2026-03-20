const loanBorrow = require('./modules/loanBorrow');
const loanReturn = require('./modules/loanReturn');
const loanQueries = require('./modules/loanQueries');
const loanRenew = require('./modules/loanRenew');
const loanExtension = require('./modules/loanExtension');

/**
 * Orquestrador de emprestimos.
 * Mantem a mesma interface publica usada por controllers e rotas,
 * delegando implementacoes para modulos de dominio.
 */
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