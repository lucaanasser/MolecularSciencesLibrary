const PDFDocument = require('pdfkit');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

class AdvancedPdfService {
    constructor() {
        this.colors = {
            // Paleta principal inspirada no site Ciências Moleculares
            white: '#FFFFFF',
            pageBg: '#F9FAFB',
            text: '#111827',
            textMedium: '#374151',
            subtle: '#6B7280',
            subtleLight: '#9CA3AF',
            border: '#E5E7EB',
            borderLight: '#F3F4F6',

            // Verde principal (identidade CM)
            accent: '#16A34A',
            accentDark: '#15803D',
            accentMid: '#22C55E',
            accentSoft: '#DCFCE7',
            accentPale: '#F0FDF4',

            // Cores auxiliares para dots decorativos (logo CM)
            dotRed: '#EF4444',
            dotOrange: '#F97316',
            dotYellow: '#EAB308',
            dotBlue: '#3B82F6',

            // Sidebar e blocos
            sidebarBg: '#F0FDF4',
            sidebarBorder: '#BBF7D0',
            tagBg: '#16A34A',
            tagText: '#FFFFFF',
            cardBg: '#FFFFFF',
            highlightBg: '#F0FDF4'
        };

        // Dimensões da página A4
        this.page = {
            width: 595,
            height: 842,
            margin: { top: 0, bottom: 40, left: 0, right: 0 },
            contentLeft: 50,
            contentRight: 545,
            contentWidth: 495,

            // Layout de duas colunas (corpo + sidebar)
            mainLeft: 50,
            mainWidth: 330,
            sideLeft: 410,
            sideWidth: 135
        };
    }

