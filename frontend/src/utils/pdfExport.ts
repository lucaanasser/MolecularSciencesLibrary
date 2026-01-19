import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DisciplineState } from '@/hooks/useDisciplineList';

interface ExportToPDFOptions {
  gradeElement: HTMLElement;
  disciplineStates: DisciplineState[];
  totalCreditsAula: number;
  totalCreditsTrabalho: number;
  planName: string;
}

// Cores do sistema (mesmas da grade)
const COLORS = [
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#eab308', // yellow-500
  '#06b6d4', // cyan-500
  '#f43f5e', // rose-500
  '#10b981', // emerald-500
];

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

/**
 * Exporta a grade e informações das disciplinas para PDF
 */
export async function exportGradeToPDF({
  gradeElement,
  disciplineStates,
  totalCreditsAula,
  totalCreditsTrabalho,
  planName
}: ExportToPDFOptions): Promise<void> {
  try {
    console.log('🔵 [PDFExport] Iniciando geração do PDF');

    // Cria o documento PDF (A4 landscape para mais espaço)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    // ============ PÁGINA 1: GRADE VISUAL ============
    
    // Cabeçalho com fundo colorido
    pdf.setFillColor(20, 184, 166); // teal-500 (cor principal do site)
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(planName || 'Minha Grade', margin, 15);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, 21);

    // Box de créditos com design moderno
    const creditBoxY = 30;
    const creditBoxHeight = 20;
    
    // Total de créditos - box principal
    pdf.setFillColor(241, 245, 249); // gray-100
    pdf.roundedRect(margin, creditBoxY, 60, creditBoxHeight, 3, 3, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Total de Créditos', margin + 5, creditBoxY + 7);
    
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 184, 166);
    pdf.text(`${totalCreditsAula + totalCreditsTrabalho}`, margin + 5, creditBoxY + 16);
    
    // Créditos Aula
    pdf.setFillColor(254, 243, 199); // yellow-100
    pdf.roundedRect(margin + 65, creditBoxY, 40, creditBoxHeight, 3, 3, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 113, 108);
    pdf.text('Aula', margin + 70, creditBoxY + 7);
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(234, 179, 8);
    pdf.text(`${totalCreditsAula}`, margin + 70, creditBoxY + 16);
    
    // Créditos Trabalho
    pdf.setFillColor(224, 242, 254); // blue-100
    pdf.roundedRect(margin + 110, creditBoxY, 40, creditBoxHeight, 3, 3, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 113, 108);
    pdf.text('Trabalho', margin + 115, creditBoxY + 7);
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(14, 165, 233);
    pdf.text(`${totalCreditsTrabalho}`, margin + 115, creditBoxY + 16);

    // Captura a grade como imagem
    console.log('🔵 [PDFExport] Capturando grade como imagem');
    const canvas = await html2canvas(gradeElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - (2 * margin);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const maxImgHeight = pageHeight - creditBoxY - creditBoxHeight - 25;
    
    const finalImgHeight = Math.min(imgHeight, maxImgHeight);
    const finalImgWidth = imgWidth * (finalImgHeight / imgHeight);

    pdf.addImage(imgData, 'PNG', margin, creditBoxY + creditBoxHeight + 5, finalImgWidth, finalImgHeight);

    // ============ PÁGINA 2+: LISTA DE DISCIPLINAS ============
    pdf.addPage();
    
    // Cabeçalho da segunda página
    pdf.setFillColor(20, 184, 166);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Disciplinas Selecionadas', margin, 13);

    let currentY = 30;
    const cardWidth = (pageWidth - 3 * margin) / 2; // 2 colunas
    const cardHeight = 45;
    let currentX = margin;
    let column = 0;

    // Filtra apenas disciplinas visíveis
    const visibleDisciplines = disciplineStates.filter(d => d.isVisible);

    visibleDisciplines.forEach((disciplineState, index) => {
      const { discipline, selectedClassId } = disciplineState;
      const selectedClass = discipline.classes.find(c => c.id === selectedClassId);
      
      // Cor do card
      const color = COLORS[index % COLORS.length];
      const [r, g, b] = hexToRgb(color);

      // Verifica se precisa de nova página
      if (currentY + cardHeight > pageHeight - 15) {
        pdf.addPage();
        
        // Cabeçalho
        pdf.setFillColor(20, 184, 166);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Disciplinas Selecionadas (continuação)', margin, 13);
        
        currentY = 30;
        column = 0;
        currentX = margin;
      }

      // Calcula posição X baseada na coluna
      currentX = margin + (column * (cardWidth + margin));

      // Card com cor
      pdf.setFillColor(r, g, b);
      pdf.roundedRect(currentX, currentY, cardWidth, cardHeight, 2, 2, 'F');

      // Borda do card
      pdf.setDrawColor(r * 0.8, g * 0.8, b * 0.8);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(currentX, currentY, cardWidth, cardHeight, 2, 2, 'S');

      // Conteúdo do card
      pdf.setTextColor(255, 255, 255);
      
      // Código da disciplina (maior e bold)
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(discipline.codigo, currentX + 5, currentY + 8);

      // Nome da disciplina (quebra de linha se necessário)
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      const nomeSplit = pdf.splitTextToSize(discipline.nome, cardWidth - 10);
      pdf.text(nomeSplit.slice(0, 2), currentX + 5, currentY + 15);

      // Linha separadora
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.3);
      pdf.line(currentX + 5, currentY + 23, currentX + cardWidth - 5, currentY + 23);

      // Créditos
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${discipline.creditos_aula}+${discipline.creditos_trabalho} créditos`, currentX + 5, currentY + 28);

      // Turma
      if (selectedClass) {
        const turmaDisplay = selectedClass.codigo_turma?.substring(4) || selectedClass.codigo_turma;
        pdf.text(`Turma: ${turmaDisplay}`, currentX + 5, currentY + 33);

        // Horários (apenas primeiro se houver muitos)
        if (selectedClass.schedules && selectedClass.schedules.length > 0) {
          const primeiroHorario = selectedClass.schedules[0];
          const horarioTexto = `${primeiroHorario.dia.toUpperCase()} ${primeiroHorario.horario_inicio}-${primeiroHorario.horario_fim}`;
          const maisHorarios = selectedClass.schedules.length > 1 ? ` +${selectedClass.schedules.length - 1}` : '';
          pdf.text(horarioTexto + maisHorarios, currentX + 5, currentY + 38);
        }
      }

      // Avança para próxima posição
      column++;
      if (column >= 2) {
        column = 0;
        currentY += cardHeight + 5;
      }
    });

    // ============ RODAPÉ EM TODAS AS PÁGINAS ============
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Linha
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - margin - 20,
        pageHeight - 7
      );
      pdf.text(
        'BibliotecaCM - Grade Horária',
        margin,
        pageHeight - 7
      );
    }

    // Salva o PDF
    const fileName = `grade_${planName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

    console.log('🟢 [PDFExport] PDF gerado com sucesso:', fileName);
  } catch (error) {
    console.error('🔴 [PDFExport] Erro ao gerar PDF:', error);
    throw error;
  }
}
