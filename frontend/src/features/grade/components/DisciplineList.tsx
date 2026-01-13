import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  X, 
  Loader2, 
  BookOpen,
  GripVertical,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DisciplineWithClasses } from '@/utils/combinationsGenerator';

interface DisciplineListProps {
  disciplines: DisciplineWithClasses[];
  onAddDiscipline: (discipline: DisciplineWithClasses) => void;
  onRemoveDiscipline: (disciplineId: number) => void;
  disabled?: boolean;
  maxDisciplines?: number;
}

// Tipo para disciplina da API
interface APIDiscipline {
  id: number;
  codigo: string;
  nome: string;
  unidade: string;
  campus: string;
  creditos_aula: number;
  creditos_trabalho: number;
}

/**
 * Lista de disciplinas que o usuário quer cursar
 * Permite buscar e adicionar disciplinas para gerar combinações
 */
export function DisciplineList({
  disciplines,
  onAddDiscipline,
  onRemoveDiscipline,
  disabled,
  maxDisciplines = 10
}: DisciplineListProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<APIDiscipline[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca disciplinas com debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/disciplines/search?q=${encodeURIComponent(query)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          // Filtra disciplinas já adicionadas
          const filtered = data.filter(
            (d: APIDiscipline) => !disciplines.some(existing => existing.id === d.id)
          );
          setSearchResults(filtered);
          setShowDropdown(true);
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
  }, [query, disciplines]);

  // Adiciona disciplina à lista
  const handleAddDiscipline = useCallback(async (discipline: APIDiscipline) => {
    if (disciplines.length >= maxDisciplines) {
      return;
    }

    setIsLoadingClasses(true);
    setShowDropdown(false);
    setQuery('');

    try {
      // Busca as turmas da disciplina
      const response = await fetch(`/api/disciplines/${discipline.codigo}/full`);
      if (response.ok) {
        const data = await response.json();
        
        const disciplineWithClasses: DisciplineWithClasses = {
          id: discipline.id,
          codigo: discipline.codigo,
          nome: discipline.nome,
          creditos_aula: discipline.creditos_aula,
          creditos_trabalho: discipline.creditos_trabalho,
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
        
        onAddDiscipline(disciplineWithClasses);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [disciplines.length, maxDisciplines, onAddDiscipline]);

  // Calcula créditos totais
  const totalCredits = disciplines.reduce((acc, d) => ({
    aula: acc.aula + d.creditos_aula,
    trabalho: acc.trabalho + d.creditos_trabalho
  }), { aula: 0, trabalho: 0 });

  return (
    <div className="space-y-3" ref={containerRef}>
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

      {/* Limite atingido */}
      {disciplines.length >= maxDisciplines && (
        <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Limite de disciplinas atingido
        </div>
      )}

      {/* Lista de disciplinas adicionadas */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {disciplines.map((discipline, index) => (
            <motion.div
              key={discipline.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg",
                "bg-gray-50 dark:bg-gray-800/50",
                "border border-gray-200 dark:border-gray-700",
                "group"
              )}
            >
              {/* Drag handle (futuro) */}
              <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cm-academic">
                    {discipline.codigo}
                  </span>
                  <span className="text-xs text-gray-500">
                    {discipline.classes.length} {discipline.classes.length === 1 ? 'turma' : 'turmas'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {discipline.nome}
                </p>
              </div>

              {/* Remover */}
              <button
                onClick={() => onRemoveDiscipline(discipline.id)}
                disabled={disabled}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Estado vazio */}
      {disciplines.length === 0 && !isLoadingClasses && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">
            Adicione disciplinas para gerar combinações
          </p>
        </div>
      )}

      {/* Créditos totais */}
      {disciplines.length > 0 && (
        <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400">
            Total: <strong className="text-cm-academic">{totalCredits.aula}</strong> aula + <strong className="text-cm-academic">{totalCredits.trabalho}</strong> trabalho
          </span>
        </div>
      )}
    </div>
  );
}

export default DisciplineList;
