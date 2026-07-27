/**
 * Responsabilidade: primitivas de visualizacao (tabela, grafico de barras e "pizza" tabular) dos PDFs.
 * Camada: service (utilities/pdfGenerator).
 * Entradas/Saidas: objeto literal mixado no prototipo; metodos usam this.colors e recebem o doc PDFKit.
 * Dependencias criticas: nenhuma (desenho puro via PDFKit ja instanciado).
 */

module.exports = {
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
    },

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
    },

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
};
