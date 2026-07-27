/**
 * Responsabilidade: geracao do PDF de relatorio geral completo (capa, indice, resumo e secoes).
 * Camada: service (utilities/pdfGenerator). Usa this.createDocument/addHeader/... e retorna Buffer.
 * Dependencias criticas: logger padronizado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Gera PDF completo com todos os relatórios
     */
    async generateCompleteReportPDF(data) {
        log.start('Gerando PDF completo');

        const doc = this.createDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));

        // ============ CAPA ============
        doc.moveDown(5);
        doc.fontSize(32)
           .fillColor(this.colors.primary)
           .font('Helvetica-Bold')
           .text('Biblioteca', { align: 'center' });
        doc.fontSize(28)
           .text('Ciências Moleculares', { align: 'center' });

        doc.moveDown(2);
        doc.fontSize(20)
           .fillColor(this.colors.secondary)
           .text('Relatório Geral Completo', { align: 'center' });

        doc.moveDown(4);
        doc.fontSize(12)
           .fillColor(this.colors.text)
           .font('Helvetica')
           .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });

        doc.moveDown(1);
        doc.text('Universidade de São Paulo', { align: 'center' });

        // ============ PÁGINA 2: ÍNDICE ============
        doc.addPage();
        this.addHeader(doc, 'Índice', 'Conteúdo do Relatório');

        const indexItems = [
            '1. Resumo Executivo',
            '2. Estatísticas de Empréstimos',
            '3. Estatísticas de Usuários',
            '4. Estatísticas do Acervo',
            '5. Estatísticas de Doações',
            '6. Lista de Empréstimos Ativos',
            '7. Lista Completa do Acervo'
        ];
        indexItems.forEach((item, i) => {
            doc.fontSize(12)
               .fillColor(this.colors.text)
               .text(item);
            doc.moveDown(0.5);
        });
        // ============ PÁGINA 3: RESUMO EXECUTIVO ============
        doc.addPage();
        this.addHeader(doc, 'Resumo Executivo', 'Visão Geral da Biblioteca');

        const stats = data.statistics;

        // Grid de estatísticas principais
        doc.moveDown(1);
        const summaryY = doc.y;

        // Acervo
        doc.fontSize(14).fillColor(this.colors.primary).font('Helvetica-Bold').text('📚 Acervo');
        doc.fontSize(11).fillColor(this.colors.text).font('Helvetica');
        doc.text(`Total de Livros: ${stats.books.summary.total}`);
        doc.text(`Disponíveis: ${stats.books.summary.available}`);
        doc.text(`Emprestados: ${stats.books.summary.borrowed}`);
        doc.text(`Taxa de Circulação: ${stats.books.summary.circulationRate}%`);

        doc.moveDown(1);

        // Usuários
        doc.fontSize(14).fillColor(this.colors.secondary).font('Helvetica-Bold').text('👥 Usuários');
        doc.fontSize(11).fillColor(this.colors.text).font('Helvetica');
        doc.text(`Total de Usuários: ${stats.users.summary.total}`);
        doc.text(`Usuários Ativos: ${stats.users.summary.active}`);
        doc.text(`Com Empréstimos Atrasados: ${stats.users.summary.withOverdue}`);

        doc.moveDown(1);

        // Empréstimos
        doc.fontSize(14).fillColor(this.colors.success).font('Helvetica-Bold').text('📖 Empréstimos');
        doc.fontSize(11).fillColor(this.colors.text).font('Helvetica');
        doc.text(`Total de Empréstimos: ${stats.loans.summary.total}`);
        doc.text(`Empréstimos Ativos: ${stats.loans.summary.active}`);
        doc.text(`Uso Interno: ${stats.loans.summary.internalUse}`);
        doc.text(`Empréstimos Externos: ${stats.loans.summary.external}`);
        doc.text(`Atrasados: ${stats.loans.summary.overdue}`);

        doc.moveDown(1);

        // Doações
        doc.fontSize(14).fillColor(this.colors.warning).font('Helvetica-Bold').text('🎁 Doações');
        doc.fontSize(11).fillColor(this.colors.text).font('Helvetica');
        doc.text(`Total de Doadores: ${stats.donators.summary.total}`);
        doc.text(`Livros Doados: ${stats.donators.summary.bookDonations}`);
        doc.text(`Doações Financeiras: R$ ${(stats.donators.summary.totalMoneyAmount || 0).toFixed(2)}`);

        // ============ PÁGINA 4: EMPRÉSTIMOS ============
        doc.addPage();
        this.addHeader(doc, 'Estatísticas de Empréstimos', 'Análise de Empréstimos');

        const cardY2 = doc.y;
        this.addStatCard(doc, 'Total', stats.loans.summary.total, 50, cardY2, 80, this.colors.secondary);
        this.addStatCard(doc, 'Ativos', stats.loans.summary.active, 135, cardY2, 80, this.colors.success);
        this.addStatCard(doc, 'Devolvidos', stats.loans.summary.returned, 220, cardY2, 80, this.colors.primary);
        this.addStatCard(doc, 'Atrasados', stats.loans.summary.overdue, 305, cardY2, 80, this.colors.danger);
        this.addStatCard(doc, 'Uso Interno', stats.loans.summary.internalUse, 390, cardY2, 80, this.colors.warning);
        doc.y = cardY2 + 70;

        if (stats.loans.topBooks && stats.loans.topBooks.length > 0) {
            this.addSection(doc, 'Top 10 Livros Mais Emprestados');
            this.addTable(doc,
                ['Código', 'Título', 'Autores', 'Empréstimos'],
                stats.loans.topBooks.map(b => [b.code, b.title?.substring(0, 25), b.authors?.substring(0, 20), b.loan_count]),
                { columnWidths: [60, 180, 150, 105] }
            );
        }

        // ============ PÁGINA 5: USUÁRIOS ============
        doc.addPage();
        this.addHeader(doc, 'Estatísticas de Usuários', 'Análise de Usuários');

        if (stats.users.usersByRole && stats.users.usersByRole.length > 0) {
            this.addSection(doc, 'Usuários por Tipo');
            this.addPieChartAsTable(doc, stats.users.usersByRole.map(r => ({
                label: r.role || 'Não definido',
                value: r.total
            })));
        }

        if (stats.users.topBorrowers && stats.users.topBorrowers.length > 0) {
            this.addSection(doc, 'Usuários Mais Ativos');
            this.addTable(doc,
                ['Nome', 'NUSP', 'Tipo', 'Total Emp.', 'Ativos'],
                stats.users.topBorrowers.slice(0, 10).map(u => [u.name, u.NUSP, u.role, u.total_loans, u.active_loans]),
                { columnWidths: [180, 80, 80, 80, 75] }
            );
        }

        // ============ PÁGINA 6: ACERVO ============
        doc.addPage();
        this.addHeader(doc, 'Estatísticas do Acervo', 'Estado Atual');

        if (stats.books.booksByArea && stats.books.booksByArea.length > 0) {
            this.addSection(doc, 'Livros por Área');
            this.addBarChart(doc, stats.books.booksByArea.map(a => ({
                label: a.area,
                value: a.total
            })), { color: this.colors.primary });
        }

        // ============ PÁGINA 7: DOADORES ============
        doc.addPage();
        this.addHeader(doc, 'Estatísticas de Doações', 'Histórico de Doações');

        const cardY3 = doc.y;
        this.addStatCard(doc, 'Total Doadores', stats.donators.summary.totalDonators || 0, 50, cardY3, 150, this.colors.secondary);
        this.addStatCard(doc, 'Livros Doados', stats.donators.summary.bookDonations || 0, 210, cardY3, 150, this.colors.success);
        this.addStatCard(doc, 'Doações Financ.', stats.donators.summary.monetaryDonations || 0, 370, cardY3, 150, this.colors.warning);
        doc.y = cardY3 + 70;

        doc.fontSize(14)
           .fillColor(this.colors.success)
           .font('Helvetica-Bold')
           .text(`Total em Doações Financeiras: R$ ${(stats.donators.summary.totalMonetaryValue || 0).toFixed(2)}`);

        if (stats.donators.topDonators && stats.donators.topDonators.length > 0) {
            doc.moveDown(1);
            this.addSection(doc, 'Maiores Doadores');
            this.addTable(doc,
                ['Nome', 'Doações', 'Livros', 'Valor (R$)'],
                stats.donators.topDonators.map(d => [d.name?.substring(0, 35) || '-', d.total_donations || 0, d.books_donated || 0, (d.monetary_donated || 0).toFixed(2)]),
                { columnWidths: [220, 90, 90, 95] }
            );
        }

        // ============ PÁGINA 8: EMPRÉSTIMOS ATIVOS ============
        if (data.details.activeLoans && data.details.activeLoans.length > 0) {
            doc.addPage();
            this.addHeader(doc, 'Empréstimos Ativos', `${data.details.activeLoans.length} empréstimos em aberto`);

            this.addTable(doc,
                ['Livro', 'Usuário', 'NUSP', 'Data Emp.', 'Vencimento'],
                data.details.activeLoans.slice(0, 50).map(l => [
                    l.title?.substring(0, 25),
                    l.user_name?.substring(0, 20) || 'Uso Interno',
                    l.NUSP || '-',
                    new Date(l.borrowed_at).toLocaleDateString('pt-BR'),
                    new Date(l.due_date).toLocaleDateString('pt-BR')
                ]),
                { columnWidths: [140, 130, 70, 80, 75] }
            );
        }

        this.addFooter(doc, 1);
        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                log.success('PDF completo gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }
};
