import { useRef, useMemo, useCallback, useEffect } from "react";
import { logger } from "@/utils/logger";
import { toast } from "sonner";
import { exportGradeToPDF } from "@/utils/pdfExport";
import { useGrade, GradeSlot } from "@/hooks/useGrade";
import { useDisciplineList } from "@/hooks/useDisciplineList";
import { useCombinations } from "@/hooks/useCombinations";
import { useDisciplineSlots } from "@/features/grade/hooks/useDisciplineSlots";
import { useLoadSavedDisciplines } from "@/features/grade/hooks/useLoadSavedDisciplines";
import { DisciplineWithClasses } from "@/utils/combinationsGenerator";

export function useGradePageLogic() {
  const gradeRef = useRef<HTMLDivElement>(null);

  // Hook principal da grade
  const {
    schedules,
    activeScheduleId,
    gradeSlots,
    timeRange,
    isLoading,
    isSaving,
    error,
    isAuthenticated,
    editingScheduleName,
    scheduleDisciplines,
    customDisciplines,
    setActiveScheduleId,
    setEditingScheduleName,
    setError,
    createSchedule,
    renameSchedule,
    deleteSchedule,
    duplicateSchedule,
    loadSchedules,
    reloadActiveScheduleData,
    addClass,
    removeClass,
    addCustomDiscipline,
    removeCustomDiscipline,
    addDisciplineToList,
    updateDisciplineInList,
    removeDisciplineFromList,
    addLocalSlot,
    removeLocalSlot,
    SCHEDULE_COLORS
  } = useGrade();

  // Hook para gerenciar lista de disciplinas
  const {
    disciplineStates,
    handleAddDiscipline,
    handleAddCustomDiscipline,
    handleToggleVisibility,
    handleSelectClass,
    handleToggleExpanded,
    handleRemoveDiscipline,
    loadDisciplines,
    clearList,
    setDisciplineStates
  } = useDisciplineList(
    isAuthenticated,
    activeScheduleId,
    addDisciplineToList,
    updateDisciplineInList,
    removeDisciplineFromList
  );

  // Hook para carregar disciplinas salvas do banco
  useLoadSavedDisciplines(
    isAuthenticated, 
    scheduleDisciplines, 
    loadDisciplines
  );

  // Hook para gerar slots da grade a partir das disciplinas
  const { 
    disciplineSlots, 
    credits: disciplineCredits,
    conflicts,
    conflictingSlotIds,
    hasConflicts
  } = useDisciplineSlots(
    disciplineStates,
    SCHEDULE_COLORS
  );

  // Hook para gerenciar combinações
  const {
    combinations,
    currentCombinationIndex,
    isGenerating: isGeneratingCombinations,
    showPreview: showCombinationPreview,
    previewSlots,
    currentCredits: combinationCredits,
    setShowPreview: setShowCombinationPreview,
    applyCombination,
    nextCombination,
    previousCombination
  } = useCombinations(disciplineStates, SCHEDULE_COLORS);

  // Limpa a lista apenas quando troca de plano para outro plano diferente
  useEffect(() => {
    if (activeScheduleId !== null) {
      logger.info(`🔵 [GradePage] Plano ativo mudou para ${activeScheduleId}, limpando lista local`);
      clearList();
    }
  }, [activeScheduleId]);

  // Handler para remover slot da grade diretamente (quando clica no X na grade)
  const handleRemoveSlot = async (slot: GradeSlot) => {
    if (isAuthenticated) {
      if (slot.type === 'class') {
        await removeClass(slot.id);
      } else {
        await removeCustomDiscipline(slot.id);
        setDisciplineStates(prev => prev.filter(d => d.customDisciplineId !== slot.id));
      }
      reloadActiveScheduleData();
    } else {
      removeLocalSlot(slot.id);
    }
  };

  // Handler wrapper para remover disciplina da lista
  const handleRemoveDisciplineFromList = useCallback((disciplineId: number) => {
    return handleRemoveDiscipline(disciplineId, removeCustomDiscipline);
  }, [handleRemoveDiscipline, removeCustomDiscipline]);

  // Handler para adicionar turma (modo busca individual)
  const handleAddClass = async (classId: number): Promise<{ success: boolean; conflicts?: any[] }> => {
    if (!isAuthenticated) {
      setError('Faça login para adicionar disciplinas');
      return { success: false };
    }
    const result = await addClass(classId);
    return result as { success: boolean; conflicts?: any[] };
  };

  // Handler para adicionar disciplina customizada
  const handleAddCustom = async (data: {
    nome: string;
    codigo?: string;
    schedules: Array<{
      dia: string;
      horario_inicio: string;
      horario_fim: string;
    }>;
    creditos_aula?: number;
    creditos_trabalho?: number;
    color?: string;
  }) => {
    if (!isAuthenticated) {
      data.schedules.forEach(schedule => {
        addLocalSlot({
          type: 'custom',
          color: data.color || SCHEDULE_COLORS[gradeSlots.length % SCHEDULE_COLORS.length],
          dia: schedule.dia,
          horario_inicio: schedule.horario_inicio,
          horario_fim: schedule.horario_fim,
          disciplina_nome: data.nome,
          disciplina_codigo: data.codigo || 'CUSTOM',
          isVisible: true
        });
      });
      return;
    }
    const result = await addCustomDiscipline(data);
    if (result) {
      handleAddCustomDiscipline({
        id: result.id,
        nome: result.nome,
        codigo: result.codigo,
        creditos_aula: result.creditos_aula,
        creditos_trabalho: result.creditos_trabalho,
        color: result.color,
        schedules: result.schedules
      });
      toast.success(`Disciplina "${data.nome}" adicionada com sucesso!`);
    }
    return result;
  };

  // Handler para adicionar disciplina da busca ao quadro
  const handleAddDisciplineFromSearch = useCallback(async (discipline: { 
    id: number; 
    codigo: string; 
    nome: string; 
    creditos_aula: number; 
    creditos_trabalho: number;
    isCustom?: boolean;
    customId?: number;
    color?: string;
    schedules?: Array<{
      dia: string;
      horario_inicio: string;
      horario_fim: string;
    }>;
  }) => {
    if (discipline.isCustom && discipline.customId) {
      try {
        logger.info(`🔵 [GradePage] Duplicando disciplina customizada ${discipline.codigo} para plano ${activeScheduleId}`);
        const newCustom = await addCustomDiscipline({
          nome: discipline.nome,
          codigo: discipline.codigo,
          creditos_aula: discipline.creditos_aula,
          creditos_trabalho: discipline.creditos_trabalho,
          color: discipline.color || '#14b8a6',
          schedules: discipline.schedules || []
        });
        if (newCustom) {
          logger.info(`🟢 [GradePage] Disciplina customizada duplicada com ID ${newCustom.id}`);
          toast.success(`Disciplina "${discipline.nome}" adicionada ao plano`);
        } else {
          logger.error('🔴 [GradePage] Erro ao duplicar disciplina customizada');
          toast.error('Erro ao adicionar disciplina');
        }
      } catch (error) {
        logger.error('🔴 [GradePage] Erro ao duplicar disciplina customizada:', error);
        toast.error('Erro ao adicionar disciplina');
      }
      return;
    }
    try {
      const response = await fetch(`/api/disciplines/${discipline.codigo}/full`);
      if (response.ok) {
        const data = await response.json();
        const disciplineId = discipline.id || data.id;
        const disciplineWithClasses: DisciplineWithClasses = {
          id: disciplineId,
          codigo: data.codigo || discipline.codigo,
          nome: data.nome || discipline.nome,
          creditos_aula: Number(data.creditos_aula ?? discipline.creditos_aula) || 0,
          creditos_trabalho: Number(data.creditos_trabalho ?? discipline.creditos_trabalho) || 0,
          classes: (data.turmas || []).map((cls: any) => ({
            id: cls.id,
            codigo_turma: cls.codigo_turma,
            discipline_id: disciplineId,
            discipline_codigo: data.codigo || discipline.codigo,
            discipline_nome: data.nome || discipline.nome,
            schedules: cls.schedules || [],
            professors: cls.professors || []
          }))
        };
        handleAddDiscipline(disciplineWithClasses);
      }
    } catch (error) {
      logger.error('Erro ao carregar turmas:', error);
    }
  }, [handleAddDiscipline, activeScheduleId, addCustomDiscipline]);

  // Aplica a combinação selecionada - seleciona as turmas correspondentes nas disciplinas
  const handleApplyCombination = useCallback((index: number, combination: any) => {
    logger.info(`🔵 [GradePage] Aplicando combinação ${index + 1}`);
    applyCombination(index, combination);
    Promise.resolve().then(() => {
      combination.classes.forEach((cls: any) => {
        const disciplineState = disciplineStates.find(
          d => d.discipline.id === cls.discipline_id
        );
        if (disciplineState && cls.id !== disciplineState.selectedClassId) {
          logger.info(`🔵 [GradePage] Selecionando turma ${cls.codigo_turma} para ${cls.discipline_codigo}`);
          handleSelectClass(cls.discipline_id, cls.id);
        }
      });
    });
  }, [applyCombination, disciplineStates, handleSelectClass]);

  // Exportar para PDF
  const handleExportPDF = async () => {
    if (!gradeRef.current) {
      toast.error('Erro ao capturar grade');
      return;
    }
    if (disciplineStates.filter(d => d.isVisible).length === 0) {
      toast.error('Adicione disciplinas à grade antes de exportar');
      return;
    }
    try {
      toast.loading('Gerando PDF...');
      const activePlan = schedules.find(s => s.id === activeScheduleId);
      await exportGradeToPDF({
        gradeElement: gradeRef.current,
        disciplineStates,
        totalCreditsAula: disciplineCredits.creditos_aula,
        totalCreditsTrabalho: disciplineCredits.creditos_trabalho,
        planName: activePlan?.name || 'Minha Grade'
      });
      toast.dismiss();
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      logger.error('Erro ao gerar PDF:', error);
      toast.dismiss();
      toast.error('Erro ao gerar PDF');
    }
  };

  // Keyboard navigation for combinations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (combinations.length === 0) return;
      if (e.key === 'ArrowLeft') {
        previousCombination();
      } else if (e.key === 'ArrowRight') {
        nextCombination();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combinations.length, previousCombination, nextCombination]);

  // Slots a exibir: preview de combinação ou disciplinas selecionadas manualmente
  const displaySlots = useMemo(() => {
    if (showCombinationPreview && previewSlots.length > 0) {
      return previewSlots;
    }
    return [...gradeSlots, ...disciplineSlots];
  }, [showCombinationPreview, previewSlots, gradeSlots, disciplineSlots]);

  // Créditos a exibir
  const displayCredits = useMemo(() => {
    if (showCombinationPreview && combinations.length > 0) {
      return combinationCredits;
    }
    return disciplineCredits;
  }, [showCombinationPreview, combinations.length, combinationCredits, disciplineCredits]);

  return {
    gradeRef,
    schedules,
    activeScheduleId,
    gradeSlots,
    timeRange,
    isLoading,
    isSaving,
    error,
    isAuthenticated,
    editingScheduleName,
    scheduleDisciplines,
    customDisciplines,
    setActiveScheduleId,
    setEditingScheduleName,
    setError,
    createSchedule,
    renameSchedule,
    deleteSchedule,
    duplicateSchedule,
    loadSchedules,
    reloadActiveScheduleData,
    addClass,
    removeClass,
    addCustomDiscipline,
    removeCustomDiscipline,
    addDisciplineToList,
    updateDisciplineInList,
    removeDisciplineFromList,
    addLocalSlot,
    removeLocalSlot,
    SCHEDULE_COLORS,
    disciplineStates,
    handleAddDiscipline,
    handleAddCustomDiscipline,
    handleToggleVisibility,
    handleSelectClass,
    handleToggleExpanded,
    handleRemoveDiscipline,
    loadDisciplines,
    clearList,
    setDisciplineStates,
    disciplineSlots,
    disciplineCredits,
    conflicts,
    conflictingSlotIds,
    hasConflicts,
    combinations,
    currentCombinationIndex,
    isGeneratingCombinations,
    showCombinationPreview,
    previewSlots,
    combinationCredits,
    setShowCombinationPreview,
    applyCombination,
    nextCombination,
    previousCombination,
    handleRemoveSlot,
    handleRemoveDisciplineFromList,
    handleAddClass,
    handleAddCustom,
    handleAddDisciplineFromSearch,
    handleApplyCombination,
    handleExportPDF,
    displaySlots,
    displayCredits,
  };
}
