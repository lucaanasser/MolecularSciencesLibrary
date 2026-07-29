import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Check, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DisciplineWithClasses } from '@/utils/combinationsGenerator';
import { Checkbox } from '@/components/ui/checkbox';
import { SCHEDULE_COLORS } from '@/services/UserSchedulesService';
import { tint } from '@/features/grade/utils/disciplineColors';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface DisciplineState {
  discipline: DisciplineWithClasses;
  isVisible: boolean;
  selectedClassId: number | null;
  isExpanded: boolean;
  isCustom?: boolean;
  customDisciplineId?: number;
  creditos_aula?: number;
  creditos_trabalho?: number;
}

interface DisciplineListNewProps {
  disciplines: DisciplineState[];
  onToggleVisibility: (disciplineId: number) => void;
  onSelectClass: (disciplineId: number, classId: number) => void;
  onRemoveDiscipline: (disciplineId: number) => void;
  onDeleteDisciplinePermanently?: (disciplineId: number, customDisciplineId: number) => void;
  onToggleExpanded: (disciplineId: number) => void;
  disabled?: boolean;
  maxDisciplines?: number;
}

/**
 * Lista de disciplinas no estilo "linha": checkbox colorido por disciplina,
 * código colorido, badge de turma, créditos e expansão de turmas.
 */
export function DisciplineListNew({
  disciplines,
  onToggleVisibility,
  onSelectClass,
  onRemoveDiscipline,
  onDeleteDisciplinePermanently,
  onToggleExpanded,
  disabled,
}: DisciplineListNewProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    disciplineId: number;
    customDisciplineId: number;
    nome: string;
  } | null>(null);

  const formatSchedules = (schedules: any[]) => {
    const dayMap: Record<string, string> = {
      'seg': 'Seg', 'ter': 'Ter', 'qua': 'Qua', 'qui': 'Qui', 'sex': 'Sex', 'sab': 'Sáb',
    };
    return schedules.map(s => (
      `${dayMap[s.dia] || s.dia} ${s.horario_inicio}-${s.horario_fim}`
    )).join(', ');
  };

  if (disciplines.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 py-10">
        <BookOpen className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-xs text-center text-gray-400 mb-0">Nenhuma disciplina selecionada</p>
        <p className="text-[11px] text-center mt-1 text-gray-400/70 mb-0">Busque acima para adicionar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
      <AnimatePresence initial={false}>
        {disciplines.map((state, index) => {
          const { discipline, isVisible, selectedClassId, isExpanded, isCustom, customDisciplineId } = state;
          const selectedClass = !isCustom ? discipline.classes.find(c => c.id === selectedClassId) : null;
          const color = SCHEDULE_COLORS[index % SCHEDULE_COLORS.length];
          const totalCreditos = isCustom
            ? (state.creditos_aula || 0) + (state.creditos_trabalho || 0)
            : (discipline.creditos_aula || 0) + (discipline.creditos_trabalho || 0);

          return (
            <motion.div
              key={discipline.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-gray-100 dark:border-gray-700/60 last:border-b-0 group"
            >
              {/* Linha da disciplina */}
              <div className="flex items-center gap-2.5 py-2.5">
                <Checkbox
                  checked={isVisible}
                  onCheckedChange={() => onToggleVisibility(discipline.id)}
                  disabled={disabled}
                  className="w-[1.15rem] border-2"
                  style={{
                    backgroundColor: isVisible ? color : 'transparent',
                    borderColor: isVisible ? color : undefined,
                    color: '#fff',
                  }}
                />

                <button
                  onClick={() => !isCustom && onToggleExpanded(discipline.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-sm font-bold transition-colors"
                      style={{ color: isVisible ? color : undefined }}
                    >
                      <span className={cn(!isVisible && 'text-gray-700 dark:text-gray-300')}>
                        {discipline.codigo}
                      </span>
                    </span>
                    {isCustom ? (
                      <span
                        className="text-[10px] px-1.5 py-px rounded font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: tint(color, 0.18), color }}
                      >
                        Manual
                      </span>
                    ) : selectedClass ? (
                      <span
                        className="text-[10px] px-1.5 py-px rounded font-semibold"
                        style={{ backgroundColor: tint(color, 0.18), color }}
                      >
                        T{selectedClass.codigo_turma?.substring(4)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-0 mt-0.5">
                    {discipline.nome}
                  </p>
                </button>

                {/* Créditos */}
                {totalCreditos > 0 && (
                  <span className="text-[11px] text-gray-400 flex-shrink-0 tabular-nums">
                    {totalCreditos}cr
                  </span>
                )}

                {/* Expandir (regulares) */}
                {!isCustom && (
                  <button
                    onClick={() => onToggleExpanded(discipline.id)}
                    className="p-0.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}

                {/* Remover */}
                <button
                  onClick={() => {
                    if (isCustom && customDisciplineId && onDeleteDisciplinePermanently) {
                      setDeleteConfirm({ disciplineId: discipline.id, customDisciplineId, nome: discipline.nome });
                    } else {
                      onRemoveDiscipline(discipline.id);
                    }
                  }}
                  disabled={disabled}
                  className="p-0.5 rounded text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Remover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Turmas (expandida) */}
              <AnimatePresence>
                {!isCustom && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-2.5 pl-7 space-y-1 max-h-48 overflow-y-auto">
                      {discipline.classes.map(cls => {
                        const active = selectedClassId === cls.id;
                        return (
                          <button
                            key={cls.id}
                            onClick={() => onSelectClass(discipline.id, cls.id)}
                            className={cn(
                              "w-full p-2 rounded-lg text-left transition-colors text-xs border",
                              active ? "border-transparent" : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                            style={active ? { backgroundColor: tint(color, 0.16), borderColor: tint(color, 0.4) } : undefined}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold" style={active ? { color } : undefined}>
                                Turma {cls.codigo_turma?.substring(4)}
                              </span>
                              {active && <Check className="w-3.5 h-3.5" style={{ color }} />}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {formatSchedules(cls.schedules)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Diálogo de confirmação para remoção de disciplina customizada */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={open => { if (!open) setDeleteConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover "{deleteConfirm?.nome}"</AlertDialogTitle>
            <AlertDialogDescription>
              Como deseja remover esta disciplina customizada?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-academic-blue hover:bg-academic-blue-muted text-white"
              onClick={() => {
                if (deleteConfirm) {
                  onRemoveDiscipline(deleteConfirm.disciplineId);
                  setDeleteConfirm(null);
                }
              }}
            >
              Remover do plano
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteConfirm && onDeleteDisciplinePermanently) {
                  onDeleteDisciplinePermanently(deleteConfirm.disciplineId, deleteConfirm.customDisciplineId);
                  setDeleteConfirm(null);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DisciplineListNew;
