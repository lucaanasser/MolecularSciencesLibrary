/**
 * Responsabilidade: geracao dos PDFs de relatorio de emprestimos e de usuarios.
 * Camada: service (utilities/pdfGenerator).
 * Entradas/Saidas: objeto literal mixado no prototipo; usa this.createDocument/addHeader/... e retorna Buffer do PDF.
 * Dependencias criticas: logger padronizado.
 */

const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Gera PDF de relatório de empréstimos
     */
    async generateLoansReportPDF(data) {
        log.start('Gerando PDF de empréstimos');

        const doc = this.createDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));

        // Header
        this.addHeader(doc, 'Relatório de Empréstimos',
            data.period.startDate && data.period.endDate
                ? `Período: ${new Date(data.period.startDate).toLocaleDateString('pt-BR')} a ${new Date(data.period.endDate).toLocaleDateString('pt-BR')}`
                : 'Histórico Completo'
        );

        // Cards de resumo
        const cardY = doc.y;
        this.addStatCard(doc, 'Total', data.summary.total, 50, cardY, 80, this.colors.secondary);
        this.addStatCard(doc, 'Ativos', data.summary.active, 135, cardY, 80, this.colors.success);
        this.addStatCard(doc, 'Devolvidos', data.summary.returned, 220, cardY, 80, this.colors.primary);
        this.addStatCard(doc, 'Atrasados', data.summary.overdue, 305, cardY, 80, this.colors.danger);
        this.addStatCard(doc, 'Uso Interno', data.summary.internalUse, 390, cardY, 80, this.colors.warning);
        this.addStatCard(doc, 'Externos', data.summary.external, 475, cardY, 70, this.colors.secondary);

        doc.y = cardY + 70;

        // Uso Interno vs Externo
        this.addSection(doc, 'Distribuição: Uso Interno vs Externo');
        this.addPieChartAsTable(doc, [
            { label: 'Uso Interno', value: data.summary.internalUse },
            { label: 'Empréstimos Externos', value: data.summary.external }
        ]);

        // Top Livros
        if (data.topBooks && data.topBooks.length > 0) {
            this.addSection(doc, 'Livros Mais Emprestados');
            this.addBarChart(doc, data.topBooks.map(b => ({
                label: b.title,
                value: b.loan_count
            })), { color: this.colors.secondary });
        }

        // Top Usuários
        if (data.topUsers && data.topUsers.length > 0) {
            doc.addPage();
            this.addHeader(doc, 'Relatório de Empréstimos', 'Usuários Mais Ativos');

            this.addSection(doc, 'Top 10 Usuários');
            this.addTable(doc,
                ['Nome', 'NUSP', 'Tipo', 'Empréstimos'],
                data.topUsers.map(u => [u.name, u.NUSP, u.role, u.loan_count]),
                { columnWidths: [200, 100, 80, 115] }
            );
        }

        // Empréstimos por mês
        if (data.loansByMonth && data.loansByMonth.length > 0) {
            this.addSection(doc, 'Empréstimos por Mês');
            this.addTable(doc,
                ['Mês', 'Total', 'Interno', 'Externo'],
                data.loansByMonth.map(m => [m.month, m.total, m.internal, m.external]),
                { columnWidths: [150, 115, 115, 115] }
            );
        }

        this.addFooter(doc, 1);
        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                log.success('PDF de empréstimos gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    },

    /**
     * Gera PDF de relatório de usuários
     */
    async generateUsersReportPDF(data) {
        log.start('Gerando PDF de usuários');

        const doc = this.createDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));

        this.addHeader(doc, 'Relatório de Usuários', 'Estatísticas de Usuários da Biblioteca');

        // Cards de resumo
        const cardY = doc.y;
        this.addStatCard(doc, 'Total', data.summary.total, 50, cardY, 120, this.colors.secondary);
        this.addStatCard(doc, 'Ativos', data.summary.active, 175, cardY, 120, this.colors.success);
        this.addStatCard(doc, 'Inativos', data.summary.inactive, 300, cardY, 120, this.colors.warning);
        this.addStatCard(doc, 'Com Atrasos', data.summary.withOverdue, 425, cardY, 120, this.colors.danger);

        doc.y = cardY + 70;

        // Usuários por tipo
        if (data.usersByRole && data.usersByRole.length > 0) {
            this.addSection(doc, 'Usuários por Tipo');
            this.addPieChartAsTable(doc, data.usersByRole.map(r => ({
                label: r.role || 'Não definido',
                value: r.total
            })));
        }

        // Top usuários
        if (data.topBorrowers && data.topBorrowers.length > 0) {
            this.addSection(doc, 'Usuários Mais Ativos');
            this.addTable(doc,
                ['Nome', 'NUSP', 'Tipo', 'Total Emp.', 'Ativos'],
                data.topBorrowers.slice(0, 10).map(u => [u.name, u.NUSP, u.role, u.total_loans, u.active_loans]),
                { columnWidths: [180, 80, 80, 80, 75] }
            );
        }

        this.addFooter(doc, 1);
        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                log.success('PDF de usuários gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }
};
