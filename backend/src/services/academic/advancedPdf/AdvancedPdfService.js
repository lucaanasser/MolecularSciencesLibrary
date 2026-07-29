const PDFDocument = require('pdfkit');
const { getLogger } = require('../../../shared/logging/logger');

const { COLORS, PAGE } = require('./modules/advancedPdfTheme');
const { addCoverHeader } = require('./modules/cover');
const { addBodyContent } = require('./modules/disciplinesExperiences');
const { addFooter } = require('./modules/layout');

const log = getLogger(__filename);

class AdvancedPdfService {
    constructor() {
        this.colors = COLORS;
        this.page = PAGE;
    }

    /**
     * O que faz: gera PDF profissional e visualmente rico de um ciclo avançado,
     *            com design alinhado à identidade visual do site Ciências Moleculares.
     * Camada: Service.
     * Entradas/Saídas: payload -> Buffer PDF.
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: nenhum.
     * @param {Object} payload
     * @returns {Promise<Buffer>}
     */
    async generateAdvancedPdf(payload) {
        const {
            studentName,
            turma,
            cycle,
            disciplines = [],
            experiences = []
        } = payload;

        log.start('Gerando PDF de ciclo avançado', {
            studentName,
            turma,
            cycleId: cycle?.id
        });

        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            info: {
                Title: 'Ciclo Avançado - Biblioteca CM',
                Author: 'Biblioteca Ciências Moleculares - USP',
                Creator: 'Biblioteca CM'
            }
        });

        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        const ctx = { colors: this.colors, page: this.page };

        addCoverHeader(doc, ctx, studentName, turma, cycle);
        addBodyContent(doc, ctx, cycle, disciplines, experiences);
        addFooter(doc, ctx);

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                log.success('PDF de ciclo avançado gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', (error) => {
                log.error('Falha ao gerar PDF de ciclo avançado', { error: error.message });
                reject(error);
            });
        });
    }
}

module.exports = new AdvancedPdfService();
