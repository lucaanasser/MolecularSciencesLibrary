import { useState, useCallback, useEffect } from 'react';
import { DisciplineWithClasses } from '@/utils/combinationsGenerator';
import { logger } from '@/utils/logger';

/**
 * Interface para o estado de uma disciplina na lista
 */
export interface DisciplineState {
  discipline: DisciplineWithClasses;
  isVisible: boolean;
  selectedClassId: number | null;
  isExpanded: boolean;
  isCustom?: boolean; // Flag para disciplinas customizadas
  customDisciplineId?: number; // ID da disciplina customizada no banco
  creditos_aula?: number; // Créditos das customizadas
  creditos_trabalho?: number;
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
    logger.info(`🔵 [useDisciplineList] Tentando adicionar disciplina ${discipline.codigo} (ID: ${discipline.id})`);
    
    // Usa o setter funcional para verificar duplicatas com estado atualizado
    let isDuplicate = false;
    
    setDisciplineStates(prev => {
      // Verifica se já existe
      if (prev.some(d => d.discipline.id === discipline.id)) {
        logger.info(`🟡 [useDisciplineList] Disciplina ${discipline.codigo} já está na lista`);
        isDuplicate = true;
        return prev; // Retorna o estado atual sem mudanças
      }

      logger.info(`🔵 [useDisciplineList] Adicionando disciplina ${discipline.codigo} à lista`);

      // Seleciona automaticamente a primeira turma disponível
      const firstClass = discipline.classes[0];
      const newState: DisciplineState = {
        discipline,
        isVisible: true,
        selectedClassId: firstClass?.id || null,
        isExpanded: false
      };

      logger.info(`🟢 [useDisciplineList] Disciplina ${discipline.codigo} adicionada (total: ${prev.length + 1})`);
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
        logger.info(`🟢 [useDisciplineList] Disciplina ${discipline.codigo} salva no banco`);
      } catch (error) {
        logger.error(`🔴 [useDisciplineList] Erro ao salvar disciplina ${discipline.codigo}:`, error);
        // Remove do estado local se falhar
        setDisciplineStates(prev => prev.filter(d => d.discipline.id !== discipline.id));
      }
    }
  }, [isAuthenticated, activeScheduleId, addDisciplineToList]); // Removida dependência de disciplineStates

  // Adiciona disciplina customizada à lista
  const handleAddCustomDiscipline = useCallback((customDisciplineData: {
    id: number;
    nome: string;
    codigo?: string;
    creditos_aula?: number;
    creditos_trabalho?: number;
    color: string;
    schedules: Array<{ dia: string; horario_inicio: string; horario_fim: string }>;
  }) => {
    logger.info(`🔵 [useDisciplineList] Adicionando disciplina customizada ${customDisciplineData.nome}`);

    // Cria uma "disciplina falsa" para encaixar na estrutura existente
    const fakeDiscipline: DisciplineWithClasses = {
      id: -customDisciplineData.id, // ID negativo para diferenciar
      codigo: customDisciplineData.codigo || 'CUSTOM',
      nome: customDisciplineData.nome,
      creditos_aula: customDisciplineData.creditos_aula || 0,
      creditos_trabalho: customDisciplineData.creditos_trabalho || 0,
      classes: customDisciplineData.schedules.map((schedule, idx) => ({
        id: -customDisciplineData.id * 1000 - idx, // ID único negativo
        codigo_turma: 'MANUAL',
        tipo: 'TEÓRICA',
        inicio: '',
        fim: '',
        discipline_id: -customDisciplineData.id,
        discipline_codigo: customDisciplineData.codigo || 'CUSTOM',
        discipline_nome: customDisciplineData.nome,
        schedules: [schedule],
        professors: []
      }))
    };

    const newState: DisciplineState = {
      discipline: fakeDiscipline,
      isVisible: true,
      selectedClassId: null,
      isExpanded: false,
      isCustom: true,
      customDisciplineId: customDisciplineData.id,
      creditos_aula: customDisciplineData.creditos_aula,
      creditos_trabalho: customDisciplineData.creditos_trabalho
    };

    setDisciplineStates(prev => [...prev, newState]);
    logger.info(`🟢 [useDisciplineList] Disciplina customizada adicionada`);
  }, []);

  // Toggle visibilidade de uma disciplina (regular ou customizada)
  const handleToggleVisibility = useCallback(async (disciplineId: number, customId?: number) => {
    let newIsVisible = false;
    
    // Usa setter funcional para obter estado atual
    setDisciplineStates(prev => {
      const discipline = prev.find(d => d.discipline.id === disciplineId);
      if (!discipline) return prev;

      newIsVisible = !discipline.isVisible;
      logger.info(`🔵 [useDisciplineList] Toggle visibilidade disciplina ${disciplineId}: ${newIsVisible}`);

      return prev.map(d =>
        d.discipline.id === disciplineId ? { ...d, isVisible: newIsVisible } : d
      );
    });

    // Salva no banco se autenticado (em background)
    // Agora todas as disciplinas (regulares e customizadas) usam updateDisciplineInList
    if (isAuthenticated && activeScheduleId) {
      try {
        await updateDisciplineInList(disciplineId, { isVisible: newIsVisible });
        logger.info(`🟢 [useDisciplineList] Visibilidade salva no banco`);
      } catch (error) {
        logger.error(`🔴 [useDisciplineList] Erro ao salvar visibilidade:`, error);
        // Reverte o estado se falhar
        setDisciplineStates(prev => prev.map(d =>
          d.discipline.id === disciplineId ? { ...d, isVisible: !newIsVisible } : d
        ));
      }
    }
  }, [isAuthenticated, activeScheduleId, updateDisciplineInList]);

  // Seleciona turma específica
  const handleSelectClass = useCallback(async (disciplineId: number, classId: number) => {
    logger.info(`🔵 [useDisciplineList] Selecionando turma ${classId} para disciplina ${disciplineId}`);

    // Atualiza estado local IMEDIATAMENTE
    setDisciplineStates(prev => prev.map(d =>
      d.discipline.id === disciplineId ? { ...d, selectedClassId: classId } : d
    ));

    // Salva no banco se autenticado (em background)
    if (isAuthenticated && activeScheduleId) {
      try {
        await updateDisciplineInList(disciplineId, { selectedClassId: classId });
        logger.info(`🟢 [useDisciplineList] Turma selecionada salva no banco`);
      } catch (error) {
        logger.error(`🔴 [useDisciplineList] Erro ao salvar turma selecionada:`, error);
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
        logger.error(`🔴 [useDisciplineList] Erro ao salvar expansão:`, error);
      }
    }
  }, [isAuthenticated, activeScheduleId, updateDisciplineInList]); // Removido disciplineStates

  // Remove disciplina da lista (regular ou customizada)
  const handleRemoveDiscipline = useCallback(async (disciplineId: number, removeCustomDiscipline?: (id: number) => Promise<boolean>) => {
    logger.info(`🔵 [useDisciplineList] Removendo disciplina ${disciplineId}`);

    // Atualiza estado local IMEDIATAMENTE
    setDisciplineStates(prev => prev.filter(d => d.discipline.id !== disciplineId));

    // Salva no banco se autenticado (em background)
    // Agora todas as disciplinas (regulares e customizadas) estão em user_schedule_disciplines
    if (isAuthenticated && activeScheduleId) {
      try {
        await removeDisciplineFromList(disciplineId);
        logger.info(`🟢 [useDisciplineList] Disciplina removida do banco`);
      } catch (error) {
        logger.error(`🔴 [useDisciplineList] Erro ao remover disciplina:`, error);
      }
    }
  }, [isAuthenticated, activeScheduleId, removeDisciplineFromList]);

  // Exclui permanentemente uma disciplina customizada (hard delete em todas as tabelas)
  const handlePermanentDeleteDiscipline = useCallback(async (
    disciplineId: number,
    customDisciplineId: number,
    deleteCustomPermanently: (id: number) => Promise<boolean>
  ) => {
    logger.info(`🔵 [useDisciplineList] Excluindo permanentemente disciplina customizada ${customDisciplineId}`);

    // Remove do estado local imediatamente
    setDisciplineStates(prev => prev.filter(d => d.discipline.id !== disciplineId));

    // Hard delete no backend
    try {
      await deleteCustomPermanently(customDisciplineId);
      logger.info(`🟢 [useDisciplineList] Disciplina customizada ${customDisciplineId} excluída permanentemente`);
    } catch (error) {
      logger.error(`🔴 [useDisciplineList] Erro ao excluir disciplina permanentemente:`, error);
    }
  }, []);

  // Limpa a lista (útil ao trocar de plano)
  const clearList = useCallback(() => {
    logger.info(`🔵 [useDisciplineList] Limpando lista de disciplinas`);
    setDisciplineStates([]);
  }, []);

  // Carrega disciplinas do banco (substitui lista atual)
  const loadDisciplines = useCallback((disciplines: DisciplineState[]) => {
    logger.info(`🔵 [useDisciplineList] Carregando ${disciplines.length} disciplinas do banco`);
    
    // Simplesmente substitui toda a lista
    // O clearList já foi chamado ao trocar de plano
    setDisciplineStates(disciplines);
  }, []);

  return {
    disciplineStates,
    handleAddDiscipline,
    handleAddCustomDiscipline,
    handleToggleVisibility,
    handleSelectClass,
    handleToggleExpanded,
    handleRemoveDiscipline,
    handlePermanentDeleteDiscipline,
    clearList,
    loadDisciplines,
    setDisciplineStates
  };
}
