import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Info, AlertCircle, Loader2, BookOpen, X } from "lucide-react";
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
import { 
  generateCombinations, 
  DisciplineWithClasses, 
  Combination,
  ClassOption
} from "@/utils/combinationsGenerator";

/**
 * Página da Grade Interativa do modo acadêmico.
 * Layout: Sidebar (busca + lista) | Grade + Combinações embaixo | Créditos
 */
const GradePage: React.FC = () => {
  console.log("🔵 [GradePage] Renderizando página da grade interativa");

  const {
    schedules,
    activeScheduleId,
    gradeSlots,
    credits,
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

  // Estado para lista de disciplinas com seleção de turmas
  interface DisciplineState {
    discipline: DisciplineWithClasses;
    isVisible: boolean;
    selectedClassId: number | null;
    isExpanded: boolean;
  }
  
  const [disciplineStates, setDisciplineStates] = useState<DisciplineState[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [currentCombinationIndex, setCurrentCombinationIndex] = useState(0);
  const [isGeneratingCombinations, setIsGeneratingCombinations] = useState(false);
  
  // Estados de UI
  const [showCombinationPreview, setShowCombinationPreview] = useState(false);
  
  // Filtros de busca
  const [campusFilter, setCampusFilter] = useState('todos');
  const [unidadeFilter, setUnidadeFilter] = useState('todas');
  
  // Preview: slots da combinação selecionada
  const [previewSlots, setPreviewSlots] = useState<GradeSlot[]>([]);

  // Carrega disciplinas salvas do banco quando scheduleDisciplines mudar
  useEffect(() => {
    const loadSavedDisciplines = async () => {
      if (!isAuthenticated || !scheduleDisciplines || scheduleDisciplines.length === 0) {
        return;
      }

      // Para cada disciplina salva, carrega os dados completos (com turmas)
      const loadedStates: DisciplineState[] = [];
      
      for (const savedDiscipline of scheduleDisciplines) {
        try {
          const response = await fetch(`/api/disciplines/${savedDiscipline.discipline_codigo}/full`);
          if (response.ok) {
            const data = await response.json();
            
            const disciplineWithClasses: DisciplineWithClasses = {
              id: savedDiscipline.discipline_id,
              codigo: savedDiscipline.discipline_codigo,
              nome: savedDiscipline.discipline_nome,
              creditos_aula: Number(savedDiscipline.creditos_aula) || 0,
              creditos_trabalho: Number(savedDiscipline.creditos_trabalho) || 0,
              classes: (data.turmas || []).map((cls: any) => ({
                id: cls.id,
                codigo_turma: cls.codigo_turma,
                discipline_id: savedDiscipline.discipline_id,
                discipline_codigo: savedDiscipline.discipline_codigo,
                discipline_nome: savedDiscipline.discipline_nome,
                schedules: cls.schedules || [],
                professors: cls.professors || []
              }))
            };
            
            loadedStates.push({
              discipline: disciplineWithClasses,
              isVisible: Boolean(savedDiscipline.is_visible),
              selectedClassId: savedDiscipline.selected_class_id,
              isExpanded: Boolean(savedDiscipline.is_expanded)
            });
          }
        } catch (error) {
          console.error(`Erro ao carregar disciplina ${savedDiscipline.discipline_codigo}:`, error);
        }
      }
      
      if (loadedStates.length > 0) {
        setDisciplineStates(loadedStates);
      }
    };

    loadSavedDisciplines();
  }, [isAuthenticated, scheduleDisciplines]);

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

  // Exportar para PDF
  const handleExportPDF = () => {
    alert('Funcionalidade de exportação em breve!');
  };

  // ============= LÓGICA DE DISCIPLINAS E TURMAS =============

  // Adiciona disciplina à lista
  const handleAddToDisciplineList = useCallback(async (discipline: DisciplineWithClasses) => {
    // Evita duplicatas
    if (disciplineStates.some(d => d.discipline.id === discipline.id)) {
      return;
    }

    // Seleciona automaticamente a primeira turma disponível
    const firstClass = discipline.classes[0];
    const newState = {
      discipline,
      isVisible: true,
      selectedClassId: firstClass?.id || null,
      isExpanded: false
    };

    // Atualiza estado local
    setDisciplineStates(prev => [...prev, newState]);

    // Salva no banco se autenticado
    if (isAuthenticated && activeScheduleId) {
      await addDisciplineToList(discipline.id, {
        selectedClassId: newState.selectedClassId,
        isVisible: true,
        isExpanded: false
      });
    }
  }, [disciplineStates, isAuthenticated, activeScheduleId, addDisciplineToList]);

  // Toggle visibilidade de uma disciplina
  const handleToggleVisibility = useCallback(async (disciplineId: number) => {
    const discipline = disciplineStates.find(d => d.discipline.id === disciplineId);
    if (!discipline) return;

    const newIsVisible = !discipline.isVisible;
    
    // Atualiza estado local
    setDisciplineStates(prev => prev.map(d =>
      d.discipline.id === disciplineId ? { ...d, isVisible: newIsVisible } : d
    ));

    // Salva no banco se autenticado
    if (isAuthenticated && activeScheduleId) {
      await updateDisciplineInList(disciplineId, { isVisible: newIsVisible });
    }
  }, [disciplineStates, isAuthenticated, activeScheduleId, updateDisciplineInList]);

  // Seleciona turma específica
  const handleSelectClass = useCallback(async (disciplineId: number, classId: number) => {
    // Atualiza estado local
    setDisciplineStates(prev => prev.map(d =>
      d.discipline.id === disciplineId ? { ...d, selectedClassId: classId } : d
    ));

    // Salva no banco se autenticado
    if (isAuthenticated && activeScheduleId) {
      await updateDisciplineInList(disciplineId, { selectedClassId: classId });
    }
  }, [isAuthenticated, activeScheduleId, updateDisciplineInList]);

  // Toggle expansão
  const handleToggleExpanded = useCallback(async (disciplineId: number) => {
    const discipline = disciplineStates.find(d => d.discipline.id === disciplineId);
    if (!discipline) return;

    const newIsExpanded = !discipline.isExpanded;
    
    // Atualiza estado local
    setDisciplineStates(prev => prev.map(d =>
      d.discipline.id === disciplineId ? { ...d, isExpanded: newIsExpanded } : d
    ));

    // Salva no banco se autenticado
    if (isAuthenticated && activeScheduleId) {
      await updateDisciplineInList(disciplineId, { isExpanded: newIsExpanded });
    }
  }, [disciplineStates, isAuthenticated, activeScheduleId, updateDisciplineInList]);

  // Remove disciplina da lista
  const handleRemoveFromDisciplineList = useCallback(async (disciplineId: number) => {
    // Atualiza estado local
    setDisciplineStates(prev => prev.filter(d => d.discipline.id !== disciplineId));

    // Salva no banco se autenticado
    if (isAuthenticated && activeScheduleId) {
      await removeDisciplineFromList(disciplineId);
    }
  }, [isAuthenticated, activeScheduleId, removeDisciplineFromList]);

  // Adiciona disciplina da busca ao quadro
  const handleAddDisciplineFromSearch = useCallback(async (discipline: { id: number; codigo: string; nome: string; creditos_aula: number; creditos_trabalho: number }) => {
    // Evita duplicatas
    if (disciplineStates.some(d => d.discipline.id === discipline.id)) {
      return;
    }

    // Busca as turmas da disciplina
    try {
      const response = await fetch(`/api/disciplines/${discipline.codigo}/full`);
      if (response.ok) {
        const data = await response.json();
        
        const disciplineWithClasses: DisciplineWithClasses = {
          id: discipline.id,
          codigo: discipline.codigo,
          nome: discipline.nome,
          creditos_aula: Number(discipline.creditos_aula) || 0,
          creditos_trabalho: Number(discipline.creditos_trabalho) || 0,
          classes: (data.turmas || []).map((cls: any) => ({
            id: cls.id,
            codigo_turma: cls.codigo_turma,
            discipline_id: discipline.id,
            discipline_codigo: discipline.codigo,
            discipline_nome: discipline.nome,
            schedules: cls.schedules || [],
            professors: cls.professors || []
          }))
        };
        
        handleAddToDisciplineList(disciplineWithClasses);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  }, [disciplineStates, handleAddToDisciplineList]);

  // Gera slots da grade a partir das disciplinas visíveis
  const disciplineSlots = useMemo(() => {
    const slots: GradeSlot[] = [];
    
    disciplineStates.forEach((state, index) => {
      if (!state.isVisible || !state.selectedClassId) return;

      const selectedClass = state.discipline.classes.find(c => c.id === state.selectedClassId);
      if (!selectedClass) return;

      const color = SCHEDULE_COLORS[index % SCHEDULE_COLORS.length];

      selectedClass.schedules.forEach(schedule => {
        slots.push({
          type: 'class',
          id: selectedClass.id,
          color,
          dia: schedule.dia,
          horario_inicio: schedule.horario_inicio,
          horario_fim: schedule.horario_fim,
          disciplina_nome: state.discipline.nome,
          disciplina_codigo: state.discipline.codigo,
          turma_codigo: selectedClass.codigo_turma,
          professor: selectedClass.professors?.[0]?.nome,
          isVisible: true
        });
      });
    });

    return slots;
  }, [disciplineStates, SCHEDULE_COLORS]);

  // Gera combinações quando a lista de disciplinas muda (opcional)
  useEffect(() => {
    const visibleDisciplines = disciplineStates
      .filter(d => d.isVisible)
      .map(d => d.discipline);

    if (visibleDisciplines.length === 0) {
      setCombinations([]);
      setPreviewSlots([]);
      return;
    }

    setIsGeneratingCombinations(true);
    
    // Usa setTimeout para não travar a UI
    const timer = setTimeout(() => {
      const newCombinations = generateCombinations(visibleDisciplines, 100);
      setCombinations(newCombinations);
      setCurrentCombinationIndex(0);
      
      // Atualiza preview com a primeira combinação
      if (newCombinations.length > 0) {
        updatePreviewSlots(newCombinations[0]);
      } else {
        setPreviewSlots([]);
      }
      
      setIsGeneratingCombinations(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [disciplineStates]);

  // Atualiza preview quando muda a combinação selecionada
  const updatePreviewSlots = useCallback((combination: Combination) => {
    const slots: GradeSlot[] = [];
    
    combination.classes.forEach((cls, index) => {
      const color = SCHEDULE_COLORS[index % SCHEDULE_COLORS.length];
      
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
  }, [SCHEDULE_COLORS]);

  // Quando muda o índice da combinação, atualiza o preview
  useEffect(() => {
    if (combinations.length > 0 && combinations[currentCombinationIndex]) {
      updatePreviewSlots(combinations[currentCombinationIndex]);
    }
  }, [currentCombinationIndex, combinations, updatePreviewSlots]);

  // Aplica a combinação selecionada - seleciona as turmas correspondentes nas disciplinas
  const handleApplyCombination = useCallback((index: number, combination: Combination) => {
    setCurrentCombinationIndex(index);
    
    // Para cada turma na combinação, encontra a disciplina e seleciona a turma correta
    setDisciplineStates(prev => prev.map(state => {
      // Encontra se há uma turma desta disciplina na combinação
      const matchingClass = combination.classes.find(
        cls => cls.discipline_id === state.discipline.id || cls.discipline_codigo === state.discipline.codigo
      );
      
      if (matchingClass) {
        // Seleciona a turma da combinação e torna visível
        return {
          ...state,
          selectedClassId: matchingClass.id,
          isVisible: true
        };
      }
      
      // Se não está na combinação, mantém invisível
      return {
        ...state,
        isVisible: false
      };
    }));
  }, []);

  // Keyboard navigation for combinations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (combinations.length === 0) return;
      
      if (e.key === 'ArrowLeft' && currentCombinationIndex > 0) {
        setCurrentCombinationIndex(prev => prev - 1);
        setShowCombinationPreview(true);
      } else if (e.key === 'ArrowRight' && currentCombinationIndex < combinations.length - 1) {
        setCurrentCombinationIndex(prev => prev + 1);
        setShowCombinationPreview(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combinations.length, currentCombinationIndex]);

  // Slots a exibir: preview de combinação ou disciplinas selecionadas manualmente
  const displaySlots = useMemo(() => {
    if (showCombinationPreview && previewSlots.length > 0) {
      return previewSlots;
    }
    return [...gradeSlots, ...disciplineSlots];
  }, [showCombinationPreview, previewSlots, gradeSlots, disciplineSlots]);

  // Créditos a exibir
  const displayCredits = useMemo(() => {
    if (showCombinationPreview && combinations[currentCombinationIndex]) {
      return {
        creditos_aula: combinations[currentCombinationIndex].totalCreditsAula || 0,
        creditos_trabalho: combinations[currentCombinationIndex].totalCreditsTrabalho || 0
      };
    }
    
    // Créditos das disciplinas visíveis (apenas as adicionadas pela lista)
    const disciplineCredits = disciplineStates
      .filter(d => d.isVisible)
      .reduce((acc, d) => ({
        creditos_aula: acc.creditos_aula + (d.discipline.creditos_aula || 0),
        creditos_trabalho: acc.creditos_trabalho + (d.discipline.creditos_trabalho || 0)
      }), { creditos_aula: 0, creditos_trabalho: 0 });

    // Retorna apenas os créditos das disciplinas visíveis (não soma com credits pois seria duplicação)
    return disciplineCredits;
  }, [showCombinationPreview, combinations, currentCombinationIndex, disciplineStates]);

  // Lista única de disciplinas na grade
  const uniqueDisciplines = Array.from(
    new Map(gradeSlots.map(s => [s.disciplina_codigo, s])).values()
  );

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
            disabled={gradeSlots.length === 0}
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
            {disciplineStates.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-8">
                <BookOpen className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs text-center">Nenhuma disciplina selecionada</p>
                <p className="text-xs text-center mt-1 opacity-70">Busque acima para adicionar</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1.5 mb-3">
                <DisciplineListNew
                  disciplines={disciplineStates}
                  onToggleVisibility={handleToggleVisibility}
                  onSelectClass={handleSelectClass}
                  onRemoveDiscipline={handleRemoveFromDisciplineList}
                  onToggleExpanded={handleToggleExpanded}
                  disabled={isSaving}
                  maxDisciplines={10}
                />
              </div>
            )}

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-1 min-h-[400px]"
          >
            {isLoading ? (
              <div className="h-full flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-cm-academic" />
              </div>
            ) : (
              <GradeGrid
                slots={displaySlots}
                timeRange={timeRange}
                onRemoveSlot={showCombinationPreview ? undefined : handleRemoveSlot}
                readOnly={isSaving || showCombinationPreview}
              />
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
