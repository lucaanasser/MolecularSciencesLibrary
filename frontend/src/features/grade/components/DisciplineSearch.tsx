import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, ChevronDown, ChevronUp, Clock, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import userSchedulesService from '@/services/UserSchedulesService';

// Tipos para disciplinas vindas da API
interface DisciplineClass {
  id: number;
  codigo_turma: string;
  tipo: string;
  inicio: string;
  fim: string;
  observacoes?: string;
  schedules: Array<{
    id: number;
    dia: string;
    horario_inicio: string;
    horario_fim: string;
  }>;
  professors: Array<{
    id: number;
    nome: string;
  }>;
}

interface Discipline {
  id: number;
  codigo: string;
  nome: string;
  unidade: string;
  campus: string;
  creditos_aula: number;
  creditos_trabalho: number;
  classes?: DisciplineClass[];
  isCustom?: boolean;
  customId?: number;
  color?: string;
  schedules?: Array<{
    dia: string;
    horario_inicio: string;
    horario_fim: string;
  }>;
}

interface DisciplineSearchProps {
  onAddClass?: (classId: number) => Promise<{ success: boolean; conflicts?: any[] }>;
  onAddToBoard?: (discipline: Discipline) => void;
  onSelectDiscipline?: (discipline: Discipline) => void;
  selectActionLabel?: string;
  selectActionTitle?: string;
  includeCustom?: boolean;
  showClasses?: boolean;
  disabled?: boolean;
}

/**
 * Componente de busca de disciplinas
 * Permite buscar disciplinas e adicionar turmas à grade
 */