    /**
     * O que faz: gera PDF profissional e visualmente rico de um ciclo avançado,
     *            com design alinhado à identidade visual do site Ciências Moleculares.
     * Camada: Service.
     * Entradas/Saídas: payload -> Buffer PDF.
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: nenhum.
     * @param {Object} payload
     * @returns {Promise<Buffer>}
     */
    async generateAdvancedPdf(payload) {
        const {
            studentName,
            turma,
            cycle,
            disciplines = [],
            experiences = []
        } = payload;

        log.start('Gerando PDF de ciclo avançado', {
            studentName,
            turma,
            cycleId: cycle?.id
        });

        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            info: {
                Title: 'Ciclo Avançado - Biblioteca CM',
                Author: 'Biblioteca Ciências Moleculares - USP',
                Creator: 'Biblioteca CM'
            }
        });

        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        this.#addCoverHeader(doc, studentName, turma, cycle);
        this.#addBodyContent(doc, cycle, disciplines, experiences);
        this.#addFooter(doc);

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                log.success('PDF de ciclo avançado gerado');
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', (error) => {
                log.error('Falha ao gerar PDF de ciclo avançado', { error: error.message });
                reject(error);
            });
        });
    }

    // ─────────────────────────────────────────────
    // SEÇÃO: COVER HEADER
    // ─────────────────────────────────────────────

    /**
     * O que faz: renderiza o cabeçalho de capa com fundo escuro, logotipo,
     *            breadcrumb, título do ciclo e badge de turma.
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc, metadados do estudante e ciclo -> void (mutação do doc).
     * Dependências críticas: PDFKit, cores internas.
     * Efeitos colaterais: avança o cursor do documento.
     */
    #addCoverHeader(doc, studentName, turma, cycle) {
        const headerH = 210;

        // Fundo principal do header (verde escuro degradê simulado por camadas)
        doc.rect(0, 0, this.page.width, headerH)
            .fill('#0F4C2A');

        // Faixa de textura sutil (linha de gradiente simulada)
        doc.rect(0, 0, this.page.width, 4)
            .fill(this.colors.accentMid);

        // Dots decorativos (referência ao logo CM) no canto superior direito
        this.#drawLogoDots(doc, 480, 18, 5);

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
            .fillColor(this.colors.white)
            .font('Helvetica-Bold')
            .text('Projeto de Avançado', 50, 52, { width: 430 });

        // Subtítulo do ciclo
        doc.fontSize(12)
            .fillColor('#BBF7D0')
            .font('Helvetica')
            .text(titulo, 50, 82, { width: 430 });

        // Linha separadora fina
        doc.rect(50, 108, 200, 1.5)
            .fill(this.colors.accentMid);

        // Badge de turma (pastilha verde vibrante)
        this.#drawBadge(doc, 50, 120, turma ? `Turma ${turma}` : 'Turma —', '#16A34A', '#FFFFFF');

        // Nome do estudante (destaque)
        doc.fontSize(14)
            .fillColor(this.colors.white)
            .font('Helvetica-Bold')
            .text(studentName || '—', 50, 148, { width: 400 });

        // Data de geração
        doc.fontSize(8)
            .fillColor('#86EFAC')
            .font('Helvetica')
            .text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 50, 168);

        // Faixa inferior do header (transição para o corpo)
        doc.rect(0, headerH - 12, this.page.width, 12)
            .fill('#16A34A');

        // Reset do cursor para abaixo do header
        doc.y = headerH + 24;
        doc.x = this.page.contentLeft;
    }

    /**
     * O que faz: desenha os quatro círculos coloridos que compõem o logo CM.
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc, posição, raio -> void.
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: nenhum.
     */
    #drawLogoDots(doc, x, y, r) {
        const dots = [
            { cx: x, cy: y, color: this.colors.dotRed },
            { cx: x + r * 2.4, cy: y, color: this.colors.dotOrange },
            { cx: x + r * 4.8, cy: y, color: this.colors.dotYellow },
            { cx: x + r * 7.2, cy: y, color: this.colors.dotBlue }
        ];
        dots.forEach(({ cx, cy, color }) => {
            doc.circle(cx, cy, r).fill(color);
        });
    }

    /**
     * O que faz: desenha uma badge/tag arredondada com rótulo.
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc, posição, texto, cores -> void (retorna largura usada).
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: nenhum.
     */
    #drawBadge(doc, x, y, label, bgColor, textColor) {
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

    // ─────────────────────────────────────────────
    // SEÇÃO: CORPO PRINCIPAL
    // ─────────────────────────────────────────────

    /**
     * O que faz: organiza o conteúdo principal em layout de coluna única com
     *            blocos visuais para resumo, disciplinas e experiências.
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc, dados do ciclo -> void.
     * Dependências críticas: PDFKit, métodos privados de seção.
     * Efeitos colaterais: pode adicionar páginas ao documento.
     */
    #addBodyContent(doc, cycle, disciplines, experiences) {
        this.#addCycleSummary(doc, cycle);
        this.#addDisciplines(doc, disciplines);
        this.#addExperiences(doc, experiences);
    }

    /**
     * O que faz: renderiza o bloco de resumo do ciclo avançado com campos
     *            chave-valor em layout de card com borda lateral colorida.
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc, dados do ciclo -> void.
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: pode adicionar páginas ao documento.
     */
    #addCycleSummary(doc, cycle) {
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

        this.#addSectionTitle(doc, 'Resumo do Ciclo Avançado');

        // Card de campos com borda lateral esquerda verde
        const cardStartY = doc.y;
        const cardPad = 14;
        let fieldCursor = cardStartY + cardPad;

        fields.forEach(([label, value]) => {
            this.#ensureSpace(doc, 18);
            const rowY = doc.y;

            // Label
            doc.fontSize(8.5)
                .fillColor(this.colors.subtle)
                .font('Helvetica-Bold')
                .text(label.toUpperCase(), this.page.contentLeft + cardPad + 8, rowY, {
                    width: 110,
                    characterSpacing: 0.4
                });

            // Valor
            doc.fontSize(9.5)
                .fillColor(this.colors.text)
                .font('Helvetica')
                .text(String(value).trim(), this.page.contentLeft + cardPad + 128, rowY, {
                    width: this.page.contentWidth - 148
                });

            const afterY = doc.y;
            doc.y = Math.max(afterY, rowY + 14);
            fieldCursor = doc.y;
        });

        // Tags como badges inline
        if (tags.length) {
            this.#ensureSpace(doc, 24);
            const rowY = doc.y;
            doc.fontSize(8.5)
                .fillColor(this.colors.subtle)
                .font('Helvetica-Bold')
                .text('ÁREAS', this.page.contentLeft + cardPad + 8, rowY, {
                    width: 110,
                    characterSpacing: 0.4
                });

            let tagX = this.page.contentLeft + cardPad + 128;
            tags.forEach((tag) => {
                const tagW = tag.length * 5 + 12;
                doc.roundedRect(tagX, rowY - 1, tagW, 13, 2).fill(this.colors.accentSoft);
                doc.fontSize(7.5)
                    .fillColor(this.colors.accentDark)
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
        doc.rect(this.page.contentLeft, cardStartY, this.page.contentWidth, cardH)
            .fill(this.colors.highlightBg);
        doc.rect(this.page.contentLeft, cardStartY, 3, cardH)
            .fill(this.colors.accent);

        // Re-renderiza os campos sobre o fundo (PDFKit não tem z-index, então redesenhamos)
        doc.y = cardStartY + cardPad;
        fields.forEach(([label, value]) => {
            const rowY = doc.y;
            doc.fontSize(8.5)
                .fillColor(this.colors.subtle)
                .font('Helvetica-Bold')
                .text(label.toUpperCase(), this.page.contentLeft + cardPad + 8, rowY, {
                    width: 110,
                    characterSpacing: 0.4
                });
            doc.fontSize(9.5)
                .fillColor(this.colors.text)
                .font('Helvetica')
                .text(String(value).trim(), this.page.contentLeft + cardPad + 128, rowY, {
                    width: this.page.contentWidth - 148
                });
            const afterY = doc.y;
            doc.y = Math.max(afterY, rowY + 14);
        });

        if (tags.length) {
            const rowY = doc.y;
            doc.fontSize(8.5)
                .fillColor(this.colors.subtle)
                .font('Helvetica-Bold')
                .text('ÁREAS', this.page.contentLeft + cardPad + 8, rowY, {
                    width: 110,
                    characterSpacing: 0.4
                });
            let tagX = this.page.contentLeft + cardPad + 128;
            tags.forEach((tag) => {
                const tagW = tag.length * 5 + 12;
                doc.roundedRect(tagX, rowY - 1, tagW, 13, 2).fill(this.colors.accentSoft);
                doc.fontSize(7.5)
                    .fillColor(this.colors.accentDark)
                    .font('Helvetica-Bold')
                    .text(tag, tagX + 5, rowY + 1, { width: tagW - 6, lineBreak: false });
                tagX += tagW + 5;
            });
            doc.y = rowY + 18;
        }

        doc.y = cardEndY + 20;

        // Bloco de descrição do projeto (fora do card, em destaque próprio)
        if (hasDescricao) {
            this.#ensureSpace(doc, 80);
            doc.fontSize(10)
                .fillColor(this.colors.accentDark)
                .font('Helvetica-Bold')
                .text('Descrição do Projeto', this.page.contentLeft);
            doc.moveDown(0.3);
            doc.fontSize(9.5)
                .fillColor(this.colors.textMedium)
                .font('Helvetica')
                .text(String(cycle.descricao).trim(), this.page.contentLeft, doc.y, {
                    width: this.page.contentWidth,
                    align: 'justify',
                    lineGap: 2
                });
            doc.moveDown(1.2);
        }
    }

    /**
     * O que faz: renderiza a lista de disciplinas vinculadas ao ciclo,
     *            cada uma como um card com código, nome, professor, período
     *            e ementa, com separadores visuais entre itens.
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc, array de disciplinas -> void.
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: pode adicionar páginas ao documento.
     */
    #addDisciplines(doc, disciplines) {
        if (!disciplines.length) {
            return;
        }

        this.#addSectionTitle(doc, 'Disciplinas Vinculadas');

        disciplines.forEach((discipline, idx) => {
            const codigo = discipline.codigo || '-';
            const nome = discipline.nome || 'Sem nome';
            const professor = discipline.professor || '-';
            const periodo = `${discipline.ano || '-'} / ${discipline.semestre || '-'}`;
            const nota = discipline.nota || '-';
            const ementa = discipline.ementa
                || discipline.catalog?.ementa
                || '';

            this.#ensureSpace(doc, 70);

            const itemStartY = doc.y;

            // Número do item (decorativo)
            doc.fontSize(20)
                .fillColor(this.colors.accentSoft)
                .font('Helvetica-Bold')
                .text(String(idx + 1).padStart(2, '0'), this.page.contentLeft, itemStartY - 2, {
                    width: 30,
                    lineBreak: false
                });

            const textX = this.page.contentLeft + 36;
            const textW = this.page.contentWidth - 36;

            // Código + Nome
            doc.fontSize(10)
                .fillColor(this.colors.text)
                .font('Helvetica-Bold')
                .text(`${codigo}`, textX, itemStartY, { continued: true, width: textW })
                .fillColor(this.colors.textMedium)
                .font('Helvetica')
                .text(`  —  ${nome}`);

            // Metadados da disciplina (linha de detalhes)
            doc.moveDown(0.15);
            const metaY = doc.y;

            // Badge de nota
            const notaLabel = `Nota: ${nota}`;
            const notaW = notaLabel.length * 5.2 + 10;
            doc.roundedRect(textX, metaY, notaW, 13, 2).fill(this.colors.accentSoft);
            doc.fontSize(7.5)
                .fillColor(this.colors.accentDark)
                .font('Helvetica-Bold')
                .text(notaLabel, textX + 5, metaY + 2, { lineBreak: false });

            doc.fontSize(8.5)
                .fillColor(this.colors.subtle)
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
                    .fillColor(this.colors.subtle)
                    .font('Helvetica-Bold')
                    .text('EMENTA', textX, doc.y, { characterSpacing: 0.5 });
                doc.moveDown(0.1);
                doc.fontSize(8.5)
                    .fillColor(this.colors.textMedium)
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
                for (let x = this.page.contentLeft; x < this.page.contentRight; x += 6) {
                    doc.rect(x, sepY, 3, 1).fill(this.colors.border);
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
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc, array de experiências -> void.
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: pode adicionar páginas ao documento.
     */
    #addExperiences(doc, experiences) {
        if (!experiences.length) {
            return;
        }

        this.#addSectionTitle(doc, 'Experiências Internacionais');

        experiences.forEach((experience, idx) => {
            this.#ensureSpace(doc, 60);

            const titulo = `${experience.tipo || 'Experiência'} — ${experience.instituicao || experience.pais || '-'}`;
            const periodo = this.#formatPeriod(experience.anoInicio, experience.anoFim);
            const detalhes = [
                experience.programa ? `Programa: ${experience.programa}` : null,
                experience.orientador ? `Orientador: ${experience.orientador}` : null,
                experience.pais ? `País: ${experience.pais}` : null,
                periodo ? `Período: ${periodo}` : null
            ].filter(Boolean);

            const itemY = doc.y;

            // Marcador lateral colorido
            doc.rect(this.page.contentLeft, itemY, 3, 40).fill(this.colors.accentMid);

            const textX = this.page.contentLeft + 14;
            const textW = this.page.contentWidth - 14;

            // Título da experiência
            doc.fontSize(10)
                .fillColor(this.colors.text)
                .font('Helvetica-Bold')
                .text(titulo, textX, itemY, { width: textW });

            // Linha de detalhes
            if (detalhes.length) {
                doc.moveDown(0.2);
                doc.fontSize(8.5)
                    .fillColor(this.colors.subtle)
                    .font('Helvetica')
                    .text(detalhes.join('  •  '), textX, doc.y, { width: textW });
            }

            // Descrição da experiência
            if (experience.descricao) {
                doc.moveDown(0.3);
                doc.fontSize(9)
                    .fillColor(this.colors.textMedium)
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
                doc.strokeColor(this.colors.border)
                    .lineWidth(0.5)
                    .moveTo(this.page.contentLeft, doc.y)
                    .lineTo(this.page.contentRight, doc.y)
                    .stroke();
                doc.y += 10;
            }
        });

        doc.moveDown(0.8);
    }

    // ─────────────────────────────────────────────
    // SEÇÃO: FOOTER
    // ─────────────────────────────────────────────

    /**
     * O que faz: renderiza o rodapé de todas as páginas com nome da instituição,
     *            linha decorativa verde e número de páginas.
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc -> void.
     * Dependências críticas: PDFKit (range de páginas).
     * Efeitos colaterais: percorre todas as páginas para aplicar o rodapé.
     */
    #addFooter(doc) {
        const range = doc.bufferedPageRange();

        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(range.start + i);

            const bottomY = doc.page.height - 32;

            // Linha decorativa superior do footer
            doc.rect(0, bottomY - 6, this.page.width, 2).fill(this.colors.accent);
            doc.rect(0, bottomY - 4, this.page.width, 1).fill(this.colors.accentSoft);

            // Fundo do footer
            doc.rect(0, bottomY - 6, this.page.width, 40).fill('#F9FAFB');

            // Texto da instituição
            doc.fontSize(7.5)
                .fillColor(this.colors.subtle)
                .font('Helvetica')
                .text(
                    'Biblioteca Ciências Moleculares — Universidade de São Paulo',
                    50,
                    bottomY + 4,
                    { width: 340, lineBreak: false }
                );

            // Numeração de página
            doc.fontSize(7.5)
                .fillColor(this.colors.accentDark)
                .font('Helvetica-Bold')
                .text(
                    `${i + 1} / ${range.count}`,
                    this.page.contentRight - 30,
                    bottomY + 4,
                    { width: 40, align: 'right', lineBreak: false }
                );
        }
    }

    // ─────────────────────────────────────────────
    // UTILITÁRIOS DE LAYOUT
    // ─────────────────────────────────────────────

    /**
     * O que faz: renderiza o título de uma seção com linha decorativa verde
     *            e espaçamento padronizado.
     * Camada: Apresentação (privado).
     * Entradas/Saídas: doc, texto -> void.
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: avança o cursor do documento.
     */
    #addSectionTitle(doc, title) {
        this.#ensureSpace(doc, 36);

        const titleY = doc.y;

        // Ponto decorativo verde antes do título
        doc.circle(this.page.contentLeft + 4, titleY + 7, 3.5).fill(this.colors.accent);

        doc.fontSize(12)
            .fillColor(this.colors.text)
            .font('Helvetica-Bold')
            .text(title.toUpperCase(), this.page.contentLeft + 16, titleY, {
                characterSpacing: 0.8,
                width: this.page.contentWidth - 16
            });

        doc.moveDown(0.2);

        // Linha full-width abaixo do título
        doc.rect(this.page.contentLeft, doc.y, this.page.contentWidth, 1.5)
            .fill(this.colors.accent);

        doc.y += 12;
    }

    /**
     * O que faz: verifica se há espaço vertical suficiente na página atual;
     *            se não houver, adiciona uma nova página e restaura margens.
     * Camada: Layout (privado).
     * Entradas/Saídas: doc, altura requerida -> void.
     * Dependências críticas: PDFKit.
     * Efeitos colaterais: pode adicionar páginas ao documento.
     */
    #ensureSpace(doc, requiredHeight) {
        const bottomLimit = doc.page.height - 60; // margem para o footer
        if (doc.y + requiredHeight > bottomLimit) {
            doc.addPage();
            doc.y = 40;
            doc.x = this.page.contentLeft;
        }
    }

    /**
     * O que faz: formata um período com ano de início e fim em string legível.
     * Camada: Utilitário (privado).
     * Entradas/Saídas: anoInicio, anoFim -> string formatada.
     * Dependências críticas: nenhuma.
     * Efeitos colaterais: nenhum.
     */
    #formatPeriod(startYear, endYear) {
        if (!startYear && !endYear) return '';
        if (startYear && endYear) return `${startYear} – ${endYear}`;
        if (startYear) return `${startYear} – presente`;
        return `até ${endYear}`;
    }
}

module.exports = new AdvancedPdfService();