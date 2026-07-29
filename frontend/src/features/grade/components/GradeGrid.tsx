import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GradeSlot, DIAS_SEMANA, DIA_LABELS } from '@/hooks/useGrade';
import { useNavigate } from 'react-router-dom';
import { tint, shade } from '@/features/grade/utils/disciplineColors';

interface GradeGridProps {
  slots: GradeSlot[];
  timeRange: { minHour: number; maxHour: number; hours: string[] };
  onRemoveSlot?: (slot: GradeSlot) => void;
  onSlotClick?: (slot: GradeSlot) => void;
  readOnly?: boolean;
  conflictingSlotIds?: Set<number>;
}

const DIA_SHORT: Record<string, string> = {
  seg: 'SEG', ter: 'TER', qua: 'QUA', qui: 'QUI', sex: 'SEX', sab: 'SÁB',
};

/**
 * Grade horária visual. Preenche toda a altura disponível do container
 * usando posicionamento percentual — assim nunca exige rolagem.
 */
export function GradeGrid({
  slots,
  timeRange,
  onRemoveSlot,
  readOnly = false,
  conflictingSlotIds = new Set(),
}: GradeGridProps) {
  const navigate = useNavigate();

  const totalMinutes = useMemo(
    () => Math.max((timeRange.maxHour - timeRange.minHour) * 60, 60),
    [timeRange]
  );

  const timeToPercent = useCallback((time: string): number => {
    const [h, m] = time.split(':').map(Number);
    const minutes = (h - timeRange.minHour) * 60 + m;
    return (minutes / totalMinutes) * 100;
  }, [timeRange.minHour, totalMinutes]);

  const durationPercent = useCallback((start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (((h2 - h1) * 60 + (m2 - m1)) / totalMinutes) * 100;
  }, [totalMinutes]);

  const slotsByDay = useMemo(() => {
    const grouped: Record<string, GradeSlot[]> = {};
    DIAS_SEMANA.forEach(dia => {
      grouped[dia] = slots.filter(s => s.dia === dia && s.isVisible);
    });
    return grouped;
  }, [slots]);

  const hasAnySlot = slots.some(s => s.isVisible);

  // Mostra sábado só quando há alguma aula no sábado
  const days = useMemo(() => {
    const hasSat = (slotsByDay['sab']?.length ?? 0) > 0;
    return hasSat ? [...DIAS_SEMANA] : DIAS_SEMANA.filter(d => d !== 'sab');
  }, [slotsByDay]);

  const lineCount = timeRange.hours.length - 1 || 1;

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col select-none p-3">
      {/* Cabeçalho de dias */}
      <div className="flex-shrink-0 flex">
        <div className="w-9 flex-shrink-0" />
        <div className="flex-1 flex border-b border-gray-200 dark:border-gray-700">
          {days.map(dia => (
            <div
              key={dia}
              className="flex-1 min-w-0 text-center py-2 border-l border-gray-100 dark:border-gray-800 first:border-l-0"
              title={DIA_LABELS[dia]}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {DIA_SHORT[dia]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Corpo da grade */}
      <div className="flex-1 min-h-0 flex pt-1">
        {/* Coluna de horários */}
        <div className="w-9 flex-shrink-0 relative">
          {timeRange.hours.map((hour, idx) => (
            <div
              key={hour}
              className="absolute right-1.5 -translate-y-1/2 text-[11px] font-medium text-gray-300 dark:text-gray-600"
              style={{ top: `${(idx / lineCount) * 100}%` }}
            >
              {hour.slice(0, 2)}
            </div>
          ))}
        </div>

        {/* Colunas dos dias */}
        <div className="flex-1 flex relative">
          {/* Linhas de hora (fundo) */}
          <div className="absolute inset-0 pointer-events-none">
            {timeRange.hours.map((hour, idx) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800"
                style={{ top: `${(idx / lineCount) * 100}%` }}
              />
            ))}
          </div>

          {days.map(dia => (
            <div
              key={dia}
              className="flex-1 min-w-0 relative border-l border-gray-100 dark:border-gray-800 first:border-l-0"
            >
              {slotsByDay[dia]?.map(slot => {
                const top = timeToPercent(slot.horario_inicio);
                const height = durationPercent(slot.horario_inicio, slot.horario_fim);
                const isSmall = height < 7;
                const hasConflict = conflictingSlotIds.has(slot.id);
                const isClickable = slot.type === 'class' && !!slot.disciplina_codigo;
                const color = slot.color || '#01aad0';

                const startLabel = slot.horario_inicio.slice(0, 5);
                const endLabel = slot.horario_fim.slice(0, 5);

                return (
                  <motion.div
                    key={`${slot.type}-${slot.id}-${slot.horario_inicio}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'absolute left-0.5 right-0.5 rounded-lg overflow-hidden group',
                      'transition-all duration-150 hover:z-20 hover:shadow-md',
                      isClickable && 'cursor-pointer'
                    )}
                    style={{
                      top: `${top}%`,
                      height: `calc(${height}% - 2px)`,
                      backgroundColor: hasConflict ? 'rgba(239,68,68,0.12)' : tint(color, 0.14),
                      border: `1px solid ${hasConflict ? '#ef4444' : tint(color, 0.5)}`,
                      borderLeft: `3px solid ${hasConflict ? '#ef4444' : color}`,
                    }}
                    onClick={() => {
                      if (isClickable) navigate(`/academico/disciplina/${slot.disciplina_codigo}`);
                    }}
                    title={hasConflict ? '⚠️ Conflito de horário!' : `${slot.disciplina_nome} — T${slot.turma_codigo ?? ''}`}
                  >
                    <div className="h-full flex flex-col justify-start px-1.5 py-1 relative">
                      {hasConflict && (
                        <AlertTriangle className="absolute top-1 right-1 w-3 h-3 text-red-500" />
                      )}
                      <div
                        className="font-bold leading-tight truncate text-[11px] sm:text-xs"
                        style={{ color: hasConflict ? '#b91c1c' : shade(color, 0.7) }}
                      >
                        {slot.disciplina_codigo}
                      </div>
                      {!isSmall && (
                        <div
                          className="text-[10px] leading-tight truncate mt-0.5"
                          style={{ color: hasConflict ? '#dc2626' : shade(color, 0.78), opacity: 0.85 }}
                        >
                          {startLabel}–{endLabel}{slot.turma_codigo ? ` · T${slot.turma_codigo}` : ''}
                        </div>
                      )}

                      {!readOnly && onRemoveSlot && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveSlot(slot); }}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white/70 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Remover"
                          style={{ color: shade(color, 0.6) }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}

          {/* Estado vazio */}
          {!hasAnySlot && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 pointer-events-none">
              <CalendarDays className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-0">Sua grade está vazia</p>
              <p className="text-xs text-gray-400/80 dark:text-gray-500/80 mb-0">Busque disciplinas ao lado para começar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GradeGrid;
