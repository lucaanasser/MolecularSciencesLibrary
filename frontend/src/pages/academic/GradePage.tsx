import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Info, AlertCircle, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GradeGrid, DisciplineSearch, PlanTabs, AddCustomDiscipline, DisciplineListNew, MiniGradeCombinations } from "@/features/grade/components";
import { useGradePageLogic } from "@/hooks/useGradePageLogic";

/**
 * Página da Grade Interativa do modo acadêmico.
 * Layout: Sidebar (busca + lista) | Grade + Combinações embaixo | Créditos
 */

const GradePage: React.FC = () => {
  const logic = useGradePageLogic();
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header removido, agora está no layout global */}
      <div className="bg-academic-blue text-white py-2 px-4 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bebas tracking-wide">Grade Interativa</h1>
            {!logic.isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 rounded-full px-3 py-1">
                <Info className="w-4 h-4" />
                <span>Faça login para salvar</span>
                <Link to="/login" className="underline font-medium hover:text-academic-blue-light">
                  Entrar
                </Link>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logic.handleExportPDF}
            disabled={logic.disciplineStates.filter(d => d.isVisible).length === 0}
            className="text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Erro */}
      <AnimatePresence>
        {logic.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4"
          >
            <Alert variant="destructive" className="max-w-[1800px] mx-auto mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{logic.error}</span>
                <Button size="sm" variant="ghost" onClick={() => logic.setError(null)}>
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
            onAddClass={logic.handleAddClass}
            onAddToBoard={logic.handleAddDisciplineFromSearch}
            disabled={logic.isSaving}
          />
          {/* Adicionar manualmente */}
          <AddCustomDiscipline
            onAdd={logic.handleAddCustom}
            disabled={logic.isSaving}
            colorIndex={logic.gradeSlots.length}
          />
            {/* Lista de disciplinas selecionadas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 flex-1 overflow-hidden flex flex-col">
              <DisciplineListNew
                disciplines={logic.disciplineStates}
                onToggleVisibility={logic.handleToggleVisibility}
                onSelectClass={logic.handleSelectClass}
                onRemoveDiscipline={logic.handleRemoveDisciplineFromList}
                onToggleExpanded={logic.handleToggleExpanded}
                disabled={logic.isSaving}
                maxDisciplines={10}
              />
              {/* Abas de planos logo abaixo da lista (como no MatrUSP) */}
              {logic.isAuthenticated && (
                <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                  <PlanTabs
                    schedules={logic.schedules}
                    activeScheduleId={logic.activeScheduleId}
                    editingScheduleName={logic.editingScheduleName}
                    onSelectSchedule={logic.setActiveScheduleId}
                    onCreateSchedule={() => logic.createSchedule()}
                    onRenameSchedule={logic.renameSchedule}
                    onDeleteSchedule={logic.deleteSchedule}
                    onDuplicateSchedule={logic.duplicateSchedule}
                    setEditingScheduleName={logic.setEditingScheduleName}
                    disabled={logic.isSaving}
                  />
                </div>
              )}
            </div>
        </motion.div>
        {/* Área central - Grade + Créditos */}
        <div className="flex-1 flex flex-col min-w-0 gap-3">
          {/* Grade */}
          <motion.div
            ref={logic.gradeRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-1 min-h-[400px]"
          >
            {logic.isLoading ? (
              <div className="h-full flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-academic-blue" />
              </div>
            ) : (
              <>
                {/* Aviso de conflitos */}
                {logic.hasConflicts && !logic.showCombinationPreview && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-3 py-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      Existem {logic.conflicts.length} conflito(s) de horário. Ajuste as turmas selecionadas.
                    </span>
                  </div>
                )}
                <GradeGrid
                  slots={logic.displaySlots}
                  timeRange={logic.timeRange}
                  onRemoveSlot={logic.showCombinationPreview ? undefined : logic.handleRemoveSlot}
                  readOnly={logic.isSaving || logic.showCombinationPreview}
                  conflictingSlotIds={logic.conflictingSlotIds}
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
                <div className="text-lg font-bold text-academic-blue">{logic.displayCredits.creditos_aula}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Aula</div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-lg font-bold text-academic-blue">{logic.displayCredits.creditos_trabalho}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Trabalho</div>
              </div>
            </motion.div>
            {/* Mini-grades de combinações */}
            {logic.disciplineStates.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center overflow-hidden"
              >
                <MiniGradeCombinations
                  combinations={logic.combinations}
                  currentIndex={logic.currentCombinationIndex}
                  onSelectCombination={logic.handleApplyCombination}
                  isGenerating={logic.isGeneratingCombinations}
                  disciplineCount={logic.disciplineStates.length}
                  colors={logic.SCHEDULE_COLORS}
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
