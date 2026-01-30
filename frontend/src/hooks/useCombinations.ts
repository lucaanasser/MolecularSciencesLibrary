import { useState, useEffect, useCallback, useMemo } from 'react';
import { DisciplineState } from '@/hooks/useDisciplineList';
import { 
  generateCombinations, 
  Combination,
  DisciplineWithClasses
} from '@/utils/combinationsGenerator';
import { GradeSlot } from '@/hooks/useGrade';

/**
 * Hook para gerenciar combinações de turmas
 */
export function useCombinations(
  disciplineStates: DisciplineState[],
  scheduleColors: readonly string[]
) {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [currentCombinationIndex, setCurrentCombinationIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSlots, setPreviewSlots] = useState<GradeSlot[]>([]);

  // Gera combinações quando a lista de disciplinas muda
  useEffect(() => {
    const visibleDisciplines = disciplineStates
      .filter(d => d.isVisible)
      .map(d => d.discipline);

    if (visibleDisciplines.length === 0) {
      setCombinations([]);
      setPreviewSlots([]);
      setShowPreview(false);
      return;
    }

    console.log(`🔵 [useCombinations] Gerando combinações para ${visibleDisciplines.length} disciplinas`);
    setIsGenerating(true);
    
    // Usa setTimeout para não travar a UI
    const timer = setTimeout(() => {
      const newCombinations = generateCombinations(visibleDisciplines, 100);
      console.log(`🟢 [useCombinations] ${newCombinations.length} combinações geradas`);
      setCombinations(newCombinations);
      setCurrentCombinationIndex(0);
      
      // Atualiza preview com a primeira combinação
      if (newCombinations.length > 0) {
        updatePreviewSlots(newCombinations[0]);
      } else {
        setPreviewSlots([]);
      }
      
      setIsGenerating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [disciplineStates]);

  // Atualiza preview quando muda a combinação selecionada
  const updatePreviewSlots = useCallback((combination: Combination) => {
    const slots: GradeSlot[] = [];
    
    combination.classes.forEach((cls, index) => {
      const color = scheduleColors[index % scheduleColors.length];
      
      cls.schedules.forEach(schedule => {
        slots.push({
          type: 'class',
          id: cls.id,
          color,
          dia: schedule.dia,
          horario_inicio: schedule.horario_inicio,
          horario_fim: schedule.horario_fim,
          disciplina_nome: cls.discipline_nome,
          disciplina_codigo: cls.discipline_codigo,
          turma_codigo: cls.codigo_turma,
          professor: cls.professors?.[0]?.nome,
          isVisible: true
        });
      });
    });
    
    setPreviewSlots(slots);
  }, [scheduleColors]);

  // Quando muda o índice da combinação, atualiza o preview
  useEffect(() => {
    if (combinations.length > 0 && combinations[currentCombinationIndex]) {
      updatePreviewSlots(combinations[currentCombinationIndex]);
    }
  }, [currentCombinationIndex, combinations, updatePreviewSlots]);

  // Aplica a combinação selecionada
  const applyCombination = useCallback((index: number, combination: Combination) => {
    console.log(`🔵 [useCombinations] Aplicando combinação ${index + 1}/${combinations.length}`);
    setCurrentCombinationIndex(index);
    setShowPreview(false);
    
    return combination;
  }, [combinations.length]);

  // Navega entre combinações
  const nextCombination = useCallback(() => {
    if (currentCombinationIndex < combinations.length - 1) {
      setCurrentCombinationIndex(prev => prev + 1);
      setShowPreview(true);
    }
  }, [currentCombinationIndex, combinations.length]);

  const previousCombination = useCallback(() => {
    if (currentCombinationIndex > 0) {
      setCurrentCombinationIndex(prev => prev - 1);
      setShowPreview(true);
    }
  }, [currentCombinationIndex]);

  // Créditos da combinação atual
  const currentCredits = useMemo(() => {
    if (combinations.length > 0 && combinations[currentCombinationIndex]) {
      return {
        creditos_aula: combinations[currentCombinationIndex].totalCreditsAula || 0,
        creditos_trabalho: combinations[currentCombinationIndex].totalCreditsTrabalho || 0
      };
    }
    return { creditos_aula: 0, creditos_trabalho: 0 };
  }, [combinations, currentCombinationIndex]);

  return {
    combinations,
    currentCombinationIndex,
    isGenerating,
    showPreview,
    previewSlots,
    currentCredits,
    setShowPreview,
    applyCombination,
    nextCombination,
    previousCombination
  };
}
