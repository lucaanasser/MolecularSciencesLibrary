import { useEffect, useRef } from 'react';
import { DisciplineState } from '@/hooks/useDisciplineList';
import { DisciplineWithClasses } from '@/utils/combinationsGenerator';

/**
 * Hook para carregar disciplinas salvas do banco
 */
export function useLoadSavedDisciplines(
  isAuthenticated: boolean,
  scheduleDisciplines: any[],
  loadDisciplines: (disciplines: DisciplineState[]) => void,
  clearList?: () => void
) {
  // Ref para evitar recarregamentos desnecessários
  const lastLoadedRef = useRef<string>('');
  const lastScheduleIdRef = useRef<number | null>(null);

  useEffect(() => {
    const loadSavedDisciplines = async () => {
      // Se não está autenticado, não faz nada
      if (!isAuthenticated) {
        return;
      }

      // Se não há disciplinas no banco, limpa a lista
      if (!scheduleDisciplines || scheduleDisciplines.length === 0) {
        console.log(`🟡 [useLoadSavedDisciplines] Nenhuma disciplina no banco`);
        return;
      }

      // Cria hash para evitar reload desnecessário
      const currentHash = scheduleDisciplines
        .map(d => `${d.discipline_id}-${d.selected_class_id}-${d.is_visible}`)
        .join('|');

      if (lastLoadedRef.current === currentHash) {
        // Já carregamos essas disciplinas, não precisa recarregar
        console.log(`🟡 [useLoadSavedDisciplines] Hash igual, ignorando reload`);
        return;
      }

      console.log(`🔵 [useLoadSavedDisciplines] Carregando ${scheduleDisciplines.length} disciplinas do banco`);
      lastLoadedRef.current = currentHash;

      // Para cada disciplina salva, carrega os dados completos (com turmas)
      const loadedStates: DisciplineState[] = [];
      
      for (const savedDiscipline of scheduleDisciplines) {
        try {
          const response = await fetch(`/api/disciplines/${savedDiscipline.discipline_codigo}/full`);
          if (response.ok) {
            const data = await response.json();
            
            const disciplineWithClasses: DisciplineWithClasses = {
              id: savedDiscipline.discipline_id,
              codigo: savedDiscipline.discipline_codigo,
              nome: savedDiscipline.discipline_nome,
              creditos_aula: Number(savedDiscipline.creditos_aula) || 0,
              creditos_trabalho: Number(savedDiscipline.creditos_trabalho) || 0,
              classes: (data.turmas || []).map((cls: any) => ({
                id: cls.id,
                codigo_turma: cls.codigo_turma,
                discipline_id: savedDiscipline.discipline_id,
                discipline_codigo: savedDiscipline.discipline_codigo,
                discipline_nome: savedDiscipline.discipline_nome,
                schedules: cls.schedules || [],
                professors: cls.professors || []
              }))
            };
            
            loadedStates.push({
              discipline: disciplineWithClasses,
              isVisible: Boolean(savedDiscipline.is_visible),
              selectedClassId: savedDiscipline.selected_class_id,
              isExpanded: Boolean(savedDiscipline.is_expanded)
            });
          }
        } catch (error) {
          console.error(`🔴 [useLoadSavedDisciplines] Erro ao carregar disciplina ${savedDiscipline.discipline_codigo}:`, error);
        }
      }
      
      if (loadedStates.length > 0) {
        console.log(`🟢 [useLoadSavedDisciplines] ${loadedStates.length} disciplinas carregadas`);
        loadDisciplines(loadedStates);
      }
    };

    loadSavedDisciplines();
  }, [isAuthenticated, scheduleDisciplines, loadDisciplines, clearList]);
}
