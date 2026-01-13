/**
 * Gerador de combinações de horários sem conflitos
 * Inspirado no MatrUSP - encontra todas as combinações válidas de turmas
 */

export interface ClassSchedule {
  dia: string;
  horario_inicio: string;
  horario_fim: string;
}

export interface ClassOption {
  id: number;
  codigo_turma: string;
  discipline_id: number;
  discipline_codigo: string;
  discipline_nome: string;
  schedules: ClassSchedule[];
  professors: { nome: string }[];
}

export interface DisciplineWithClasses {
  id: number;
  codigo: string;
  nome: string;
  creditos_aula: number;
  creditos_trabalho: number;
  classes: ClassOption[];
}

export interface Combination {
  id: number;
  classes: ClassOption[];
  totalCreditsAula: number;
  totalCreditsTrabalho: number;
}

/**
 * Converte horário string para minutos desde meia-noite
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Verifica se dois horários se sobrepõem
 */
function schedulesOverlap(a: ClassSchedule, b: ClassSchedule): boolean {
  if (a.dia !== b.dia) return false;
  
  const aStart = timeToMinutes(a.horario_inicio);
  const aEnd = timeToMinutes(a.horario_fim);
  const bStart = timeToMinutes(b.horario_inicio);
  const bEnd = timeToMinutes(b.horario_fim);
  
  // Checa sobreposição
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Verifica se uma turma conflita com um conjunto de turmas já selecionadas
 */
function hasConflict(newClass: ClassOption, selectedClasses: ClassOption[]): boolean {
  for (const selected of selectedClasses) {
    for (const newSchedule of newClass.schedules) {
      for (const selectedSchedule of selected.schedules) {
        if (schedulesOverlap(newSchedule, selectedSchedule)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Gera todas as combinações válidas (sem conflitos) de turmas
 * @param disciplines Lista de disciplinas com suas turmas disponíveis
 * @param maxCombinations Limite máximo de combinações para evitar explosão combinatória
 * @returns Array de combinações válidas
 */
export function generateCombinations(
  disciplines: DisciplineWithClasses[],
  maxCombinations: number = 100
): Combination[] {
  const combinations: Combination[] = [];
  
  if (disciplines.length === 0) return combinations;
  
  // Filtra disciplinas que têm turmas disponíveis
  const validDisciplines = disciplines.filter(d => d.classes && d.classes.length > 0);
  
  if (validDisciplines.length === 0) return combinations;
  
  /**
   * Gera combinações recursivamente usando backtracking
   */
  function backtrack(index: number, currentClasses: ClassOption[], totalCreditsAula: number, totalCreditsTrabalho: number) {
    // Se atingiu o limite, para
    if (combinations.length >= maxCombinations) return;
    
    // Se processou todas as disciplinas, adiciona a combinação
    if (index >= validDisciplines.length) {
      if (currentClasses.length > 0) {
        combinations.push({
          id: combinations.length + 1,
          classes: [...currentClasses],
          totalCreditsAula,
          totalCreditsTrabalho
        });
      }
      return;
    }
    
    const discipline = validDisciplines[index];
    
    // Tenta cada turma desta disciplina
    for (const classOption of discipline.classes) {
      // Enriquece a turma com info da disciplina
      const enrichedClass: ClassOption = {
        ...classOption,
        discipline_id: discipline.id,
        discipline_codigo: discipline.codigo,
        discipline_nome: discipline.nome
      };
      
      // Verifica se não conflita com as já selecionadas
      if (!hasConflict(enrichedClass, currentClasses)) {
        currentClasses.push(enrichedClass);
        backtrack(
          index + 1, 
          currentClasses, 
          totalCreditsAula + discipline.creditos_aula,
          totalCreditsTrabalho + discipline.creditos_trabalho
        );
        currentClasses.pop();
      }
    }
    
    // Também tenta não incluir esta disciplina (opcional)
    // Isso permite combinações parciais quando há disciplinas opcionais
    // backtrack(index + 1, currentClasses, totalCreditsAula, totalCreditsTrabalho);
  }
  
  backtrack(0, [], 0, 0);
  
  // Ordena por mais créditos primeiro
  combinations.sort((a, b) => {
    const totalA = a.totalCreditsAula + a.totalCreditsTrabalho;
    const totalB = b.totalCreditsAula + b.totalCreditsTrabalho;
    return totalB - totalA;
  });
  
  return combinations;
}

/**
 * Calcula estatísticas sobre as combinações
 */
export function getCombinationStats(combinations: Combination[]) {
  if (combinations.length === 0) {
    return {
      total: 0,
      minCreditsAula: 0,
      maxCreditsAula: 0,
      minCreditsTrabalho: 0,
      maxCreditsTrabalho: 0
    };
  }
  
  const creditsAula = combinations.map(c => c.totalCreditsAula);
  const creditsTrabalho = combinations.map(c => c.totalCreditsTrabalho);
  
  return {
    total: combinations.length,
    minCreditsAula: Math.min(...creditsAula),
    maxCreditsAula: Math.max(...creditsAula),
    minCreditsTrabalho: Math.min(...creditsTrabalho),
    maxCreditsTrabalho: Math.max(...creditsTrabalho)
  };
}

export default generateCombinations;
