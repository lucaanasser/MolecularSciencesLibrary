import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Info, AlertCircle, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import {
  GradeGrid,
  DisciplineSearch,
  PlanTabs,
  AddCustomDiscipline,
  DisciplineListNew,
  MiniGradeCombinations,
} from "@/features/grade/components";
import { useGrade, GradeSlot } from "@/hooks/useGrade";
import { useDisciplineList } from "@/hooks/useDisciplineList";
import { useCombinations } from "@/hooks/useCombinations";
import { useDisciplineSlots } from "@/features/grade/hooks/useDisciplineSlots";
import { useLoadSavedDisciplines } from "@/features/grade/hooks/useLoadSavedDisciplines";
import { DisciplineWithClasses } from "@/utils/combinationsGenerator";
import { exportGradeToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";

/**
 * Página da Grade Interativa do modo acadêmico.
 * Layout: Sidebar (busca + lista) | Grade + Combinações embaixo | Créditos
 */
const GradePage: React.FC = () => {
  console.log("🔵 [GradePage] Renderizando página da grade interativa");

  // Ref para o elemento da grade (para captura de PDF)
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
    handleToggleVisibility,
    handleSelectClass,
    handleToggleExpanded,
    handleRemoveDiscipline,
    loadDisciplines,
    clearList
  } = useDisciplineList(
    isAuthenticated,
    activeScheduleId,
    addDisciplineToList,
    updateDisciplineInList,
    removeDisciplineFromList
  );

  // Hook para carregar disciplinas salvas do banco
  useLoadSavedDisciplines(isAuthenticated, scheduleDisciplines, loadDisciplines);

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
    // Limpa apenas se não há disciplinas do banco sendo carregadas
    // O hook useLoadSavedDisciplines vai popular depois
    if (activeScheduleId !== null) {
      console.log(`🔵 [GradePage] Plano ativo mudou para ${activeScheduleId}, limpando lista local`);
      clearList();
    }
  }, [activeScheduleId]); // Removido clearList das dependências para não causar loop

  // Handler para remover slot
  const handleRemoveSlot = async (slot: GradeSlot) => {
    if (isAuthenticated) {
      if (slot.type === 'class') {
        await removeClass(slot.id);
      } else {
        await removeCustomDiscipline(slot.id);
      }
      reloadActiveScheduleData();
    } else {
      removeLocalSlot(slot.id);
    }
  };

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
    dia: string;
    horario_inicio: string;
    horario_fim: string;
    color?: string;
  }) => {
    if (!isAuthenticated) {
      addLocalSlot({
        type: 'custom',
        color: data.color || SCHEDULE_COLORS[gradeSlots.length % SCHEDULE_COLORS.length],
        dia: data.dia,
        horario_inicio: data.horario_inicio,
        horario_fim: data.horario_fim,
        disciplina_nome: data.nome,
        disciplina_codigo: data.codigo || 'CUSTOM',
        isVisible: true
      });
      return;
    }
    
    const result = await addCustomDiscipline(data);
    return result;
  };

  // Handler para adicionar disciplina da busca ao quadro
  const handleAddDisciplineFromSearch = useCallback(async (discipline: { 
    id: number; 
    codigo: string; 
    nome: string; 
    creditos_aula: number; 
    creditos_trabalho: number 
  }) => {
    // Busca as turmas da disciplina
    try {
      const response = await fetch(`/api/disciplines/${discipline.codigo}/full`);
      if (response.ok) {
        const data = await response.json();
        
        // Usa o id da API /full se o id da busca não existir
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
      console.error('Erro ao carregar turmas:', error);
    }
  }, [handleAddDiscipline]);

  // Aplica a combinação selecionada - seleciona as turmas correspondentes nas disciplinas
  const handleApplyCombination = useCallback((index: number, combination: any) => {
    console.log(`🔵 [GradePage] Aplicando combinação ${index + 1}`);
    
    // Primeiro, aplica a combinação para atualizar o índice e preview
    applyCombination(index, combination);
    
    // Depois, em um microtask, atualiza as turmas selecionadas
    // Isso garante que o índice seja atualizado antes das seleções
    Promise.resolve().then(() => {
      combination.classes.forEach((cls: any) => {
        // Encontra a disciplina correspondente
        const disciplineState = disciplineStates.find(
          d => d.discipline.id === cls.discipline_id
        );
        
        if (disciplineState && cls.id !== disciplineState.selectedClassId) {
          console.log(`🔵 [GradePage] Selecionando turma ${cls.codigo_turma} para ${cls.discipline_codigo}`);
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
      console.error('Erro ao gerar PDF:', error);
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navigation />
      
      {/* Header compacto */}
      <div className="bg-cm-academic text-white py-2 px-4 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bebas tracking-wide">Grade Interativa</h1>
            
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 rounded-full px-3 py-1">
                <Info className="w-4 h-4" />
                <span>Faça login para salvar</span>
                <Link to="/login" className="underline font-medium hover:text-cm-academic-light">
                  Entrar
                </Link>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportPDF}
            disabled={disciplineStates.filter(d => d.isVisible).length === 0}
            className="text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4"
          >
            <Alert variant="destructive" className="max-w-[1800px] mx-auto mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button size="sm" variant="ghost" onClick={() => setError(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1800px] mx-auto w-full p-3 gap-3">
        
        {/* Sidebar esquerda - Filtros, Busca e Lista */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-2"
        >
          {/* Busca de disciplinas */}
          <DisciplineSearch
            onAddClass={handleAddClass}
            onAddToBoard={handleAddDisciplineFromSearch}
            disabled={isSaving}
          />

          {/* Adicionar manualmente */}
          <AddCustomDiscipline
            onAdd={handleAddCustom}
            disabled={isSaving}
            colorIndex={gradeSlots.length}
          />

            {/* Lista de disciplinas selecionadas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 flex-1 overflow-hidden flex flex-col">
              <DisciplineListNew
                disciplines={disciplineStates}
                onToggleVisibility={handleToggleVisibility}
                onSelectClass={handleSelectClass}
                onRemoveDiscipline={handleRemoveDiscipline}
                onToggleExpanded={handleToggleExpanded}
                disabled={isSaving}
                maxDisciplines={10}
              />

              {/* Abas de planos logo abaixo da lista (como no MatrUSP) */}
              {isAuthenticated && (
                <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                  <PlanTabs
                    schedules={schedules}
                    activeScheduleId={activeScheduleId}
                    editingScheduleName={editingScheduleName}
                    onSelectSchedule={setActiveScheduleId}
                    onCreateSchedule={() => createSchedule()}
                    onRenameSchedule={renameSchedule}
                    onDeleteSchedule={deleteSchedule}
                    onDuplicateSchedule={duplicateSchedule}
                    setEditingScheduleName={setEditingScheduleName}
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>
        </motion.div>

        {/* Área central - Grade + Créditos */}
        <div className="flex-1 flex flex-col min-w-0 gap-3">
          {/* Grade */}
          <motion.div
            ref={gradeRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-1 min-h-[400px]"
          >
            {isLoading ? (
              <div className="h-full flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-cm-academic" />
              </div>
            ) : (
              <>
                {/* Aviso de conflitos */}
                {hasConflicts && !showCombinationPreview && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-3 py-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      Existem {conflicts.length} conflito(s) de horário. Ajuste as turmas selecionadas.
                    </span>
                  </div>
                )}
                <GradeGrid
                  slots={displaySlots}
                  timeRange={timeRange}
                  onRemoveSlot={showCombinationPreview ? undefined : handleRemoveSlot}
                  readOnly={isSaving || showCombinationPreview}
                  conflictingSlotIds={conflictingSlotIds}
                />
              </>
            )}
          </motion.div>

          {/* Créditos + Mini-grades de combinações na mesma linha */}
          <div className="flex items-stretch gap-3">
            {/* Créditos compactos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-cm-academic">{displayCredits.creditos_aula}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Aula</div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-lg font-bold text-cm-academic">{displayCredits.creditos_trabalho}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Trabalho</div>
              </div>
            </motion.div>

            {/* Mini-grades de combinações */}
            {disciplineStates.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center overflow-hidden"
              >
                <MiniGradeCombinations
                  combinations={combinations}
                  currentIndex={currentCombinationIndex}
                  onSelectCombination={handleApplyCombination}
                  isGenerating={isGeneratingCombinations}
                  disciplineCount={disciplineStates.length}
                  colors={SCHEDULE_COLORS}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradePage;
