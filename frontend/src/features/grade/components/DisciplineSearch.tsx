import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, AlertTriangle, Loader2, ChevronDown, ChevronUp, Clock, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
}

interface DisciplineSearchProps {
  onAddClass: (classId: number) => Promise<{ success: boolean; conflicts?: any[] }>;
  onAddToBoard?: (discipline: Discipline) => void;
  disabled?: boolean;
}

/**
 * Componente de busca de disciplinas
 * Permite buscar disciplinas e adicionar turmas à grade
 */
export function DisciplineSearch({ onAddClass, onAddToBoard, disabled }: DisciplineSearchProps) {
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
        const response = await fetch(`/api/disciplines/search?q=${encodeURIComponent(query)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
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
    if (expandedDiscipline === disciplineId) {
      setExpandedDiscipline(null);
      return;
    }

    setLoadingClasses(disciplineId);
    try {
      const response = await fetch(`/api/disciplines/${codigo}/full`);
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
    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-1.5">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar disciplina..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          className="pl-7 pr-7 h-7 text-xs"
        />
        {isSearching && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-cm-academic animate-spin" />
        )}
      </div>

      {/* Resultados */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1.5 space-y-0.5 max-h-[300px] overflow-y-auto"
          >
            {results.map(discipline => (
              <div key={discipline.id}
                className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden"
              >
                {/* Header da disciplina */}
                <div className="flex items-start">
                  <button
                    onClick={() => loadClasses(discipline.id, discipline.codigo)}
                    className={cn(
                      "flex-1 p-1.5 flex items-start justify-between text-left",
                      "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                      expandedDiscipline === discipline.id && "bg-cm-academic-bg dark:bg-gray-800"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cm-academic">
                          {discipline.codigo}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {discipline.creditos_aula}+{discipline.creditos_trabalho}c
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {discipline.nome}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {discipline.unidade} - {discipline.campus}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {loadingClasses === discipline.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cm-academic" />
                      ) : expandedDiscipline === discipline.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Botão adicionar ao quadro */}
                  {onAddToBoard && (
                    <div className="flex items-center border-l border-gray-200 dark:border-gray-700">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          loadClasses(discipline.id, discipline.codigo);
                          onAddToBoard(discipline);
                        }}
                        disabled={disabled}
                        className="h-full px-3 rounded-none hover:bg-cm-academic hover:text-white"
                        title="Adicionar ao quadro"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Lista de turmas */}
                <AnimatePresence>
                  {expandedDiscipline === discipline.id && discipline.classes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      {discipline.classes.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">
                          Nenhuma turma disponível
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {discipline.classes.map(cls => (
                            <div
                              key={cls.id}
                              className="p-3"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    Turma {cls.codigo_turma}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {cls.tipo}
                                  </span>
                                </div>
                                
                                {/* Horários */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatSchedules(cls.schedules)}</span>
                                </div>
                                
                                {/* Professores */}
                                {cls.professors && cls.professors.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    <User className="w-3 h-3" />
                                    <span className="truncate">
                                      {cls.professors.map(p => p.nome).join(', ')}
                                    </span>
                                  </div>
                                )}

                                {/* Período */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  <span>{cls.inicio} - {cls.fim}</span>
                                </div>
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
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Nenhuma disciplina encontrada
        </p>
      )}
    </div>
  );
}

export default DisciplineSearch;
