import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import userSchedulesService, { 
  Schedule, 
  ScheduleClass, 
  CustomDiscipline, 
  Conflict,
  SCHEDULE_COLORS
} from '@/services/UserSchedulesService';

/**
 * Hook para gerenciar o estado da grade horária
 */

// Estrutura de um slot na grade (para render)
export interface GradeSlot {
  type: 'class' | 'custom';
  id: number;
  color: string;
  dia: string;
  horario_inicio: string;
  horario_fim: string;
  disciplina_nome: string;
  disciplina_codigo: string;
  turma_codigo?: string;
  professor?: string;
  isVisible: boolean;
}

// Dias da semana para a grade
export const DIAS_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const;
export type DiaSemana = typeof DIAS_SEMANA[number];

// Mapeamento de dias
export const DIA_LABELS: Record<string, string> = {
  'seg': 'Segunda',
  'ter': 'Terça',
  'qua': 'Quarta',
  'qui': 'Quinta',
  'sex': 'Sexta',
  'sab': 'Sábado'
};

export function useGrade() {
  const user = useCurrentUser();
  const isAuthenticated = !!user;
  
  // Estados principais
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ScheduleClass[]>([]);
  const [customDisciplines, setCustomDisciplines] = useState<CustomDiscipline[]>([]);
  
  // Estados de loading/error
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para edição
  const [editingScheduleName, setEditingScheduleName] = useState<number | null>(null);

  // ================ CARREGAR DADOS INICIAIS ================

  const loadSchedules = useCallback(async () => {
    if (!isAuthenticated) {
      setSchedules([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await userSchedulesService.getSchedules();
      setSchedules(data);
      
      // Se não tem plano ativo, seleciona o primeiro
      if (data.length > 0 && !activeScheduleId) {
        const firstActive = data.find(s => s.is_active) || data[0];
        setActiveScheduleId(firstActive.id);
      }
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
      setError('Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeScheduleId]);

  // Carrega planos ao iniciar
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // ================ OPERAÇÕES COM PLANOS ================

  const createSchedule = useCallback(async (name?: string) => {
    if (!isAuthenticated) return null;
    
    setIsSaving(true);
    try {
      const newSchedule = await userSchedulesService.createSchedule(name);
      setSchedules(prev => [...prev, newSchedule]);
      setActiveScheduleId(newSchedule.id);
      return newSchedule;
    } catch (err) {
      console.error('Erro ao criar plano:', err);
      setError('Erro ao criar plano');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated]);

  const renameSchedule = useCallback(async (scheduleId: number, name: string) => {
    setIsSaving(true);
    try {
      await userSchedulesService.updateSchedule(scheduleId, { name });
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, name } : s
      ));
      setEditingScheduleName(null);
    } catch (err) {
      console.error('Erro ao renomear plano:', err);
      setError('Erro ao renomear plano');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (scheduleId: number) => {
    setIsSaving(true);
    try {
      // Apenas usuários logados fazem soft delete no banco
      if (isAuthenticated) {
        await userSchedulesService.deleteSchedule(scheduleId);
      }
      
      // Remove do estado local (para ambos os casos)
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      
      // Se deletou o ativo, seleciona outro
      if (activeScheduleId === scheduleId) {
        const remaining = schedules.filter(s => s.id !== scheduleId);
        setActiveScheduleId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Erro ao deletar plano:', err);
      setError('Erro ao deletar plano');
    } finally {
      setIsSaving(false);
    }
  }, [activeScheduleId, schedules, isAuthenticated]);

  const duplicateSchedule = useCallback(async (scheduleId: number) => {
    const source = schedules.find(s => s.id === scheduleId);
    if (!source) return null;
    
    // Cria novo plano com nome baseado no original
    const newName = `${source.name} (cópia)`;
    const newSchedule = await createSchedule(newName);
    
    // TODO: Copiar turmas e disciplinas customizadas
    // Isso pode ser feito depois, quando tivermos os dados carregados
    
    return newSchedule;
  }, [schedules, createSchedule]);

  // ================ OPERAÇÕES COM TURMAS ================

  const addClass = useCallback(async (classId: number) => {
    if (!activeScheduleId) return false;
    
    setIsSaving(true);
    try {
      // Verifica conflitos primeiro
      const { hasConflicts, conflicts } = await userSchedulesService.checkConflicts(activeScheduleId, classId);
      
      if (hasConflicts) {
        // Retorna os conflitos para o componente decidir
        return { success: false, conflicts };
      }
      
      const result = await userSchedulesService.addClass(activeScheduleId, classId);
      
      // Recarrega os dados
      await loadSchedules();
      
      return { success: true, color: result.color };
    } catch (err) {
      console.error('Erro ao adicionar turma:', err);
      setError('Erro ao adicionar turma');
      return { success: false, error: err };
    } finally {
      setIsSaving(false);
    }
  }, [activeScheduleId, loadSchedules]);

  const removeClass = useCallback(async (classId: number) => {
    if (!activeScheduleId) return false;
    
    setIsSaving(true);
    try {
      await userSchedulesService.removeClass(activeScheduleId, classId);
      setClasses(prev => prev.filter(c => c.class_id !== classId));
      return true;
    } catch (err) {
      console.error('Erro ao remover turma:', err);
      setError('Erro ao remover turma');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [activeScheduleId]);

  const updateClassColor = useCallback(async (classId: number, color: string) => {
    if (!activeScheduleId) return false;
    
    try {
      await userSchedulesService.updateClassColor(activeScheduleId, classId, color);
      setClasses(prev => prev.map(c => 
        c.class_id === classId ? { ...c, color } : c
      ));
      return true;
    } catch (err) {
      console.error('Erro ao atualizar cor:', err);
      return false;
    }
  }, [activeScheduleId]);

  // ================ OPERAÇÕES COM DISCIPLINAS CUSTOMIZADAS ================

  const addCustomDiscipline = useCallback(async (data: {
    nome: string;
    codigo?: string;
    dia: string;
    horario_inicio: string;
    horario_fim: string;
    color?: string;
  }) => {
    if (!activeScheduleId) return null;
    
    setIsSaving(true);
    try {
      const discipline = await userSchedulesService.createCustomDiscipline({
        ...data,
        schedule_id: activeScheduleId
      });
      setCustomDisciplines(prev => [...prev, discipline]);
      return discipline;
    } catch (err) {
      console.error('Erro ao adicionar disciplina:', err);
      setError('Erro ao adicionar disciplina');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [activeScheduleId]);

  const removeCustomDiscipline = useCallback(async (disciplineId: number) => {
    setIsSaving(true);
    try {
      await userSchedulesService.deleteCustomDiscipline(disciplineId);
      setCustomDisciplines(prev => prev.filter(d => d.id !== disciplineId));
      return true;
    } catch (err) {
      console.error('Erro ao remover disciplina:', err);
      setError('Erro ao remover disciplina');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ================ CÁLCULOS DE EXIBIÇÃO ================

  // Calcula o range de horários necessário (08:00 - 23:00 adaptável)
  const timeRange = useMemo(() => {
    let minHour = 8; // Padrão começa 08:00
    let maxHour = 22; // Padrão termina 22:00
    
    // Verifica horários das turmas
    classes.forEach(cls => {
      cls.schedules?.forEach(schedule => {
        const startHour = parseInt(schedule.horario_inicio.split(':')[0]);
        const endHour = parseInt(schedule.horario_fim.split(':')[0]);
        if (startHour < minHour) minHour = startHour;
        if (endHour > maxHour) maxHour = endHour;
      });
    });
    
    // Verifica disciplinas customizadas
    customDisciplines.forEach(disc => {
      const startHour = parseInt(disc.horario_inicio.split(':')[0]);
      const endHour = parseInt(disc.horario_fim.split(':')[0]);
      if (startHour < minHour) minHour = startHour;
      if (endHour > maxHour) maxHour = endHour;
    });
    
    // Gera array de horários
    const hours: string[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`);
    }
    
    return { minHour, maxHour, hours };
  }, [classes, customDisciplines]);

  // Converte turmas e disciplinas customizadas para slots de exibição
  const gradeSlots = useMemo((): GradeSlot[] => {
    const slots: GradeSlot[] = [];
    
    // Turmas
    classes.forEach(cls => {
      cls.schedules?.forEach(schedule => {
        slots.push({
          type: 'class',
          id: cls.class_id,
          color: cls.color,
          dia: schedule.dia,
          horario_inicio: schedule.horario_inicio,
          horario_fim: schedule.horario_fim,
          disciplina_nome: cls.discipline_nome,
          disciplina_codigo: cls.discipline_codigo,
          turma_codigo: cls.codigo_turma,
          professor: schedule.professor_nome,
          isVisible: cls.is_visible === true || (cls.is_visible as unknown) === 1
        });
      });
    });
    
    // Disciplinas customizadas
    customDisciplines.forEach(disc => {
      slots.push({
        type: 'custom',
        id: disc.id,
        color: disc.color,
        dia: disc.dia,
        horario_inicio: disc.horario_inicio,
        horario_fim: disc.horario_fim,
        disciplina_nome: disc.nome,
        disciplina_codigo: disc.codigo || 'CUSTOM',
        isVisible: disc.is_visible === true || (disc.is_visible as unknown) === 1
      });
    });
    
    return slots;
  }, [classes, customDisciplines]);

  // Calcula créditos totais
  const credits = useMemo(() => {
    const disciplineIds = new Set<number>();
    let creditos_aula = 0;
    let creditos_trabalho = 0;
    
    classes.forEach(cls => {
      if (!cls.is_visible) return;
      if (disciplineIds.has(cls.discipline_id)) return;
      disciplineIds.add(cls.discipline_id);
      creditos_aula += cls.creditos_aula || 0;
      creditos_trabalho += cls.creditos_trabalho || 0;
    });
    
    return { creditos_aula, creditos_trabalho };
  }, [classes]);

  // ================ ESTADO LOCAL PARA NÃO LOGADOS ================

  // Para usuários não logados, mantemos o estado local
  const [localSlots, setLocalSlots] = useState<GradeSlot[]>([]);

  const addLocalSlot = useCallback((slot: Omit<GradeSlot, 'id'>) => {
    const newSlot: GradeSlot = {
      ...slot,
      id: Date.now() // ID temporário
    };
    setLocalSlots(prev => [...prev, newSlot]);
    return newSlot;
  }, []);

  const removeLocalSlot = useCallback((slotId: number) => {
    setLocalSlots(prev => prev.filter(s => s.id !== slotId));
  }, []);

  // ================ RETURN ================

  return {
    // Dados
    schedules,
    activeScheduleId,
    activeSchedule: schedules.find(s => s.id === activeScheduleId),
    classes,
    customDisciplines,
    gradeSlots: isAuthenticated ? gradeSlots : localSlots,
    credits,
    timeRange,
    
    // Estados
    isLoading,
    isSaving,
    error,
    isAuthenticated,
    editingScheduleName,
    
    // Setters
    setActiveScheduleId,
    setEditingScheduleName,
    setError,
    setClasses,
    setCustomDisciplines,
    
    // Ações - Planos
    createSchedule,
    renameSchedule,
    deleteSchedule,
    duplicateSchedule,
    loadSchedules,
    
    // Ações - Turmas
    addClass,
    removeClass,
    updateClassColor,
    
    // Ações - Disciplinas Customizadas
    addCustomDiscipline,
    removeCustomDiscipline,
    
    // Ações - Local (não logado)
    addLocalSlot,
    removeLocalSlot,
    
    // Constantes
    DIAS_SEMANA,
    DIA_LABELS,
    SCHEDULE_COLORS
  };
}

export default useGrade;
