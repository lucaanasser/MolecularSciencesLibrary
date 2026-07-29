import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, AlertCircle, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { GradeGrid, DisciplineSearch, PlanTabs, AddCustomDiscipline, DisciplineListNew, MiniGradeCombinations } from "@/features/grade/components";
import { useGradePageLogic } from "@/hooks/useGradePageLogic";
import { Schedule } from "@/services/UserSchedulesService";

/**
 * Página da Grade Interativa do modo acadêmico.
 * Layout full-height (sem rolagem): cabeçalho + sidebar de disciplinas + grade.
 */

const GradePage: React.FC = () => {
  const logic = useGradePageLogic();
  const totalCount = logic.disciplineStates.length;
  const visibleCount = logic.disciplineStates.filter(d => d.isVisible).length;

  // Abas de planos: convidados (não logados) veem um "Plano 1" local — os planos
  // de verdade são salvos por usuário no banco, então criar/gerenciar vários exige login.
  const isGuest = !logic.isAuthenticated;
  const GUEST_PLAN: Schedule = {
    id: -1,
    name: "Plano 1",
    user_id: 0,
    is_active: true,
    is_deleted: false,
    created_at: "",
    updated_at: "",
  };
  const planSchedules = isGuest ? [GUEST_PLAN] : logic.schedules;
  const planActiveId = isGuest ? -1 : logic.activeScheduleId;
  const handleCreatePlan = isGuest
    ? () => toast.info("Entre para criar e salvar vários planos.")
    : () => logic.createSchedule();

  return (
    <div className="h-[calc(100vh-6rem)] bg-default-bg dark:bg-gray-900 flex flex-col overflow-hidden font-dmsans">
      <div className="max-w-[1700px] mx-auto w-full flex-1 min-h-0 flex flex-col px-5 lg:px-8 py-4">
        {/* ===== Cabeçalho ===== */}
        <header className="flex-shrink-0 flex items-center justify-between gap-4 flex-wrap mb-2">
          <div className="flex items-center gap-4 ml-auto">
            {!logic.isAuthenticated && (
              <p className="hidden sm:block text-sm text-gray-400 mb-0">
                Faça login para salvar ·{" "}
                <Link to="/entrar" className="text-academic-blue font-semibold hover:underline">
                  Entrar
                </Link>
              </p>
            )}
            <button
              onClick={logic.handleExportPDF}
              disabled={visibleCount === 0}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:border-academic-blue hover:text-academic-blue transition-colors disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </header>

        {/* ===== Erro ===== */}
        <AnimatePresence>
          {logic.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-shrink-0 mb-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <div className="px-4 py-2 flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{logic.error}</span>
                <button onClick={() => logic.setError(null)} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Corpo ===== */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5">
          {/* --- Sidebar --- */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 xl:w-[21rem] flex-shrink-0 flex flex-col min-h-0"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex-1 min-h-0 flex flex-col">
              <DisciplineSearch
                onAddClass={logic.handleAddClass}
                onAddToBoard={logic.handleAddDisciplineFromSearch}
                disabled={logic.isSaving}
              />

              {/* Cabeçalho da lista */}
              <div className="flex items-center justify-between mt-4 mb-1 flex-shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Disciplinas
                  {totalCount > 0 && (
                    <span className="text-gray-300 dark:text-gray-600"> · {visibleCount} de {totalCount}</span>
                  )}
                </span>
                <AddCustomDiscipline
                  onAdd={logic.handleAddCustom}
                  disabled={logic.isSaving}
                  colorIndex={logic.gradeSlots.length}
                />
              </div>

              <DisciplineListNew
                disciplines={logic.disciplineStates}
                onToggleVisibility={logic.handleToggleVisibility}
                onSelectClass={logic.handleSelectClass}
                onRemoveDiscipline={logic.handleRemoveDisciplineFromList}
                onDeleteDisciplinePermanently={logic.handlePermanentDeleteFromList}
                onToggleExpanded={logic.handleToggleExpanded}
                disabled={logic.isSaving}
                maxDisciplines={10}
              />

              {/* Resumo de créditos (subtotal da lista) */}
              <div className="flex-shrink-0 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className="font-bebas text-2xl text-gray-800 dark:text-white leading-none">{logic.displayCredits.creditos_aula}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">créd. aula</div>
                </div>
                <div>
                  <div className="font-bebas text-2xl text-gray-800 dark:text-white leading-none">{logic.displayCredits.creditos_trabalho}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">créd. trab.</div>
                </div>
                <div>
                  <div className="font-bebas text-2xl text-gray-800 dark:text-white leading-none">{visibleCount}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">disc.</div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* --- Área central --- */}
          <main className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
            {/* Abas de planos + grade conectadas */}
            <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-shrink-0">
              <PlanTabs
                schedules={planSchedules}
                activeScheduleId={planActiveId}
                editingScheduleName={logic.editingScheduleName}
                onSelectSchedule={isGuest ? () => {} : logic.setActiveScheduleId}
                onCreateSchedule={handleCreatePlan}
                onRenameSchedule={logic.renameSchedule}
                onDeleteSchedule={logic.deleteSchedule}
                onDuplicateSchedule={logic.duplicateSchedule}
                setEditingScheduleName={logic.setEditingScheduleName}
                disabled={logic.isSaving}
                allowManage={!isGuest}
              />
            </div>

            {/* Grade */}
            <motion.div
              ref={logic.gradeRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 shadow-md overflow-hidden flex-1 min-h-0 flex flex-col rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-700"
            >
              {logic.isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-academic-blue" />
                </div>
              ) : (
                <>
                  {logic.hasConflicts && !logic.showCombinationPreview && (
                    <div className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-1.5 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-xs text-red-700 dark:text-red-300">
                        {logic.conflicts.length} conflito(s) de horário — ajuste as turmas selecionadas.
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
            </div>

            {/* Barra inferior: combinações */}
            {totalCount > 0 && (
              <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 px-4 py-2.5 flex items-center">
                <div className="flex-1 min-w-0 flex justify-end">
                  <MiniGradeCombinations
                    combinations={logic.combinations}
                    currentIndex={logic.currentCombinationIndex}
                    onSelectCombination={logic.handleApplyCombination}
                    isGenerating={logic.isGeneratingCombinations}
                    disciplineCount={totalCount}
                    colors={logic.SCHEDULE_COLORS}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default GradePage;
