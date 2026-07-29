/**
 * Responsabilidade: geracao dos PDFs de relatorio do acervo e de doadores.
 * Camada: service (utilities/pdfGenerator).
 * Entradas/Saidas: objeto literal mixado no prototipo; usa this.createDocument/addHeader/... e retorna Buffer do PDF.
 * Dependencias criticas: logger padronizado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Gera PDF de relatório do acervo
     */
    async generateBooksReportPDF(data) {
        log.start('Gerando PDF do acervo');

        const doc = this.createDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));

        this.addHeader(doc, 'Relatório do Acervo', 'Estado Atual da Biblioteca');

        // Cards de resumo
        const cardY = doc.y;
        this.addStatCard(doc, 'Total Livros', data.summary.total, 50, cardY, 95, this.colors.secondary);
        this.addStatCard(doc, 'Disponíveis', data.summary.available, 150, cardY, 95, this.colors.success);
        this.addStatCard(doc, 'Emprestados', data.summary.borrowed, 250, cardY, 95, this.colors.warning);
        this.addStatCard(doc, 'Reservados', data.summary.reserved, 350, cardY, 95, this.colors.primary);
        this.addStatCard(doc, 'Nunca Emp.', data.summary.neverBorrowed, 450, cardY, 95, this.colors.danger);

        doc.y = cardY + 70;

        // Taxa de circulação
        doc.fontSize(11)
           .fillColor(this.colors.dark)
           .font('Helvetica-Bold')
           .text(`Taxa de Circulação: ${data.summary.circulationRate}%`);
        doc.moveDown(0.5);

        // Livros por área
        if (data.booksByArea && data.booksByArea.length > 0) {
            this.addSection(doc, 'Livros por Área');
            this.addBarChart(doc, data.booksByArea.map(a => ({
                label: a.area,
                value: a.total
            })), { color: this.colors.primary });
        }

        // Livros mais emprestados
        if (data.mostBorrowed && data.mostBorrowed.length > 0) {
            this.addSection(doc, 'Livros Mais Emprestados');
            this.addTable(doc,
                ['Código', 'Título', 'Área', 'Empréstimos', 'Uso Int.'],
                data.mostBorrowed.slice(0, 15).map(b => [b.code, b.title?.substring(0, 30), b.area, b.loan_count, b.internal_use]),
                { columnWidths: [60, 180, 100, 80, 75] }
            );
        }

        // Livros mais usados internamente
        if (data.mostInternalUse && data.mostInternalUse.length > 0) {
            doc.addPage();
            this.addHeader(doc, 'Relatório do Acervo', 'Uso Interno');

            this.addSection(doc, 'Livros com Maior Uso Interno');
            this.addTable(doc,
                ['Código', 'Título', 'Área', 'Uso Interno'],
                data.mostInternalUse.map(b => [b.code, b.title?.substring(0, 35), b.area, b.internal_count]),
                { columnWidths: [70, 220, 120, 85] }
            );
        }

        this.addFooter(doc, 1);
        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                log.success('PDF do acervo gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    },

    /**
     * Gera PDF de relatório de doadores
     */
    async generateDonatorsReportPDF(data) {
        log.start('Gerando PDF de doadores');

        const doc = this.createDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));

        this.addHeader(doc, 'Relatório de Doadores',
            data.period.startDate && data.period.endDate
                ? `Período: ${new Date(data.period.startDate).toLocaleDateString('pt-BR')} a ${new Date(data.period.endDate).toLocaleDateString('pt-BR')}`
                : 'Histórico Completo'
        );

        // Cards de resumo
        const cardY = doc.y;
        this.addStatCard(doc, 'Total Doadores', data.summary.total, 50, cardY, 120, this.colors.secondary);
        this.addStatCard(doc, 'Livros Doados', data.summary.bookDonations, 175, cardY, 120, this.colors.success);
        this.addStatCard(doc, 'Doações Financ.', data.summary.moneyDonations, 300, cardY, 120, this.colors.warning);

        doc.y = cardY + 70;

        // Valor total
        doc.fontSize(14)
           .fillColor(this.colors.success)
           .font('Helvetica-Bold')
           .text(`Total em Doações Financeiras: R$ ${(data.summary.totalMoneyAmount || 0).toFixed(2)}`);
        doc.moveDown(1);

        // Tipos de doação
        this.addSection(doc, 'Tipos de Doação');
        this.addPieChartAsTable(doc, [
            { label: 'Doações de Livros', value: data.summary.bookDonations },
            { label: 'Doações Financeiras', value: data.summary.moneyDonations }
        ]);

        // Top doadores
        if (data.topDonators && data.topDonators.length > 0) {
            this.addSection(doc, 'Maiores Doadores');
            this.addTable(doc,
                ['Nome', 'Qtd. Doações', 'Livros', 'Valor (R$)'],
                data.topDonators.map(d => [
                    d.name?.substring(0, 35),
                    d.donation_count,
                    d.books_donated,
                    d.money_donated?.toFixed(2) || '0.00'
                ]),
                { columnWidths: [220, 90, 90, 95] }
            );
        }

        this.addFooter(doc, 1);
        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                log.success('PDF de doadores gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }
};
