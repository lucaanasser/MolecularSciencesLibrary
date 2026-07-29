/**
 * Bloco de resumo do ciclo avançado do PDF.
 *
 * Função de módulo com contexto explícito no lugar de `this`:
 *   fn(doc, ctx, ...args) onde ctx = { colors, page }.
 */

const { addSectionTitle, ensureSpace } = require('./layout');

/**
 * O que faz: renderiza o bloco de resumo do ciclo avançado com campos
 *            chave-valor em layout de card com borda lateral colorida.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx, dados do ciclo -> void.
 * Dependências críticas: PDFKit.
 * Efeitos colaterais: pode adicionar páginas ao documento.
 */
function addCycleSummary(doc, ctx, cycle) {
    const fields = [
        ['Orientador', cycle?.orientador],
        ['Coorientadores', Array.isArray(cycle?.coorientadores) ? cycle.coorientadores.join(', ') : cycle?.coorientadores],
        ['Instituto', cycle?.instituto],
        ['Universidade', cycle?.universidade],
        ['Semestres', cycle?.semestres],
        ['Ano de início', cycle?.anoInicio],
        ['Ano de conclusão', cycle?.anoConclusao]
    ].filter(([, value]) => value !== undefined && value !== null && String(value).trim());

    const tags = Array.isArray(cycle?.tags)
        ? cycle.tags.map((tag) => tag.label).filter(Boolean)
        : [];

    const hasDescricao = Boolean(cycle?.descricao && String(cycle.descricao).trim());
    const hasAnyContent = fields.length || tags.length || hasDescricao;

    if (!hasAnyContent) {
        return;
    }

    addSectionTitle(doc, ctx, 'Resumo do Ciclo Avançado');

    // Card de campos com borda lateral esquerda verde
    const cardStartY = doc.y;
    const cardPad = 14;
    let fieldCursor = cardStartY + cardPad;

    fields.forEach(([label, value]) => {
        ensureSpace(doc, ctx, 18);
        const rowY = doc.y;

        // Label
        doc.fontSize(8.5)
            .fillColor(ctx.colors.subtle)
            .font('Helvetica-Bold')
            .text(label.toUpperCase(), ctx.page.contentLeft + cardPad + 8, rowY, {
                width: 110,
                characterSpacing: 0.4
            });

        // Valor
        doc.fontSize(9.5)
            .fillColor(ctx.colors.text)
            .font('Helvetica')
            .text(String(value).trim(), ctx.page.contentLeft + cardPad + 128, rowY, {
                width: ctx.page.contentWidth - 148
            });

        const afterY = doc.y;
        doc.y = Math.max(afterY, rowY + 14);
        fieldCursor = doc.y;
    });

    // Tags como badges inline
    if (tags.length) {
        ensureSpace(doc, ctx, 24);
        const rowY = doc.y;
        doc.fontSize(8.5)
            .fillColor(ctx.colors.subtle)
            .font('Helvetica-Bold')
            .text('ÁREAS', ctx.page.contentLeft + cardPad + 8, rowY, {
                width: 110,
                characterSpacing: 0.4
            });

        let tagX = ctx.page.contentLeft + cardPad + 128;
        tags.forEach((tag) => {
            const tagW = tag.length * 5 + 12;
            doc.roundedRect(tagX, rowY - 1, tagW, 13, 2).fill(ctx.colors.accentSoft);
            doc.fontSize(7.5)
                .fillColor(ctx.colors.accentDark)
                .font('Helvetica-Bold')
                .text(tag, tagX + 5, rowY + 1, { width: tagW - 6, lineBreak: false });
            tagX += tagW + 5;
        });

        doc.y = rowY + 18;
        fieldCursor = doc.y;
    }

    // Desenha o card de fundo e borda esquerda retroativamente
    const cardEndY = fieldCursor + cardPad;
    const cardH = cardEndY - cardStartY;
    doc.rect(ctx.page.contentLeft, cardStartY, ctx.page.contentWidth, cardH)
        .fill(ctx.colors.highlightBg);
    doc.rect(ctx.page.contentLeft, cardStartY, 3, cardH)
        .fill(ctx.colors.accent);

    // Re-renderiza os campos sobre o fundo (PDFKit não tem z-index, então redesenhamos)
    doc.y = cardStartY + cardPad;
    fields.forEach(([label, value]) => {
        const rowY = doc.y;
        doc.fontSize(8.5)
            .fillColor(ctx.colors.subtle)
            .font('Helvetica-Bold')
            .text(label.toUpperCase(), ctx.page.contentLeft + cardPad + 8, rowY, {
                width: 110,
                characterSpacing: 0.4
            });
        doc.fontSize(9.5)
            .fillColor(ctx.colors.text)
            .font('Helvetica')
            .text(String(value).trim(), ctx.page.contentLeft + cardPad + 128, rowY, {
                width: ctx.page.contentWidth - 148
            });
        const afterY = doc.y;
        doc.y = Math.max(afterY, rowY + 14);
    });

    if (tags.length) {
        const rowY = doc.y;
        doc.fontSize(8.5)
            .fillColor(ctx.colors.subtle)
            .font('Helvetica-Bold')
            .text('ÁREAS', ctx.page.contentLeft + cardPad + 8, rowY, {
                width: 110,
                characterSpacing: 0.4
            });
        let tagX = ctx.page.contentLeft + cardPad + 128;
        tags.forEach((tag) => {
            const tagW = tag.length * 5 + 12;
            doc.roundedRect(tagX, rowY - 1, tagW, 13, 2).fill(ctx.colors.accentSoft);
            doc.fontSize(7.5)
                .fillColor(ctx.colors.accentDark)
                .font('Helvetica-Bold')
                .text(tag, tagX + 5, rowY + 1, { width: tagW - 6, lineBreak: false });
            tagX += tagW + 5;
        });
        doc.y = rowY + 18;
    }

    doc.y = cardEndY + 20;

    // Bloco de descrição do projeto (fora do card, em destaque próprio)
    if (hasDescricao) {
        ensureSpace(doc, ctx, 80);
        doc.fontSize(10)
            .fillColor(ctx.colors.accentDark)
            .font('Helvetica-Bold')
            .text('Descrição do Projeto', ctx.page.contentLeft);
        doc.moveDown(0.3);
        doc.fontSize(9.5)
            .fillColor(ctx.colors.textMedium)
            .font('Helvetica')
            .text(String(cycle.descricao).trim(), ctx.page.contentLeft, doc.y, {
                width: ctx.page.contentWidth,
                align: 'justify',
                lineGap: 2
            });
        doc.moveDown(1.2);
    }
}

module.exports = { addCycleSummary };
