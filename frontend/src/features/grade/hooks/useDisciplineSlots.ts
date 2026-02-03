import { useMemo } from 'react';
import { DisciplineState } from '@/hooks/useDisciplineList';
import { GradeSlot } from '@/hooks/useGrade';

// Interface para conflito
export interface SlotConflict {
  slot1: GradeSlot;
  slot2: GradeSlot;
}

/**
 * Verifica se dois horários se sobrepõem
 */
function timeOverlaps(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  // Há sobreposição se um começa antes do outro terminar
  return s1 < e2 && s2 < e1;
}

/**
 * Hook para gerar slots da grade a partir das disciplinas visíveis
 * Inclui detecção de conflitos
 */
export function useDisciplineSlots(
  disciplineStates: DisciplineState[],
  scheduleColors: readonly string[]
) {
  // Gera os slots e detecta conflitos
  const { disciplineSlots, conflicts } = useMemo(() => {
    const slots: GradeSlot[] = [];
    const conflictList: SlotConflict[] = [];
    
    disciplineStates.forEach((state, index) => {
      if (!state.isVisible) return;

      // Se for disciplina customizada, processa diferentemente
      if (state.isCustom) {
        const color = scheduleColors[index % scheduleColors.length];
        
        // Para customizadas, todas as classes são os horários
        state.discipline.classes.forEach(fakeClass => {
          fakeClass.schedules.forEach(schedule => {
            const newSlot: GradeSlot = {
              type: 'custom',
              id: state.customDisciplineId || state.discipline.id,
              color,
              dia: schedule.dia,
              horario_inicio: schedule.horario_inicio,
              horario_fim: schedule.horario_fim,
              disciplina_nome: state.discipline.nome,
              disciplina_codigo: state.discipline.codigo,
              isVisible: true
            };

            // Verifica conflitos com slots existentes
            slots.forEach(existingSlot => {
              if (
                existingSlot.dia === newSlot.dia &&
                timeOverlaps(
                  existingSlot.horario_inicio,
                  existingSlot.horario_fim,
                  newSlot.horario_inicio,
                  newSlot.horario_fim
                )
              ) {
                conflictList.push({ slot1: existingSlot, slot2: newSlot });
              }
            });

            slots.push(newSlot);
          });
        });
        return;
      }

      // Disciplina regular
      if (!state.selectedClassId) return;

      const selectedClass = state.discipline.classes.find(c => c.id === state.selectedClassId);
      if (!selectedClass) return;

      const color = scheduleColors[index % scheduleColors.length];

      selectedClass.schedules.forEach(schedule => {
        const newSlot: GradeSlot = {
          type: 'class',
          id: selectedClass.id,
          color,
          dia: schedule.dia,
          horario_inicio: schedule.horario_inicio,
          horario_fim: schedule.horario_fim,
          disciplina_nome: state.discipline.nome,
          disciplina_codigo: state.discipline.codigo,
          turma_codigo: selectedClass.codigo_turma,
          professor: selectedClass.professors?.[0]?.nome,
          isVisible: true
        };

        // Verifica conflitos com slots existentes
        slots.forEach(existingSlot => {
          if (
            existingSlot.dia === newSlot.dia &&
            timeOverlaps(
              existingSlot.horario_inicio,
              existingSlot.horario_fim,
              newSlot.horario_inicio,
              newSlot.horario_fim
            )
          ) {
            conflictList.push({ slot1: existingSlot, slot2: newSlot });
          }
        });

        slots.push(newSlot);
      });
    });

    return { disciplineSlots: slots, conflicts: conflictList };
  }, [disciplineStates, scheduleColors]);

  // IDs de slots em conflito (para marcar visualmente)
  const conflictingSlotIds = useMemo(() => {
    const ids = new Set<number>();
    conflicts.forEach(c => {
      ids.add(c.slot1.id);
      ids.add(c.slot2.id);
    });
    return ids;
  }, [conflicts]);

  // Créditos das disciplinas visíveis (incluindo customizadas)
  const credits = useMemo(() => {
    return disciplineStates
      .filter(d => d.isVisible)
      .reduce((acc, d) => ({
        creditos_aula: acc.creditos_aula + (d.isCustom ? (d.creditos_aula || 0) : (d.discipline.creditos_aula || 0)),
        creditos_trabalho: acc.creditos_trabalho + (d.isCustom ? (d.creditos_trabalho || 0) : (d.discipline.creditos_trabalho || 0))
      }), { creditos_aula: 0, creditos_trabalho: 0 });
  }, [disciplineStates]);

  return {
    disciplineSlots,
    credits,
    conflicts,
    conflictingSlotIds,
    hasConflicts: conflicts.length > 0
  };
}
