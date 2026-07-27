/**
 * Responsabilidade: primitivas de layout do documento PDF (documento base, cabecalho, rodape, secoes e cards).
 * Camada: service (utilities/pdfGenerator).
 * Entradas/Saidas: objeto literal mixado no prototipo; metodos usam this.colors e recebem o doc PDFKit.
 * Dependencias criticas: pdfkit (apenas em createDocument).
 */

const PDFDocument = require('pdfkit');

module.exports = {
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
    },

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
    },

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
    },

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
    },

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
};
