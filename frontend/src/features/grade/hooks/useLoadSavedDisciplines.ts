import { useEffect, useRef } from 'react';
import { DisciplineState } from '@/hooks/useDisciplineList';
import { DisciplineWithClasses } from '@/utils/combinationsGenerator';

/**
 * Hook para carregar disciplinas salvas do banco (regulares E customizadas)
 */
export function useLoadSavedDisciplines(
  isAuthenticated: boolean,
  scheduleDisciplines: any[],
  loadDisciplines: (disciplines: DisciplineState[]) => void
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

      // Detecta mudança de plano e reseta hashes
      const currentScheduleId = scheduleDisciplines?.[0]?.schedule_id || null;
      if (currentScheduleId !== lastScheduleIdRef.current) {
        console.log(`🔵 [useLoadSavedDisciplines] Mudança de plano detectada, resetando hashes`);
        lastLoadedRef.current = '';
        lastScheduleIdRef.current = currentScheduleId;
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

      // Para cada disciplina salva, carrega os dados completos
      const loadedStates: DisciplineState[] = [];
      
      for (const savedDiscipline of scheduleDisciplines) {
        try {
          // Se discipline_id é negativo, é uma customizada
          if (savedDiscipline.discipline_id < 0) {
            const customId = -savedDiscipline.discipline_id;
            
            // Cria uma "disciplina falsa" para customizadas
            const disciplineWithClasses: DisciplineWithClasses = {
              id: savedDiscipline.discipline_id, // Mantém negativo
              codigo: savedDiscipline.discipline_codigo,
              nome: savedDiscipline.discipline_nome,
              creditos_aula: Number(savedDiscipline.creditos_aula) || 0,
              creditos_trabalho: Number(savedDiscipline.creditos_trabalho) || 0,
              classes: (savedDiscipline.customSchedules || []).map((schedule: any, idx: number) => ({
                id: -customId * 1000 - idx,
                codigo_turma: 'MANUAL',
                tipo: 'TEÓRICA',
                inicio: '',
                fim: '',
                discipline_id: savedDiscipline.discipline_id,
                discipline_codigo: savedDiscipline.discipline_codigo,
                discipline_nome: savedDiscipline.discipline_nome,
                schedules: [schedule],
                professors: []
              }))
            };
            
            loadedStates.push({
              discipline: disciplineWithClasses,
              isVisible: Boolean(savedDiscipline.is_visible),
              selectedClassId: null,
              isExpanded: Boolean(savedDiscipline.is_expanded),
              isCustom: true,
              customDisciplineId: customId,
              creditos_aula: Number(savedDiscipline.creditos_aula) || 0,
              creditos_trabalho: Number(savedDiscipline.creditos_trabalho) || 0
            });
          } else {
            // Disciplina regular - busca turmas da API
            const response = await fetch(`/api/academic/disciplines/${savedDiscipline.discipline_codigo}/full`);
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
  }, [isAuthenticated, scheduleDisciplines, loadDisciplines]);
}
