/**
 * Service responsável pela geração de PDFs com relatórios.
 * Usa PDFKit para geração de documentos PDF com tabelas e gráficos.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const PDFDocument = require('pdfkit');
const path = require('path');

class PDFGeneratorService {
    constructor() {
        this.colors = {
            primary: '#6B21A8',      // library-purple
            secondary: '#1E40AF',    // cm-blue
            success: '#16A34A',      // cm-green
            warning: '#F59E0B',      // cm-yellow/orange
            danger: '#DC2626',       // cm-red
            dark: '#1F2937',
            light: '#F3F4F6',
            text: '#374151'
        };
    }

    /**
     * Cria documento PDF base com cabeçalho e configurações
     */
    createDocument() {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            info: {
                Title: 'Relatório da Biblioteca',
                Author: 'Biblioteca Ciências Moleculares - USP',
                Creator: 'Sistema de Gestão da Biblioteca'
            }
        });

        return doc;
    }

    /**
     * Adiciona cabeçalho ao documento
     */
    addHeader(doc, title, subtitle = null) {
        // Título principal
        doc.fontSize(24)
           .fillColor(this.colors.primary)
           .font('Helvetica-Bold')
           .text(title, { align: 'center' });
        
        if (subtitle) {
            doc.moveDown(0.3)
               .fontSize(12)
               .fillColor(this.colors.text)
               .font('Helvetica')
               .text(subtitle, { align: 'center' });
        }

        // Linha decorativa
        doc.moveDown(0.5)
           .strokeColor(this.colors.primary)
           .lineWidth(2)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();

        doc.moveDown(1);
    }

    /**
     * Adiciona rodapé com paginação
     */
    addFooter(doc, pageNum, totalPages = null) {
        const bottomY = doc.page.height - 40;
        
        doc.fontSize(8)
           .fillColor(this.colors.text)
           .text(
               `Biblioteca Ciências Moleculares - USP | Gerado em: ${new Date().toLocaleString('pt-BR')}`,
               50, bottomY,
               { align: 'left', width: 300 }
           );
        
        if (totalPages) {
            doc.text(
                `Página ${pageNum} de ${totalPages}`,
                400, bottomY,
                { align: 'right', width: 145 }
            );
        }
    }

    /**
     * Adiciona seção com título
     */
    addSection(doc, title) {
        doc.moveDown(0.5)
           .fontSize(16)
           .fillColor(this.colors.secondary)
           .font('Helvetica-Bold')
           .text(title);
        
        doc.moveDown(0.3)
           .strokeColor(this.colors.light)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();
        
        doc.moveDown(0.5)
           .fillColor(this.colors.text)
           .font('Helvetica');
    }

    /**
     * Adiciona card de estatística
     */
    addStatCard(doc, label, value, x, y, width = 120, color = null) {
        const cardColor = color || this.colors.primary;
        
        // Background
        doc.rect(x, y, width, 50)
           .fillColor('#F9FAFB')
           .fill();
        
        // Borda esquerda colorida
        doc.rect(x, y, 4, 50)
           .fillColor(cardColor)
           .fill();
        
        // Valor
        doc.fontSize(18)
           .fillColor(cardColor)
           .font('Helvetica-Bold')
           .text(value.toString(), x + 10, y + 8, { width: width - 20 });
        
        // Label
        doc.fontSize(9)
           .fillColor(this.colors.text)
           .font('Helvetica')
           .text(label, x + 10, y + 32, { width: width - 20 });
    }

    /**
     * Adiciona tabela simples
     */
    addTable(doc, headers, rows, options = {}) {
        const { 
            columnWidths = null, 
            startY = doc.y,
            headerColor = this.colors.secondary,
            alternateRows = true
        } = options;

        const tableWidth = 495;
        const colCount = headers.length;
        const defaultColWidth = tableWidth / colCount;
        const widths = columnWidths || headers.map(() => defaultColWidth);
        
        let currentY = startY;
        const rowHeight = 20;
        const padding = 5;

        // Verificar se precisa nova página
        const checkNewPage = () => {
            if (currentY + rowHeight > doc.page.height - 80) {
                doc.addPage();
                currentY = 50;
                return true;
            }
            return false;
        };

        // Header
        doc.rect(50, currentY, tableWidth, rowHeight)
           .fillColor(headerColor)
           .fill();

        let currentX = 50;
        headers.forEach((header, i) => {
            doc.fontSize(9)
               .fillColor('#FFFFFF')
               .font('Helvetica-Bold')
               .text(header, currentX + padding, currentY + 5, { 
                   width: widths[i] - padding * 2,
                   lineBreak: false
               });
            currentX += widths[i];
        });

        currentY += rowHeight;

        // Rows
        rows.forEach((row, rowIndex) => {
            checkNewPage();

            // Alternating background
            if (alternateRows && rowIndex % 2 === 0) {
                doc.rect(50, currentY, tableWidth, rowHeight)
                   .fillColor('#F9FAFB')
                   .fill();
            }

            currentX = 50;
            row.forEach((cell, i) => {
                const cellValue = cell !== null && cell !== undefined ? cell.toString() : '-';
                doc.fontSize(8)
                   .fillColor(this.colors.text)
                   .font('Helvetica')
                   .text(cellValue, currentX + padding, currentY + 5, { 
                       width: widths[i] - padding * 2,
                       lineBreak: false
                   });
                currentX += widths[i];
            });

            currentY += rowHeight;
        });

        // Borda da tabela
        doc.rect(50, startY, tableWidth, currentY - startY)
           .strokeColor(this.colors.light)
           .stroke();

        doc.y = currentY + 10;
    }

    /**
     * Adiciona gráfico de barras simples (horizontal)
     */
    addBarChart(doc, data, options = {}) {
        const {
            x = 50,
            y = doc.y,
            width = 495,
            barHeight = 20,
            maxBars = 10,
            color = this.colors.primary
        } = options;

        const displayData = data.slice(0, maxBars);
        const maxValue = Math.max(...displayData.map(d => d.value));
        const barWidth = width - 150; // Espaço para labels
        
        let currentY = y;

        displayData.forEach((item, index) => {
            // Label
            doc.fontSize(8)
               .fillColor(this.colors.text)
               .font('Helvetica')
               .text(item.label.substring(0, 25), x, currentY + 4, { 
                   width: 140,
                   lineBreak: false
               });

            // Barra
            const barLength = maxValue > 0 ? (item.value / maxValue) * barWidth : 0;
            doc.rect(x + 145, currentY + 2, barLength, barHeight - 6)
               .fillColor(color)
               .fill();

            // Valor
            doc.fontSize(8)
               .fillColor(this.colors.dark)
               .font('Helvetica-Bold')
               .text(item.value.toString(), x + 150 + barLength, currentY + 4);

            currentY += barHeight;
        });

        doc.y = currentY + 10;
    }

    /**
     * Adiciona gráfico de pizza simples (representação tabular)
     */
    addPieChartAsTable(doc, data, title = null) {
        if (title) {
            doc.fontSize(11)
               .fillColor(this.colors.dark)
               .font('Helvetica-Bold')
               .text(title);
            doc.moveDown(0.3);
        }

        const total = data.reduce((sum, d) => sum + d.value, 0);
        const colors = [
            this.colors.primary,
            this.colors.secondary,
            this.colors.success,
            this.colors.warning,
            this.colors.danger,
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'
        ];

        let currentY = doc.y;
        
        data.forEach((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            const color = colors[index % colors.length];

            // Bolinha de cor
            doc.circle(60, currentY + 6, 5)
               .fillColor(color)
               .fill();

            // Label e valor
            doc.fontSize(9)
               .fillColor(this.colors.text)
               .font('Helvetica')
               .text(`${item.label}: ${item.value} (${percentage}%)`, 75, currentY + 2);

            currentY += 18;
        });

        doc.y = currentY + 10;
    }

    /**
     * Gera PDF de relatório de empréstimos
     */
    async generateLoansReportPDF(data) {
        console.log('🔵 [PDFGeneratorService] Gerando PDF de empréstimos');
        
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
                console.log('🟢 [PDFGeneratorService] PDF de empréstimos gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }

    /**
     * Gera PDF de relatório de usuários
     */
    async generateUsersReportPDF(data) {
        console.log('🔵 [PDFGeneratorService] Gerando PDF de usuários');
        
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
                console.log('🟢 [PDFGeneratorService] PDF de usuários gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }

    /**
     * Gera PDF de relatório do acervo
     */
    async generateBooksReportPDF(data) {
        console.log('🔵 [PDFGeneratorService] Gerando PDF do acervo');
        
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
                console.log('🟢 [PDFGeneratorService] PDF do acervo gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }

    /**
     * Gera PDF de relatório de doadores
     */
    async generateDonatorsReportPDF(data) {
        console.log('🔵 [PDFGeneratorService] Gerando PDF de doadores');
        
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
                console.log('🟢 [PDFGeneratorService] PDF de doadores gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }

    /**
     * Gera PDF completo com todos os relatórios
     */
    async generateCompleteReportPDF(data) {
        console.log('🔵 [PDFGeneratorService] Gerando PDF completo');
        
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
                console.log('🟢 [PDFGeneratorService] PDF completo gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });
    }
}

module.exports = new PDFGeneratorService();
