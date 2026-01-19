import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Check, 
  Loader2,
  Sparkles,
  AlertCircle,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Combination } from '@/utils/combinationsGenerator';

interface CombinationSelectorProps {
  combinations: Combination[];
  currentIndex: number;
  onSelectCombination: (index: number) => void;
  onApplyCombination: (combination: Combination) => void;
  isGenerating: boolean;
  disciplineCount: number;
}

/**
 * Componente para navegar entre combinações de horários
 * Mostra miniaturas das grades e permite aplicar uma combinação
 */
export function CombinationSelector({
  combinations,
  currentIndex,
  onSelectCombination,
  onApplyCombination,
  isGenerating,
  disciplineCount
}: CombinationSelectorProps) {
  const [isHovering, setIsHovering] = useState(false);

  const currentCombination = combinations[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelectCombination(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < combinations.length - 1) {
      onSelectCombination(currentIndex + 1);
    }
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * combinations.length);
    onSelectCombination(randomIndex);
  };

  // Se não tem disciplinas na lista
  if (disciplineCount === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          Adicione disciplinas à lista para ver combinações
        </p>
      </div>
    );
  }

  // Se está gerando
  if (isGenerating) {
    return (
      <div className="text-center py-4">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-cm-academic" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerando combinações...
        </p>
      </div>
    );
  }

  // Se não encontrou nenhuma combinação válida
  if (combinations.length === 0) {
    return (
      <div className="text-center py-4 text-amber-600 dark:text-amber-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm font-medium">
          Nenhuma combinação sem conflitos
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tente remover alguma disciplina
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cm-academic" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Combinações
          </span>
        </div>
        <span className="text-xs bg-cm-academic/10 text-cm-academic px-2 py-0.5 rounded-full font-medium">
          {combinations.length} {combinations.length === 1 ? 'opção' : 'opções'}
        </span>
      </div>

      {/* Navegação */}
      <div className="flex items-center gap-2">
        {/* Botão anterior */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Indicador de página */}
        <div 
          className="flex-1 text-center cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleRandom}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-lg font-bold text-cm-academic">
                {currentIndex + 1}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {' '}/ {combinations.length}
              </span>
            </motion.div>
          </AnimatePresence>
          
          {isHovering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-400 flex items-center justify-center gap-1"
            >
              <Shuffle className="w-3 h-3" />
              Clique para aleatório
            </motion.div>
          )}
        </div>

        {/* Botão próximo */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === combinations.length - 1}
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Info da combinação atual */}
      {currentCombination && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2"
        >
          {/* Créditos */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="text-center">
              <span className="font-bold text-cm-academic">{currentCombination.totalCreditsAula}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">cred. aula</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="text-center">
              <span className="font-bold text-cm-academic">{currentCombination.totalCreditsTrabalho}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">cred. trab.</span>
            </div>
          </div>

          {/* Lista de turmas */}
          <div className="space-y-1">
            {currentCombination.classes.map((cls, idx) => (
              <div 
                key={`${cls.id}-${idx}`}
                className="flex items-center gap-2 text-xs"
              >
                <span className="font-mono font-bold text-gray-600 dark:text-gray-400">
                  {cls.discipline_codigo}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Turma {cls.codigo_turma?.substring(4)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Botão aplicar */}
      <Button
        onClick={() => currentCombination && onApplyCombination(currentCombination)}
        disabled={!currentCombination}
        className="w-full bg-cm-academic hover:bg-cm-academic-dark"
      >
        <Check className="w-4 h-4 mr-2" />
        Aplicar esta combinação
      </Button>

      {/* Dica */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        Use ← → para navegar entre combinações
      </p>
    </div>
  );
}

export default CombinationSelector;