export function DisciplineSearch({
  onAddClass,
  onAddToBoard,
  onSelectDiscipline,
  selectActionLabel = "Selecionar",
  selectActionTitle = "Usar disciplina",
  includeCustom = true,
  showClasses = true,
  disabled,
}: DisciplineSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Discipline[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedDiscipline, setExpandedDiscipline] = useState<number | null>(null);
  const [loadingClasses, setLoadingClasses] = useState<number | null>(null);
  const [addingClass, setAddingClass] = useState<number | null>(null);
  const [conflictWarning, setConflictWarning] = useState<{ classId: number; conflicts: any[] } | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Busca disciplinas com debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Busca disciplinas regulares
        const regularResponse = await fetch(`/api/academic/disciplines/search?q=${encodeURIComponent(query)}&limit=10`);
        let regularDisciplines: Discipline[] = [];
        if (regularResponse.ok) {
          regularDisciplines = await regularResponse.json();
        }

        // Busca disciplinas customizadas do usuário
        let customDisciplines: Discipline[] = [];
        if (includeCustom) {
          try {
            const customs = await userSchedulesService.getCustomDisciplines();

            // Filtra disciplinas customizadas que correspondem à busca
            customDisciplines = customs
              .filter((custom) =>
                custom.nome.toLowerCase().includes(query.toLowerCase()) ||
                (custom.codigo && custom.codigo.toLowerCase().includes(query.toLowerCase()))
              )
              .map((custom) => ({
                id: custom.id,
                customId: custom.id, // Guarda o ID original da customizada
                codigo: custom.codigo || 'CUSTOM',
                nome: custom.nome,
                unidade: 'Personalizada',
                campus: 'Manual',
                creditos_aula: custom.creditos_aula || 0,
                creditos_trabalho: custom.creditos_trabalho || 0,
                isCustom: true,
                color: custom.color,
                schedules: custom.schedules || []
              }));
          } catch (error) {
            console.log(`🔴 [DisciplineSearch] Erro ao buscar disciplinas customizadas:`, error);
          }
        }

        // Combina resultados - customizadas primeiro
        setResults([...customDisciplines, ...regularDisciplines]);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  // Carrega turmas de uma disciplina
  const loadClasses = useCallback(async (disciplineId: number, codigo: string) => {
    if (!showClasses) return;
    if (expandedDiscipline === disciplineId) {
      setExpandedDiscipline(null);
      return;
    }

    setLoadingClasses(disciplineId);
    try {
      const response = await fetch(`/api/academic/disciplines/${codigo}/full`);
      if (response.ok) {
        const data = await response.json();
        setResults(prev => prev.map(d =>
          d.id === disciplineId ? { ...d, classes: data.turmas || [] } : d
        ));
        setExpandedDiscipline(disciplineId);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    } finally {
      setLoadingClasses(null);
    }
  }, [expandedDiscipline]);

  // Adiciona uma turma
  const handleAddClass = useCallback(async (classId: number) => {
    if (!onAddClass) return;
    setAddingClass(classId);
    setConflictWarning(null);

    try {
      const result = await onAddClass(classId);

      if (!result.success && result.conflicts && result.conflicts.length > 0) {
        setConflictWarning({ classId, conflicts: result.conflicts });
      }
    } catch (error) {
      console.error('Erro ao adicionar turma:', error);
    } finally {
      setAddingClass(null);
    }
  }, [onAddClass]);

  // Formata horários de uma turma
  const formatSchedules = (schedules: DisciplineClass['schedules']) => {
    const dayMap: Record<string, string> = {
      'seg': 'Seg', 'ter': 'Ter', 'qua': 'Qua', 'qui': 'Qui', 'sex': 'Sex', 'sab': 'Sáb',
    };
    return schedules.map(s => (
      `${dayMap[s.dia] || s.dia} ${s.horario_inicio}-${s.horario_fim}`
    )).join(', ');
  };

  return (
    <div>
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar disciplina..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          className="pl-9 pr-9 h-10 rounded-xl bg-gray-100 dark:bg-gray-900/50 border-transparent focus-visible:bg-white dark:focus-visible:bg-gray-900 focus-visible:ring-academic-blue"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-blue animate-spin" />
        )}
      </div>

      {/* Resultados */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5"
          >
            {results.map(discipline => (
              <div key={discipline.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50/60 dark:bg-gray-900/30"
              >
                {/* Header da disciplina */}
                <div className="flex items-stretch">
                  <button
                    onClick={() => loadClasses(discipline.id, discipline.codigo)}
                    className={cn(
                      "flex-1 p-2.5 flex items-start justify-between text-left gap-2",
                      "hover:bg-academic-blue/5 transition-colors",
                      expandedDiscipline === discipline.id && "bg-academic-blue/10"
                    )}
                    disabled={!showClasses}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-academic-blue">
                          {discipline.codigo}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {discipline.creditos_aula}+{discipline.creditos_trabalho}c
                        </span>
                        {discipline.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-academic-blue-muted/20 text-academic-blue font-semibold uppercase tracking-wide">
                            Manual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate mb-0 mt-0.5">
                        {discipline.nome}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mb-0">
                        {discipline.unidade} · {discipline.campus}
                      </p>
                    </div>
                    {showClasses && (
                      <div className="flex-shrink-0 self-center">
                        {loadingClasses === discipline.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-academic-blue" />
                        ) : expandedDiscipline === discipline.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Botão adicionar ao quadro */}
                  {onAddToBoard && (
                    <button
                      onClick={() => onAddToBoard(discipline)}
                      disabled={disabled}
                      className="flex items-center justify-center px-3 border-l border-gray-200 dark:border-gray-700 bg-academic-blue/5 hover:bg-academic-blue hover:text-white text-academic-blue transition-colors"
                      title="Adicionar à grade"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}

                  {/* Botão selecionar disciplina */}
                  {onSelectDiscipline && !onAddToBoard && (
                    <button
                      onClick={() => onSelectDiscipline(discipline)}
                      disabled={disabled}
                      className="flex items-center px-3 border-l border-gray-200 dark:border-gray-700 hover:bg-academic-blue hover:text-white text-academic-blue text-xs font-semibold transition-colors"
                      title={selectActionTitle}
                    >
                      {selectActionLabel}
                    </button>
                  )}
                </div>

                {/* Lista de turmas */}
                <AnimatePresence>
                  {showClasses && expandedDiscipline === discipline.id && discipline.classes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      {discipline.classes.length === 0 ? (
                        <div className="p-3 text-xs text-gray-400 text-center">
                          Nenhuma turma disponível
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {discipline.classes.map(cls => (
                            <div key={cls.id} className="p-2.5">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                  Turma {cls.codigo_turma?.substring(4)}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                  {cls.tipo}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>{formatSchedules(cls.schedules)}</span>
                              </div>
                              {cls.professors && cls.professors.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                  <User className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{cls.professors.map(p => p.nome).join(', ')}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span>{cls.inicio} - {cls.fim}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensagem quando não há resultados */}
      {query.length >= 2 && !isSearching && results.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4 mb-0">
          Nenhuma disciplina encontrada
        </p>
      )}
    </div>
  );
}

export default DisciplineSearch;
