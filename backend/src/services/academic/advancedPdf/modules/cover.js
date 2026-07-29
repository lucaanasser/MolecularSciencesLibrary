/**
 * Cabeçalho de capa do PDF avançado.
 *
 * Funções de módulo com contexto explícito no lugar de `this`:
 *   fn(doc, ctx, ...args) onde ctx = { colors, page }.
 * Módulo autocontido (não depende de outros módulos do PDF avançado).
 */

/**
 * O que faz: desenha os quatro círculos coloridos que compõem o logo CM.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx, posição, raio -> void.
 * Dependências críticas: PDFKit.
 * Efeitos colaterais: nenhum.
 */
function drawLogoDots(doc, ctx, x, y, r) {
    const dots = [
        { cx: x, cy: y, color: ctx.colors.dotRed },
        { cx: x + r * 2.4, cy: y, color: ctx.colors.dotOrange },
        { cx: x + r * 4.8, cy: y, color: ctx.colors.dotYellow },
        { cx: x + r * 7.2, cy: y, color: ctx.colors.dotBlue }
    ];
    dots.forEach(({ cx, cy, color }) => {
        doc.circle(cx, cy, r).fill(color);
    });
}

/**
 * O que faz: desenha uma badge/tag arredondada com rótulo.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx, posição, texto, cores -> void (retorna largura usada).
 * Dependências críticas: PDFKit.
 * Efeitos colaterais: nenhum.
 */
function drawBadge(doc, ctx, x, y, label, bgColor, textColor) {
    const pad = { h: 6, v: 3 };
    const fontSize = 8;
    const textW = label.length * 5.2; // aproximação
    const badgeW = textW + pad.h * 2;
    const badgeH = fontSize + pad.v * 2;

    doc.roundedRect(x, y, badgeW, badgeH, 3).fill(bgColor);
    doc.fontSize(fontSize)
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text(label, x + pad.h, y + pad.v, { width: textW + 4, lineBreak: false });

    return badgeW;
}

/**
 * O que faz: renderiza o cabeçalho de capa com fundo escuro, logotipo,
 *            breadcrumb, título do ciclo e badge de turma.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx, metadados do estudante e ciclo -> void (mutação do doc).
 * Dependências críticas: PDFKit, cores internas.
 * Efeitos colaterais: avança o cursor do documento.
 */
function addCoverHeader(doc, ctx, studentName, turma, cycle) {
    const headerH = 210;

    // Fundo principal do header (verde escuro degradê simulado por camadas)
    doc.rect(0, 0, ctx.page.width, headerH)
        .fill('#0F4C2A');

    // Faixa de textura sutil (linha de gradiente simulada)
    doc.rect(0, 0, ctx.page.width, 4)
        .fill(ctx.colors.accentMid);

    // Dots decorativos (referência ao logo CM) no canto superior direito
    drawLogoDots(doc, ctx, 480, 18, 5);

    // Nome do curso (breadcrumb leve)
    doc.fontSize(7.5)
        .fillColor('#86EFAC')
        .font('Helvetica')
        .text('CIÊNCIAS MOLECULARES  •  USP  •  BIBLIOTECA CM', 50, 30, {
            characterSpacing: 1
        });

    // Título principal
    const titulo = cycle?.tema || cycle?.descricao || 'Ciclo Avançado';
    doc.fontSize(22)
        .fillColor(ctx.colors.white)
        .font('Helvetica-Bold')
        .text('Projeto de Avançado', 50, 52, { width: 430 });

    // Subtítulo do ciclo
    doc.fontSize(12)
        .fillColor('#BBF7D0')
        .font('Helvetica')
        .text(titulo, 50, 82, { width: 430 });

    // Linha separadora fina
    doc.rect(50, 108, 200, 1.5)
        .fill(ctx.colors.accentMid);

    // Badge de turma (pastilha verde vibrante)
    drawBadge(doc, ctx, 50, 120, turma ? `Turma ${turma}` : 'Turma —', '#16A34A', '#FFFFFF');

    // Nome do estudante (destaque)
    doc.fontSize(14)
        .fillColor(ctx.colors.white)
        .font('Helvetica-Bold')
        .text(studentName || '—', 50, 148, { width: 400 });

    // Data de geração
    doc.fontSize(8)
        .fillColor('#86EFAC')
        .font('Helvetica')
        .text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 50, 168);

    // Faixa inferior do header (transição para o corpo)
    doc.rect(0, headerH - 12, ctx.page.width, 12)
        .fill('#16A34A');

    // Reset do cursor para abaixo do header
    doc.y = headerH + 24;
    doc.x = ctx.page.contentLeft;
}

module.exports = { addCoverHeader, drawLogoDots, drawBadge };
