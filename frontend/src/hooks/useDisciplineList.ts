import { useState, useCallback, useEffect } from 'react';
import { DisciplineWithClasses } from '@/utils/combinationsGenerator';

/**
 * Interface para o estado de uma disciplina na lista
 */
export interface DisciplineState {
  discipline: DisciplineWithClasses;
  isVisible: boolean;
  selectedClassId: number | null;
  isExpanded: boolean;
}

/**
 * Hook para gerenciar a lista de disciplinas selecionadas
 */
export function useDisciplineList(
  isAuthenticated: boolean,
  activeScheduleId: number | null,
  addDisciplineToList: (disciplineId: number, options?: any) => Promise<any>,
  updateDisciplineInList: (disciplineId: number, updates: any) => Promise<boolean>,
  removeDisciplineFromList: (disciplineId: number) => Promise<boolean>
) {
  const [disciplineStates, setDisciplineStates] = useState<DisciplineState[]>([]);

  // Adiciona disciplina à lista
  const handleAddDiscipline = useCallback(async (discipline: DisciplineWithClasses) => {
    console.log(`🔵 [useDisciplineList] Tentando adicionar disciplina ${discipline.codigo} (ID: ${discipline.id})`);
    
    // Usa o setter funcional para verificar duplicatas com estado atualizado
    let isDuplicate = false;
    
    setDisciplineStates(prev => {
      // Verifica se já existe
      if (prev.some(d => d.discipline.id === discipline.id)) {
        console.log(`🟡 [useDisciplineList] Disciplina ${discipline.codigo} já está na lista`);
        isDuplicate = true;
        return prev; // Retorna o estado atual sem mudanças
      }

      console.log(`🔵 [useDisciplineList] Adicionando disciplina ${discipline.codigo} à lista`);

      // Seleciona automaticamente a primeira turma disponível
      const firstClass = discipline.classes[0];
      const newState: DisciplineState = {
        discipline,
        isVisible: true,
        selectedClassId: firstClass?.id || null,
        isExpanded: false
      };

      console.log(`🟢 [useDisciplineList] Disciplina ${discipline.codigo} adicionada (total: ${prev.length + 1})`);
      return [...prev, newState];
    });

    // Se era duplicata, não salva no banco
    if (isDuplicate) return;

    // Salva no banco se autenticado (em background)
    if (isAuthenticated && activeScheduleId) {
      try {
        const firstClass = discipline.classes[0];
        await addDisciplineToList(discipline.id, {
          selectedClassId: firstClass?.id || null,
          isVisible: true,
          isExpanded: false
        });
        console.log(`🟢 [useDisciplineList] Disciplina ${discipline.codigo} salva no banco`);
      } catch (error) {
        console.error(`🔴 [useDisciplineList] Erro ao salvar disciplina ${discipline.codigo}:`, error);
        // Remove do estado local se falhar
        setDisciplineStates(prev => prev.filter(d => d.discipline.id !== discipline.id));
      }
    }
  }, [isAuthenticated, activeScheduleId, addDisciplineToList]); // Removida dependência de disciplineStates

  // Toggle visibilidade de uma disciplina
  const handleToggleVisibility = useCallback(async (disciplineId: number) => {
    let newIsVisible = false;
    
    // Usa setter funcional para obter estado atual
    setDisciplineStates(prev => {
      const discipline = prev.find(d => d.discipline.id === disciplineId);
      if (!discipline) return prev;

      newIsVisible = !discipline.isVisible;
      console.log(`🔵 [useDisciplineList] Toggle visibilidade disciplina ${disciplineId}: ${newIsVisible}`);

      return prev.map(d =>
        d.discipline.id === disciplineId ? { ...d, isVisible: newIsVisible } : d
      );
    });

    // Salva no banco se autenticado (em background)
    if (isAuthenticated && activeScheduleId) {
      try {
        await updateDisciplineInList(disciplineId, { isVisible: newIsVisible });
        console.log(`🟢 [useDisciplineList] Visibilidade salva no banco`);
      } catch (error) {
        console.error(`🔴 [useDisciplineList] Erro ao salvar visibilidade:`, error);
        // Reverte o estado se falhar
        setDisciplineStates(prev => prev.map(d =>
          d.discipline.id === disciplineId ? { ...d, isVisible: !newIsVisible } : d
        ));
      }
    }
  }, [isAuthenticated, activeScheduleId, updateDisciplineInList]);

  // Seleciona turma específica
  const handleSelectClass = useCallback(async (disciplineId: number, classId: number) => {
    console.log(`🔵 [useDisciplineList] Selecionando turma ${classId} para disciplina ${disciplineId}`);

    // Atualiza estado local IMEDIATAMENTE
    setDisciplineStates(prev => prev.map(d =>
      d.discipline.id === disciplineId ? { ...d, selectedClassId: classId } : d
    ));

    // Salva no banco se autenticado (em background)
    if (isAuthenticated && activeScheduleId) {
      try {
        await updateDisciplineInList(disciplineId, { selectedClassId: classId });
        console.log(`🟢 [useDisciplineList] Turma selecionada salva no banco`);
      } catch (error) {
        console.error(`🔴 [useDisciplineList] Erro ao salvar turma selecionada:`, error);
      }
    }
  }, [isAuthenticated, activeScheduleId, updateDisciplineInList]);

  // Toggle expansão
  const handleToggleExpanded = useCallback(async (disciplineId: number) => {
    let newIsExpanded = false;
    
    setDisciplineStates(prev => {
      const discipline = prev.find(d => d.discipline.id === disciplineId);
      if (!discipline) return prev;

      newIsExpanded = !discipline.isExpanded;
      return prev.map(d =>
        d.discipline.id === disciplineId ? { ...d, isExpanded: newIsExpanded } : d
      );
    });

    // Salva no banco se autenticado (em background)
    if (isAuthenticated && activeScheduleId) {
      try {
        await updateDisciplineInList(disciplineId, { isExpanded: newIsExpanded });
      } catch (error) {
        console.error(`🔴 [useDisciplineList] Erro ao salvar expansão:`, error);
      }
    }
  }, [isAuthenticated, activeScheduleId, updateDisciplineInList]); // Removido disciplineStates

  // Remove disciplina da lista
  const handleRemoveDiscipline = useCallback(async (disciplineId: number) => {
    console.log(`🔵 [useDisciplineList] Removendo disciplina ${disciplineId}`);

    // Atualiza estado local IMEDIATAMENTE
    setDisciplineStates(prev => prev.filter(d => d.discipline.id !== disciplineId));

    // Salva no banco se autenticado (em background)
    if (isAuthenticated && activeScheduleId) {
      try {
        await removeDisciplineFromList(disciplineId);
        console.log(`🟢 [useDisciplineList] Disciplina removida do banco`);
      } catch (error) {
        console.error(`🔴 [useDisciplineList] Erro ao remover disciplina:`, error);
      }
    }
  }, [isAuthenticated, activeScheduleId, removeDisciplineFromList]);

  // Limpa a lista (útil ao trocar de plano)
  const clearList = useCallback(() => {
    console.log(`🔵 [useDisciplineList] Limpando lista de disciplinas`);
    setDisciplineStates([]);
  }, []);

  // Carrega disciplinas do banco (substitui lista atual)
  const loadDisciplines = useCallback((disciplines: DisciplineState[]) => {
    console.log(`🔵 [useDisciplineList] Carregando ${disciplines.length} disciplinas do banco`);
    
    // Simplesmente substitui toda a lista
    // O clearList já foi chamado ao trocar de plano
    setDisciplineStates(disciplines);
  }, []);

  return {
    disciplineStates,
    handleAddDiscipline,
    handleToggleVisibility,
    handleSelectClass,
    handleToggleExpanded,
    handleRemoveDiscipline,
    clearList,
    loadDisciplines,
    setDisciplineStates
  };
}
