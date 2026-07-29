/**
 * Corpo principal do PDF avançado: orquestra o resumo do ciclo, a lista de
 * disciplinas e as experiências internacionais.
 *
 * Funções de módulo com contexto explícito no lugar de `this`:
 *   fn(doc, ctx, ...args) onde ctx = { colors, page }.
 */

const { addSectionTitle, ensureSpace, formatPeriod } = require('./layout');
const { addCycleSummary } = require('./cycleSummary');

/**
 * O que faz: organiza o conteúdo principal em layout de coluna única com
 *            blocos visuais para resumo, disciplinas e experiências.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx, dados do ciclo -> void.
 * Dependências críticas: PDFKit, funções de seção.
 * Efeitos colaterais: pode adicionar páginas ao documento.
 */
function addBodyContent(doc, ctx, cycle, disciplines, experiences) {
    addCycleSummary(doc, ctx, cycle);
    addDisciplines(doc, ctx, disciplines);
    addExperiences(doc, ctx, experiences);
}

/**
 * O que faz: renderiza a lista de disciplinas vinculadas ao ciclo,
 *            cada uma como um card com código, nome, professor, período
 *            e ementa, com separadores visuais entre itens.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx, array de disciplinas -> void.
 * Dependências críticas: PDFKit.
 * Efeitos colaterais: pode adicionar páginas ao documento.
 */
function addDisciplines(doc, ctx, disciplines) {
    if (!disciplines.length) {
        return;
    }

    addSectionTitle(doc, ctx, 'Disciplinas Vinculadas');

    disciplines.forEach((discipline, idx) => {
        const codigo = discipline.codigo || '-';
        const nome = discipline.nome || 'Sem nome';
        const professor = discipline.professor || '-';
        const periodo = `${discipline.ano || '-'} / ${discipline.semestre || '-'}`;
        const nota = discipline.nota || '-';
        const ementa = discipline.ementa
            || discipline.catalog?.ementa
            || '';

        ensureSpace(doc, ctx, 70);

        const itemStartY = doc.y;

        // Número do item (decorativo)
        doc.fontSize(20)
            .fillColor(ctx.colors.accentSoft)
            .font('Helvetica-Bold')
            .text(String(idx + 1).padStart(2, '0'), ctx.page.contentLeft, itemStartY - 2, {
                width: 30,
                lineBreak: false
            });

        const textX = ctx.page.contentLeft + 36;
        const textW = ctx.page.contentWidth - 36;

        // Código + Nome
        doc.fontSize(10)
            .fillColor(ctx.colors.text)
            .font('Helvetica-Bold')
            .text(`${codigo}`, textX, itemStartY, { continued: true, width: textW })
            .fillColor(ctx.colors.textMedium)
            .font('Helvetica')
            .text(`  —  ${nome}`);

        // Metadados da disciplina (linha de detalhes)
        doc.moveDown(0.15);
        const metaY = doc.y;

        // Badge de nota
        const notaLabel = `Nota: ${nota}`;
        const notaW = notaLabel.length * 5.2 + 10;
        doc.roundedRect(textX, metaY, notaW, 13, 2).fill(ctx.colors.accentSoft);
        doc.fontSize(7.5)
            .fillColor(ctx.colors.accentDark)
            .font('Helvetica-Bold')
            .text(notaLabel, textX + 5, metaY + 2, { lineBreak: false });

        doc.fontSize(8.5)
            .fillColor(ctx.colors.subtle)
            .font('Helvetica')
            .text(
                `  Prof. ${professor}  •  ${periodo}`,
                textX + notaW + 6,
                metaY + 2,
                { lineBreak: false }
            );

        doc.y = metaY + 16;

        // Ementa
        if (ementa && String(ementa).trim()) {
            doc.moveDown(0.3);
            doc.fontSize(8)
                .fillColor(ctx.colors.subtle)
                .font('Helvetica-Bold')
                .text('EMENTA', textX, doc.y, { characterSpacing: 0.5 });
            doc.moveDown(0.1);
            doc.fontSize(8.5)
                .fillColor(ctx.colors.textMedium)
                .font('Helvetica')
                .text(String(ementa).trim(), textX, doc.y, {
                    width: textW,
                    align: 'justify',
                    lineGap: 1.5
                });
        }

        // Linha separadora pontilhada entre disciplinas
        doc.moveDown(0.8);
        const sepY = doc.y;
        if (idx < disciplines.length - 1) {
            for (let x = ctx.page.contentLeft; x < ctx.page.contentRight; x += 6) {
                doc.rect(x, sepY, 3, 1).fill(ctx.colors.border);
            }
            doc.y = sepY + 10;
        }
    });

    doc.moveDown(0.8);
}

/**
 * O que faz: renderiza as experiências internacionais do estudante,
 *            cada uma com ícone decorativo, título, detalhes e descrição,
 *            em layout visual diferenciado dos demais blocos.
 * Camada: Apresentação.
 * Entradas/Saídas: doc, ctx, array de experiências -> void.
 * Dependências críticas: PDFKit.
 * Efeitos colaterais: pode adicionar páginas ao documento.
 */
function addExperiences(doc, ctx, experiences) {
    if (!experiences.length) {
        return;
    }

    addSectionTitle(doc, ctx, 'Experiências Internacionais');

    experiences.forEach((experience, idx) => {
        ensureSpace(doc, ctx, 60);

        const titulo = `${experience.tipo || 'Experiência'} — ${experience.instituicao || experience.pais || '-'}`;
        const periodo = formatPeriod(experience.anoInicio, experience.anoFim);
        const detalhes = [
            experience.programa ? `Programa: ${experience.programa}` : null,
            experience.orientador ? `Orientador: ${experience.orientador}` : null,
            experience.pais ? `País: ${experience.pais}` : null,
            periodo ? `Período: ${periodo}` : null
        ].filter(Boolean);

        const itemY = doc.y;

        // Marcador lateral colorido
        doc.rect(ctx.page.contentLeft, itemY, 3, 40).fill(ctx.colors.accentMid);

        const textX = ctx.page.contentLeft + 14;
        const textW = ctx.page.contentWidth - 14;

        // Título da experiência
        doc.fontSize(10)
            .fillColor(ctx.colors.text)
            .font('Helvetica-Bold')
            .text(titulo, textX, itemY, { width: textW });

        // Linha de detalhes
        if (detalhes.length) {
            doc.moveDown(0.2);
            doc.fontSize(8.5)
                .fillColor(ctx.colors.subtle)
                .font('Helvetica')
                .text(detalhes.join('  •  '), textX, doc.y, { width: textW });
        }

        // Descrição da experiência
        if (experience.descricao) {
            doc.moveDown(0.3);
            doc.fontSize(9)
                .fillColor(ctx.colors.textMedium)
                .font('Helvetica')
                .text(experience.descricao, textX, doc.y, {
                    width: textW,
                    align: 'justify',
                    lineGap: 1.5
                });
        }

        // Separador entre experiências
        doc.moveDown(0.8);
        if (idx < experiences.length - 1) {
            doc.strokeColor(ctx.colors.border)
                .lineWidth(0.5)
                .moveTo(ctx.page.contentLeft, doc.y)
                .lineTo(ctx.page.contentRight, doc.y)
                .stroke();
            doc.y += 10;
        }
    });

    doc.moveDown(0.8);
}

module.exports = { addBodyContent, addDisciplines, addExperiences };
