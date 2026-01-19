import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GradeSlot, DIAS_SEMANA, DIA_LABELS } from '@/hooks/useGrade';

interface GradeGridProps {
  slots: GradeSlot[];
  timeRange: { minHour: number; maxHour: number; hours: string[] };
  onRemoveSlot?: (slot: GradeSlot) => void;
  onSlotClick?: (slot: GradeSlot) => void;
  readOnly?: boolean;
  conflictingSlotIds?: Set<number>;
}

// Altura por hora em pixels (compacta para caber na tela)
const HOUR_HEIGHT = 40;

/**
 * Componente de grade horária visual - estilo MatrUSP
 * Exibe os slots de disciplinas organizados por dia e horário
 */
export function GradeGrid({
  slots,
  timeRange,
  onRemoveSlot,
  onSlotClick,
  readOnly = false,
  conflictingSlotIds = new Set()
}: GradeGridProps) {
  // Converte horário para posição vertical em pixels
  const timeToPosition = useCallback((time: string): number => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = (h - timeRange.minHour) * 60 + m;
    return (totalMinutes / 60) * HOUR_HEIGHT;
  }, [timeRange.minHour]);

  // Calcula altura do slot
  const getSlotHeight = useCallback((start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const durationMinutes = (h2 - h1) * 60 + (m2 - m1);
    return Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20);
  }, []);

  // Agrupa slots por dia
  const slotsByDay = useMemo(() => {
    const grouped: Record<string, GradeSlot[]> = {};
    DIAS_SEMANA.forEach(dia => {
      grouped[dia] = slots.filter(s => s.dia === dia && s.isVisible);
    });
    return grouped;
  }, [slots]);

  // Altura total da grade
  const gridHeight = useMemo(() => {
    const totalHours = timeRange.maxHour - timeRange.minHour + 1;
    return totalHours * HOUR_HEIGHT;
  }, [timeRange]);

  return (
    <div className="select-none">
      {/* Container da grade */}
      <div className="flex">
        {/* Coluna de horários */}
        <div className="w-12 flex-shrink-0">
          {/* Header vazio */}
          <div className="h-8 border-b border-gray-200 dark:border-gray-700" />
          {/* Horários */}
          <div className="relative" style={{ height: gridHeight }}>
            {timeRange.hours.map((hour, idx) => (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-center justify-end pr-1 text-[11px] text-gray-400 dark:text-gray-500 font-medium"
                style={{ top: idx * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              >
                {hour.replace(':00', '')}
              </div>
            ))}
          </div>
        </div>

        {/* Colunas dos dias */}
        <div className="flex-1 flex border-l border-gray-200 dark:border-gray-700">
          {DIAS_SEMANA.map(dia => (
            <div
              key={dia}
              className="flex-1 min-w-0 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {/* Header do dia */}
              <div className="h-8 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 bg-cm-academic text-white">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {DIA_LABELS[dia]}
                </span>
              </div>

              {/* Área de slots */}
              <div 
                className="relative bg-gray-50 dark:bg-gray-900/50"
                style={{ height: gridHeight }}
              >
                {/* Linhas de hora */}
                {timeRange.hours.map((hour, idx) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-b border-gray-200 dark:border-gray-800"
                    style={{ top: idx * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Slots do dia */}
                {slotsByDay[dia]?.map(slot => {
                  const height = getSlotHeight(slot.horario_inicio, slot.horario_fim);
                  const isSmall = height < 35;
                  const hasConflict = conflictingSlotIds.has(slot.id);
                  
                  return (
                    <motion.div
                      key={`${slot.type}-${slot.id}-${slot.horario_inicio}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "absolute left-0.5 right-0.5 rounded overflow-hidden cursor-pointer group",
                        "transition-all duration-150 hover:z-10 hover:shadow-lg hover:scale-[1.02]",
                        hasConflict && "ring-2 ring-red-500 ring-offset-1 animate-pulse"
                      )}
                      style={{
                        top: timeToPosition(slot.horario_inicio),
                        height: height - 1,
                        backgroundColor: hasConflict ? '#ef4444' : slot.color,
                      }}
                      onClick={() => onSlotClick?.(slot)}
                      title={hasConflict ? '⚠️ Conflito de horário!' : `${slot.disciplina_nome} - T${slot.turma_codigo}`}
                    >
                      <div className="h-full flex flex-col justify-center px-1 py-0.5 text-white">
                        {/* Ícone de conflito */}
                        {hasConflict && (
                          <div className="absolute top-0.5 left-0.5">
                            <AlertTriangle className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        {/* Horário (topo) */}
                        <div className="text-[9px] opacity-90 leading-none">
                          {slot.horario_inicio}-{slot.horario_fim}
                        </div>
                        
                        {/* Código da disciplina */}
                        <div className={cn(
                          "font-bold truncate leading-tight",
                          isSmall ? "text-[10px]" : "text-xs"
                        )}>
                          {slot.disciplina_codigo}
                        </div>

                        {/* Turma (se houver espaço) */}
                        {!isSmall && slot.turma_codigo && (
                          <div className="text-[9px] opacity-80 leading-none">
                            T{slot.turma_codigo}
                          </div>
                        )}
                      </div>

                      {/* Botão de remover (hover) */}
                      {!readOnly && onRemoveSlot && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSlot(slot);
                          }}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GradeGrid;
