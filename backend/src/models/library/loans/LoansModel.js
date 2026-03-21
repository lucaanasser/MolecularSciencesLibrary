/**
 * Responsabilidade: orquestrar modulos de persistencia do dominio de emprestimos.
 * Camada: model.
 * Entradas/Saidas: expoe API de acesso ao banco para leituras e escritas de loans.
 * Dependencias criticas: modulos loanReads, loanWrites e loanParser.
 */

const loanReads = require('./modules/loanReads');
const loanWrites = require('./modules/loanWrites');
const loanParser = require('./modules/loanParser');

class LoansModel {
    constructor() {
        this.bookFields = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
        this.bookSelect = this.bookFields.map((field) => `b.${field} AS book_${field}`).join(', ');
        this.userFields = ['id', 'role', 'name', 'NUSP', 'email', 'phone', 'class'];
        this.userSelect = this.userFields.map((field) => `u.${field} AS user_${field}`).join(', ');
    }
}

Object.assign(
    LoansModel.prototype,
    loanReads,
    loanWrites,
    loanParser
);

module.exports = new LoansModel();
