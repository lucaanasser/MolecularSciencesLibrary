import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DisciplineWithClasses, ClassOption } from '@/utils/combinationsGenerator';
import { Checkbox } from '@/components/ui/checkbox';

interface DisciplineState {
  discipline: DisciplineWithClasses;
  isVisible: boolean;
  selectedClassId: number | null;
  isExpanded: boolean;
}

interface DisciplineListNewProps {
  disciplines: DisciplineState[];
  onToggleVisibility: (disciplineId: number) => void;
  onSelectClass: (disciplineId: number, classId: number) => void;
  onRemoveDiscipline: (disciplineId: number) => void;
  onToggleExpanded: (disciplineId: number) => void;
  disabled?: boolean;
  maxDisciplines?: number;
}

/**
 * Lista de disciplinas com checkboxes e seleção de turmas
 * Inspirada no MatrUSP
 */
export function DisciplineListNew({
  disciplines,
  onToggleVisibility,
  onSelectClass,
  onRemoveDiscipline,
  onToggleExpanded,
  disabled,
  maxDisciplines = 10
}: DisciplineListNewProps) {
  // Calcula créditos totais das disciplinas visíveis
  const totalCredits = disciplines
    .filter(d => d.isVisible)
    .reduce((acc, d) => ({
      aula: acc.aula + d.discipline.creditos_aula,
      trabalho: acc.trabalho + d.discipline.creditos_trabalho
    }), { aula: 0, trabalho: 0 });

  // Formata horários
  const formatSchedules = (schedules: any[]) => {
    const dayMap: Record<string, string> = {
      'seg': 'Seg',
      'ter': 'Ter',
      'qua': 'Qua',
      'qui': 'Qui',
      'sex': 'Sex',
      'sab': 'Sáb'
    };

    return schedules.map(s => (
      `${dayMap[s.dia] || s.dia} ${s.horario_inicio}-${s.horario_fim}`
    )).join(', ');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cm-academic" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Lista de Disciplinas
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {disciplines.length}/{maxDisciplines}
        </span>
      </div>

      {/* Lista de disciplinas */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {disciplines.map((state) => {
            const { discipline, isVisible, selectedClassId, isExpanded } = state;
            const selectedClass = discipline.classes.find(c => c.id === selectedClassId);

            return (
              <motion.div
                key={discipline.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                className={cn(
                  "rounded-lg border",
                  "bg-gray-50 dark:bg-gray-800/50",
                  isVisible 
                    ? "border-cm-academic" 
                    : "border-gray-200 dark:border-gray-700",
                  "group overflow-hidden"
                )}
              >
                {/* Header da disciplina */}
                <div className="flex items-center gap-2 p-2">
                  {/* Checkbox */}
                  <Checkbox
                    checked={isVisible}
                    onCheckedChange={() => onToggleVisibility(discipline.id)}
                    disabled={disabled}
                    className={cn(
                      "border-2",
                      isVisible && "data-[state=checked]:bg-cm-academic data-[state=checked]:border-cm-academic"
                    )}
                  />

                  {/* Info da disciplina */}
                  <button
                    onClick={() => onToggleExpanded(discipline.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cm-academic">
                        {discipline.codigo}
                      </span>
                      <span className="text-xs text-gray-500">
                        {discipline.classes.length} {discipline.classes.length === 1 ? 'turma' : 'turmas'}
                      </span>
                      {selectedClass && (
                        <span className="text-xs bg-cm-academic text-white px-1.5 py-0.5 rounded">
                          {selectedClass.codigo_turma}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {discipline.nome}
                    </p>
                  </button>

                  {/* Botões */}
                  <button
                    onClick={() => onToggleExpanded(discipline.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={() => onRemoveDiscipline(discipline.id)}
                    disabled={disabled}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Lista de turmas (expandida) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                        {discipline.classes.map(cls => (
                          <button
                            key={cls.id}
                            onClick={() => onSelectClass(discipline.id, cls.id)}
                            className={cn(
                              "w-full p-2 rounded text-left transition-colors text-xs",
                              selectedClassId === cls.id
                                ? "bg-cm-academic text-white"
                                : "hover:bg-gray-200 dark:hover:bg-gray-700"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Turma {cls.codigo_turma}</span>
                              {selectedClassId === cls.id && (
                                <Check className="w-4 h-4" />
                              )}
                            </div>
                            <div className="text-[10px] opacity-80 mt-0.5">
                              {formatSchedules(cls.schedules)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Estado vazio */}
      {disciplines.length === 0 && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">
            Busque disciplinas acima para adicionar
          </p>
        </div>
      )}

      {/* Créditos totais */}
      {disciplines.length > 0 && (
        <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400">
            Visíveis: <strong className="text-cm-academic">{totalCredits.aula}</strong> aula + <strong className="text-cm-academic">{totalCredits.trabalho}</strong> trabalho
          </span>
        </div>
      )}
    </div>
  );
}

export default DisciplineListNew;
