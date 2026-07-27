/**
 * Responsabilidade: orquestrar a geracao de PDFs de relatorios (empréstimos, usuários, acervo, doadores e completo).
 * Camada: service (utilities/pdfGenerator).
 * Entradas/Saidas: expoe singleton com 13 metodos publicos usados por pdfHandlers; retorna Buffers de PDF.
 * Dependencias criticas: modulos de layout, primitivas de grafico e relatorios (mixados no prototipo via Object.assign);
 *   this.colors provem de pdfTheme e e compartilhado por todos os modulos.
 */

const COLORS = require('./modules/pdfTheme');
const documentLayout = require('./modules/documentLayout');
const chartPrimitives = require('./modules/chartPrimitives');
const loanUserReports = require('./modules/loanUserReports');
const acervoDonationReports = require('./modules/acervoDonationReports');
const completeReport = require('./modules/completeReport');

class PDFGeneratorService {
    constructor() {
        // Paleta compartilhada por todos os metodos mixados (usada como this.colors)
        this.colors = COLORS;
    }
}

// Mixin: todos os modulos compartilham a mesma instancia (this.colors / this.<siblingMethod>)
Object.assign(
    PDFGeneratorService.prototype,
    documentLayout,
    chartPrimitives,
    loanUserReports,
    acervoDonationReports,
    completeReport
);

module.exports = new PDFGeneratorService();
