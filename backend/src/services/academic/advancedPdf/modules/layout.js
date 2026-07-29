/**
 * Primitivas de layout (folha) do PDF avançado.
 *
 * Cada função recebe contexto explícito no lugar de `this`:
 *   fn(doc, ctx, ...args) onde ctx = { colors, page }.
 * Não dependem de outros módulos (evita dependência circular).
 */

/**
 * O que faz: formata um período com ano de início e fim em string legível.
 * Camada: Utilitário.
 * Entradas/Saídas: anoInicio, anoFim -> string formatada.
 * Dependências críticas: nenhuma.
 * Efeitos colaterais: nenhum.
 */
function formatPeriod(startYear, endYear) {
    if (!startYear && !endYear) return '';
    if (startYear && endYear) return `${startYear} – ${endYear}`;
    if (startYear) return `${startYear} – presente`;
    return `até ${endYear}`;
}

/**
 * O que faz: verifica se há espaço vertical suficiente na página atual;
 *            se não houver, adiciona uma nova página e restaura margens.
 * Camada: Layout.
 * Entradas/Saídas: doc, ctx, altura requerida -> void.
 * Dependências críticas: PDFKit.
 * Efeitos colaterais: pode adicionar páginas ao documento.
 */
function ensureSpace(doc, ctx, requiredHeight) {
    const bottomLimit = doc.page.height - 60; // margem para o footer
    if (doc.y + requiredHeight > bottomLimit) {
        doc.addPage();
        doc.y = 40;
        doc.x = ctx.page.contentLeft;
    }
}

/**
 * O que faz: renderiza o título de uma seção com linha decorativa verde
 *            e espaçamento padronizado.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx, texto -> void.
 * Dependências críticas: PDFKit.
 * Efeitos colaterais: avança o cursor do documento.
 */
function addSectionTitle(doc, ctx, title) {
    ensureSpace(doc, ctx, 36);

    const titleY = doc.y;

    // Ponto decorativo verde antes do título
    doc.circle(ctx.page.contentLeft + 4, titleY + 7, 3.5).fill(ctx.colors.accent);

    doc.fontSize(12)
        .fillColor(ctx.colors.text)
        .font('Helvetica-Bold')
        .text(title.toUpperCase(), ctx.page.contentLeft + 16, titleY, {
            characterSpacing: 0.8,
            width: ctx.page.contentWidth - 16
        });

    doc.moveDown(0.2);

    // Linha full-width abaixo do título
    doc.rect(ctx.page.contentLeft, doc.y, ctx.page.contentWidth, 1.5)
        .fill(ctx.colors.accent);

    doc.y += 12;
}

/**
 * O que faz: renderiza o rodapé de todas as páginas com nome da instituição,
 *            linha decorativa verde e número de páginas.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx -> void.
 * Dependências críticas: PDFKit (range de páginas).
 * Efeitos colaterais: percorre todas as páginas para aplicar o rodapé.
 */
function addFooter(doc, ctx) {
    const range = doc.bufferedPageRange();

    for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);

        const bottomY = doc.page.height - 32;

        // Linha decorativa superior do footer
        doc.rect(0, bottomY - 6, ctx.page.width, 2).fill(ctx.colors.accent);
        doc.rect(0, bottomY - 4, ctx.page.width, 1).fill(ctx.colors.accentSoft);

        // Fundo do footer
        doc.rect(0, bottomY - 6, ctx.page.width, 40).fill('#F9FAFB');

        // Texto da instituição
        doc.fontSize(7.5)
            .fillColor(ctx.colors.subtle)
            .font('Helvetica')
            .text(
                'Biblioteca Ciências Moleculares — Universidade de São Paulo',
                50,
                bottomY + 4,
                { width: 340, lineBreak: false }
            );

        // Numeração de página
        doc.fontSize(7.5)
            .fillColor(ctx.colors.accentDark)
            .font('Helvetica-Bold')
            .text(
                `${i + 1} / ${range.count}`,
                ctx.page.contentRight - 30,
                bottomY + 4,
                { width: 40, align: 'right', lineBreak: false }
            );
    }
}

module.exports = { formatPeriod, ensureSpace, addSectionTitle, addFooter };
