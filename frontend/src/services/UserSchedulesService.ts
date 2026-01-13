/**
 * Serviço para gerenciar grades horárias dos usuários
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// ================ TIPOS ================

export interface Schedule {
  id: number;
  user_id: number;
  name: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassScheduleTime {
  id: number;
  class_id: number;
  dia: string;
  horario_inicio: string;
  horario_fim: string;
  professor_nome?: string;
}

export interface ScheduleClass {
  id: number;
  schedule_id: number;
  class_id: number;
  color: string;
  is_visible: boolean;
  codigo_turma: string;
  tipo: string;
  inicio: string;
  fim: string;
  observacoes?: string;
  discipline_id: number;
  discipline_codigo: string;
  discipline_nome: string;
  unidade: string;
  campus: string;
  creditos_aula: number;
  creditos_trabalho: number;
  schedules?: ClassScheduleTime[];
}

export interface CustomDiscipline {
  id: number;
  schedule_id: number;
  nome: string;
  codigo?: string;
  dia: string;
  horario_inicio: string;
  horario_fim: string;
  color: string;
  is_visible: boolean;
  created_at: string;
  schedule_name?: string;
}

export interface ScheduleDiscipline {
  id: number;
  schedule_id: number;
  discipline_id: number;
  selected_class_id: number | null;
  is_visible: boolean;
  is_expanded: boolean;
  color: string;
  discipline_codigo: string;
  discipline_nome: string;
  unidade: string;
  campus: string;
  creditos_aula: number;
  creditos_trabalho: number;
}

export interface FullSchedule extends Schedule {
  classes: ScheduleClass[];
  customDisciplines: CustomDiscipline[];
  scheduleDisciplines: ScheduleDiscipline[];
}

export interface Conflict {
  newClass: {
    dia: string;
    horario_inicio: string;
    horario_fim: string;
  };
  existingSlot: {
    type: 'class' | 'custom';
    id: number;
    discipline_codigo: string;
    discipline_nome: string;
    dia: string;
    horario_inicio: string;
    horario_fim: string;
  };
}

export interface Credits {
  creditos_aula: number;
  creditos_trabalho: number;
}

// ================ PALETA DE CORES ================

export const SCHEDULE_COLORS = [
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#eab308', // yellow-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#a855f7', // purple-500
];

// ================ SERVICE ================

class UserSchedulesService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // ==================== PLANOS ====================

  /**
   * Lista todos os planos do usuário
   */
  async getSchedules(): Promise<Schedule[]> {
    console.log('🔵 [UserSchedulesService] Listando planos');
    try {
      const response = await fetch('/api/user-schedules', {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Não autenticado');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const schedules = await response.json();
      console.log(`🟢 [UserSchedulesService] ${schedules.length} planos encontrados`);
      return schedules;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao listar planos:', error);
      throw error;
    }
  }

  /**
   * Busca plano completo com turmas e disciplinas customizadas
   */
  async getFullSchedule(scheduleId: number): Promise<FullSchedule> {
    console.log(`🔵 [UserSchedulesService] Buscando plano completo ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/full`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 404) throw new Error('Plano não encontrado');
        if (response.status === 401) throw new Error('Não autenticado');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const schedule = await response.json();
      console.log(`🟢 [UserSchedulesService] Plano completo carregado`);
      return schedule;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao buscar plano completo:', error);
      throw error;
    }
  }

  /**
   * Cria um novo plano
   */
  async createSchedule(name?: string): Promise<Schedule> {
    console.log('🔵 [UserSchedulesService] Criando novo plano');
    try {
      const response = await fetch('/api/user-schedules', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      const schedule = await response.json();
      console.log(`🟢 [UserSchedulesService] Plano criado: ${schedule.id}`);
      return schedule;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao criar plano:', error);
      throw error;
    }
  }

  /**
   * Atualiza um plano (nome)
   */
  async updateSchedule(scheduleId: number, updates: { name?: string; is_active?: boolean }): Promise<Schedule> {
    console.log(`🔵 [UserSchedulesService] Atualizando plano ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      const schedule = await response.json();
      console.log(`🟢 [UserSchedulesService] Plano atualizado`);
      return schedule;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao atualizar plano:', error);
      throw error;
    }
  }

  /**
   * Remove um plano (soft delete)
   */
  async deleteSchedule(scheduleId: number): Promise<void> {
    console.log(`🔵 [UserSchedulesService] Removendo plano ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      console.log(`🟢 [UserSchedulesService] Plano removido`);
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao remover plano:', error);
      throw error;
    }
  }

  // ==================== TURMAS ====================

  /**
   * Adiciona uma turma ao plano
   */
  async addClass(scheduleId: number, classId: number): Promise<{ id: number; color: string }> {
    console.log(`🔵 [UserSchedulesService] Adicionando turma ${classId} ao plano ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/classes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ classId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      const result = await response.json();
      console.log(`🟢 [UserSchedulesService] Turma adicionada`);
      return result;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao adicionar turma:', error);
      throw error;
    }
  }

  /**
   * Remove uma turma do plano
   */
  async removeClass(scheduleId: number, classId: number): Promise<void> {
    console.log(`🔵 [UserSchedulesService] Removendo turma ${classId} do plano ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/classes/${classId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      console.log(`🟢 [UserSchedulesService] Turma removida`);
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao remover turma:', error);
      throw error;
    }
  }

  /**
   * Atualiza a cor de uma turma
   */
  async updateClassColor(scheduleId: number, classId: number, color: string): Promise<void> {
    console.log(`🔵 [UserSchedulesService] Atualizando cor da turma ${classId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/classes/${classId}/color`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ color })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      console.log(`🟢 [UserSchedulesService] Cor atualizada`);
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao atualizar cor:', error);
      throw error;
    }
  }

  /**
   * Verifica conflitos antes de adicionar uma turma
   */
  async checkConflicts(scheduleId: number, classId: number): Promise<{ hasConflicts: boolean; conflicts: Conflict[] }> {
    console.log(`🔵 [UserSchedulesService] Verificando conflitos para turma ${classId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/check-conflicts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ classId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      const result = await response.json();
      console.log(`🟢 [UserSchedulesService] Conflitos verificados: ${result.conflicts.length}`);
      return result;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao verificar conflitos:', error);
      throw error;
    }
  }

  // ==================== DISCIPLINAS CUSTOMIZADAS ====================

  /**
   * Lista disciplinas customizadas do usuário
   */
  async getCustomDisciplines(): Promise<CustomDiscipline[]> {
    console.log('🔵 [UserSchedulesService] Listando disciplinas customizadas');
    try {
      const response = await fetch('/api/user-schedules/custom-disciplines', {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const disciplines = await response.json();
      console.log(`🟢 [UserSchedulesService] ${disciplines.length} disciplinas customizadas`);
      return disciplines;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao listar disciplinas customizadas:', error);
      throw error;
    }
  }

  /**
   * Cria uma disciplina customizada
   */
  async createCustomDiscipline(data: {
    nome: string;
    codigo?: string;
    dia: string;
    horario_inicio: string;
    horario_fim: string;
    color?: string;
    schedule_id: number;
  }): Promise<CustomDiscipline> {
    console.log('🔵 [UserSchedulesService] Criando disciplina customizada');
    try {
      const response = await fetch('/api/user-schedules/custom-disciplines', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      const discipline = await response.json();
      console.log(`🟢 [UserSchedulesService] Disciplina customizada criada: ${discipline.id}`);
      return discipline;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao criar disciplina customizada:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma disciplina customizada
   */
  async updateCustomDiscipline(disciplineId: number, updates: Partial<CustomDiscipline>): Promise<void> {
    console.log(`🔵 [UserSchedulesService] Atualizando disciplina customizada ${disciplineId}`);
    try {
      const response = await fetch(`/api/user-schedules/custom-disciplines/${disciplineId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      console.log(`🟢 [UserSchedulesService] Disciplina customizada atualizada`);
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao atualizar disciplina customizada:', error);
      throw error;
    }
  }

  /**
   * Remove uma disciplina customizada
   */
  async deleteCustomDiscipline(disciplineId: number): Promise<void> {
    console.log(`🔵 [UserSchedulesService] Removendo disciplina customizada ${disciplineId}`);
    try {
      const response = await fetch(`/api/user-schedules/custom-disciplines/${disciplineId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      console.log(`🟢 [UserSchedulesService] Disciplina customizada removida`);
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao remover disciplina customizada:', error);
      throw error;
    }
  }

  // ==================== DISCIPLINAS NA LISTA (SIDEBAR) ====================

  /**
   * Adiciona uma disciplina à lista do plano
   */
  async addDisciplineToSchedule(scheduleId: number, disciplineId: number, options?: {
    selectedClassId?: number | null;
    isVisible?: boolean;
    isExpanded?: boolean;
    color?: string;
  }): Promise<ScheduleDiscipline> {
    console.log(`🔵 [UserSchedulesService] Adicionando disciplina ${disciplineId} à lista do plano ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/disciplines`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ disciplineId, ...options })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      const result = await response.json();
      console.log(`🟢 [UserSchedulesService] Disciplina adicionada à lista`);
      return result;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao adicionar disciplina à lista:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma disciplina na lista do plano
   */
  async updateScheduleDiscipline(scheduleId: number, disciplineId: number, updates: {
    selectedClassId?: number | null;
    isVisible?: boolean;
    isExpanded?: boolean;
    color?: string;
  }): Promise<void> {
    console.log(`🔵 [UserSchedulesService] Atualizando disciplina ${disciplineId} na lista do plano ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/disciplines/${disciplineId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      console.log(`🟢 [UserSchedulesService] Disciplina atualizada na lista`);
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao atualizar disciplina na lista:', error);
      throw error;
    }
  }

  /**
   * Remove uma disciplina da lista do plano
   */
  async removeDisciplineFromSchedule(scheduleId: number, disciplineId: number): Promise<void> {
    console.log(`🔵 [UserSchedulesService] Removendo disciplina ${disciplineId} da lista do plano ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/disciplines/${disciplineId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro HTTP: ${response.status}`);
      }
      console.log(`🟢 [UserSchedulesService] Disciplina removida da lista`);
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao remover disciplina da lista:', error);
      throw error;
    }
  }

  /**
   * Lista disciplinas de um plano
   */
  async getScheduleDisciplines(scheduleId: number): Promise<ScheduleDiscipline[]> {
    console.log(`🔵 [UserSchedulesService] Listando disciplinas do plano ${scheduleId}`);
    try {
      const response = await fetch(`/api/user-schedules/${scheduleId}/disciplines`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const disciplines = await response.json();
      console.log(`🟢 [UserSchedulesService] ${disciplines.length} disciplinas encontradas`);
      return disciplines;
    } catch (error) {
      console.error('🔴 [UserSchedulesService] Erro ao listar disciplinas:', error);
      throw error;
    }
  }
}

export const userSchedulesService = new UserSchedulesService();
export default userSchedulesService;
