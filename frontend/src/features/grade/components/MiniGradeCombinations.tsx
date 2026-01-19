import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Combination, ClassOption } from '@/utils/combinationsGenerator';

interface MiniGradeCombinationsProps {
  combinations: Combination[];
  currentIndex: number;
  onSelectCombination: (index: number, combination: Combination) => void;
  isGenerating: boolean;
  disciplineCount: number;
  colors: string[];
}

// Mapeamento de dias para posição na mini-grade
const DAY_MAP: Record<string, number> = {
  'seg': 0,
  'ter': 1,
  'qua': 2,
  'qui': 3,
  'sex': 4,
  'sab': 5
};

// Calcula o range de horários das combinações
const getTimeRange = (combination: Combination) => {
  let minHour = 23;
  let maxHour = 7;

  combination.classes.forEach(cls => {
    cls.schedules.forEach(schedule => {
      const startHour = parseInt(schedule.horario_inicio.split(':')[0]);
      const endHour = parseInt(schedule.horario_fim.split(':')[0]);
      if (startHour < minHour) minHour = startHour;
      if (endHour > maxHour) maxHour = endHour;
    });
  });

  // Adiciona folga de 1 hora antes e depois
  minHour = Math.max(7, minHour - 1);
  maxHour = Math.min(23, maxHour + 1);

  return { minHour, maxHour, totalHours: maxHour - minHour };
};

// Converte horário para posição Y relativa ao range
const timeToPosition = (time: string, minHour: number): number => {
  const [hours] = time.split(':').map(Number);
  return Math.max(0, hours - minHour);
};

/**
 * Componente de mini-grade para visualização de combinações
 */
function MiniGrade({ 
  combination, 
  colors,
  isSelected,
  onClick
}: { 
  combination: Combination;
  colors: string[];
  isSelected: boolean;
  onClick: () => void;
}) {
  // Calcula o range de horários para esta combinação
  const timeRange = useMemo(() => getTimeRange(combination), [combination]);

  // Mapeia disciplinas para cores
  const disciplineColors = useMemo(() => {
    const map: Record<string, string> = {};
    combination.classes.forEach((cls, idx) => {
      if (!map[cls.discipline_codigo]) {
        map[cls.discipline_codigo] = colors[Object.keys(map).length % colors.length];
      }
    });
    return map;
  }, [combination.classes, colors]);

  // Gera blocos da mini-grade
  const blocks = useMemo(() => {
    const result: Array<{
      x: number;
      y: number;
      height: number;
      color: string;
      codigo: string;
    }> = [];

    combination.classes.forEach(cls => {
      cls.schedules.forEach(schedule => {
        const dayIndex = DAY_MAP[schedule.dia];
        if (dayIndex === undefined) return;

        const startY = timeToPosition(schedule.horario_inicio, timeRange.minHour);
        const endY = timeToPosition(schedule.horario_fim, timeRange.minHour);
        const height = endY - startY;

        result.push({
          x: dayIndex,
          y: startY,
          height: Math.max(height, 1),
          color: disciplineColors[cls.discipline_codigo] || '#ccc',
          codigo: cls.discipline_codigo
        });
      });
    });

    return result;
  }, [combination.classes, disciplineColors, timeRange]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-16 h-14 rounded border-2 transition-all overflow-hidden flex-shrink-0",
        "hover:scale-105 hover:shadow-md",
        isSelected 
          ? "border-cm-academic ring-2 ring-cm-academic ring-offset-1" 
          : "border-gray-300 dark:border-gray-600"
      )}
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid grid-cols-6" style={{ opacity: 0.1 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-r border-gray-400" />
        ))}
      </div>

      {/* Blocos */}
      {blocks.map((block, idx) => (
        <div
          key={idx}
          className="absolute rounded-sm"
          style={{
            left: `${(block.x / 6) * 100}%`,
            top: `${(block.y / timeRange.totalHours) * 100}%`,
            width: `${(1 / 6) * 100}%`,
            height: `${(block.height / timeRange.totalHours) * 100}%`,
            backgroundColor: block.color,
            minHeight: '2px'
          }}
        />
      ))}
    </button>
  );
}

/**
 * Carrossel de mini-grades de combinações
 */
export function MiniGradeCombinations({
  combinations,
  currentIndex,
  onSelectCombination,
  isGenerating,
  disciplineCount,
  colors
}: MiniGradeCombinationsProps) {
  // Se não tem disciplinas na lista
  if (disciplineCount === 0) {
    return null;
  }

  // Se está gerando
  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin text-cm-academic" />
        <span className="text-xs">Gerando...</span>
      </div>
    );
  }

  // Se não encontrou nenhuma combinação válida
  if (combinations.length === 0) {
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">Nenhuma combinação sem conflitos</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Mini-grades */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-2">
          {combinations.map((combination, idx) => (
            <MiniGrade
              key={idx}
              combination={combination}
              colors={colors}
              isSelected={idx === currentIndex}
              onClick={() => onSelectCombination(idx, combination)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MiniGradeCombinations;
