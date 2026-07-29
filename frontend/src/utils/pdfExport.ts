import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DisciplineState } from '@/hooks/useDisciplineList';
import { SCHEDULE_COLORS } from '@/services/UserSchedulesService';

interface ExportToPDFOptions {
  gradeElement: HTMLElement;
  disciplineStates: DisciplineState[];
  totalCreditsAula: number;
  totalCreditsTrabalho: number;
  planName: string;
}

// Cor da marca (modo acadêmico) — academic-blue #01aad0
const BRAND: [number, number, number] = [1, 170, 208];

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

/**
 * Exporta a grade e as disciplinas para PDF, seguindo a identidade do site.
 * As cores dos cartões batem com as da grade (mesma ordem de SCHEDULE_COLORS,
 * indexada pela posição na lista completa de disciplinas).
 */
export async function exportGradeToPDF({
  gradeElement,
  disciplineStates,
  totalCreditsAula,
  totalCreditsTrabalho,
  planName,
}: ExportToPDFOptions): Promise<void> {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const totalCreditos = totalCreditsAula + totalCreditsTrabalho;

  // Mapeia cada disciplina para a cor exibida na grade (índice no array completo)
  const colorByDisciplineId = new Map<number, string>();
  disciplineStates.forEach((state, index) => {
    colorByDisciplineId.set(state.discipline.id, SCHEDULE_COLORS[index % SCHEDULE_COLORS.length]);
  });

  const drawHeaderBand = (title: string, withCredits: boolean) => {
    pdf.setFillColor(...BRAND);
    pdf.rect(0, 0, pageWidth, 24, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(title, margin, 13);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      margin,
      19.5
    );

    if (withCredits) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(
        `${totalCreditos} créditos`,
        pageWidth - margin,
        12,
        { align: 'right' }
      );
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(
        `${totalCreditsAula} aula  ·  ${totalCreditsTrabalho} trabalho`,
        pageWidth - margin,
        18,
        { align: 'right' }
      );
    }
  };

  // ============ PÁGINA 1: GRADE VISUAL ============
  drawHeaderBand(planName || 'Minha Grade', true);

  const canvas = await html2canvas(gradeElement, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const availTop = 30;
  const availHeight = pageHeight - availTop - 14;
  const availWidth = pageWidth - 2 * margin;

  // Encaixa a imagem mantendo a proporção, sem ultrapassar a área disponível
  let imgWidth = availWidth;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;
  if (imgHeight > availHeight) {
    imgHeight = availHeight;
    imgWidth = (canvas.width * imgHeight) / canvas.height;
  }
  const imgX = (pageWidth - imgWidth) / 2;
  pdf.addImage(imgData, 'PNG', imgX, availTop, imgWidth, imgHeight);

  // ============ PÁGINA 2+: DISCIPLINAS ============
  pdf.addPage();
  drawHeaderBand('Disciplinas selecionadas', false);

  const visibleDisciplines = disciplineStates.filter(d => d.isVisible);

  const cardGap = 6;
  const columns = 3;
  const cardWidth = (pageWidth - 2 * margin - (columns - 1) * cardGap) / columns;
  const cardHeight = 34;
  let currentY = 32;
  let column = 0;

  visibleDisciplines.forEach((disciplineState) => {
    const { discipline, selectedClassId, isCustom } = disciplineState;
    const selectedClass = discipline.classes.find(c => c.id === selectedClassId);
    const color = colorByDisciplineId.get(discipline.id) || SCHEDULE_COLORS[0];
    const [r, g, b] = hexToRgb(color);

    if (currentY + cardHeight > pageHeight - 14) {
      pdf.addPage();
      drawHeaderBand('Disciplinas selecionadas (cont.)', false);
      currentY = 32;
      column = 0;
    }

    const x = margin + column * (cardWidth + cardGap);

    // Cartão: fundo pastel (tint da cor) com faixa colorida à esquerda,
    // espelhando os blocos da grade na tela.
    const lighten = (c: number, amt = 0.88) => Math.round(c + (255 - c) * amt);
    pdf.setFillColor(lighten(r), lighten(g), lighten(b));
    pdf.setDrawColor(lighten(r, 0.55), lighten(g, 0.55), lighten(b, 0.55));
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, currentY, cardWidth, cardHeight, 2.5, 2.5, 'FD');

    pdf.setFillColor(r, g, b);
    pdf.roundedRect(x, currentY, 3, cardHeight, 1.5, 1.5, 'F');
    pdf.rect(x + 1.5, currentY, 1.5, cardHeight, 'F');

    const textX = x + 7;

    // Código (na cor da disciplina, levemente escurecida para contraste)
    pdf.setTextColor(Math.round(r * 0.75), Math.round(g * 0.75), Math.round(b * 0.75));
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(discipline.codigo, textX, currentY + 8);

    // Badge "Manual"
    if (isCustom) {
      pdf.setFontSize(7);
      pdf.text('MANUAL', x + cardWidth - 4, currentY + 7, { align: 'right' });
    }

    // Nome
    pdf.setTextColor(51, 65, 85);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    const nomeSplit = pdf.splitTextToSize(discipline.nome, cardWidth - 10);
    pdf.text(nomeSplit.slice(0, 2), textX, currentY + 14);

    // Detalhes
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text(`${discipline.creditos_aula}+${discipline.creditos_trabalho} créditos`, textX, currentY + 23);

    if (selectedClass) {
      const turmaDisplay = selectedClass.codigo_turma?.substring(4) || selectedClass.codigo_turma;
      pdf.text(`Turma ${turmaDisplay}`, textX, currentY + 28);
      if (selectedClass.schedules && selectedClass.schedules.length > 0) {
        const h = selectedClass.schedules[0];
        const extra = selectedClass.schedules.length > 1 ? ` +${selectedClass.schedules.length - 1}` : '';
        pdf.text(`${h.dia.toUpperCase()} ${h.horario_inicio}-${h.horario_fim}${extra}`, textX, currentY + 32.5);
      }
    }

    column++;
    if (column >= columns) {
      column = 0;
      currentY += cardHeight + cardGap;
    }
  });

  // ============ RODAPÉ ============
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.setFont('helvetica', 'normal');
    pdf.text('BibliotecaCM · Grade Interativa', margin, pageHeight - 5.5);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 5.5, { align: 'right' });
  }

  const fileName = `grade_${planName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  pdf.save(fileName);
}
