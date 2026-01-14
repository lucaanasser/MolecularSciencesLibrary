/**
 * Serviço para buscar disciplinas da API
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// ================ TIPOS ================

export interface Discipline {
  id: number;
  codigo: string;
  nome: string;
  unidade: string | null;
  campus: string | null;
  creditos_aula: number;
  creditos_trabalho: number;
  has_valid_classes: boolean;
  is_postgrad: boolean;
  ementa: string | null;
  objetivos: string | null;
  conteudo_programatico: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisciplineClass {
  id: number;
  discipline_id: number;
  codigo_turma: string;
  codigo_turma_teorica: string | null;
  tipo: string | null;
  inicio: string | null;
  fim: string | null;
  observacoes: string | null;
  schedules: ClassSchedule[];
  professors: string[];
}

export interface ClassSchedule {
  id: number;
  class_id: number;
  dia: string;
  horario_inicio: string;
  horario_fim: string;
  professor_nome?: string;
}

export interface FullDiscipline extends Discipline {
  turmas: DisciplineClass[];
}

export interface DisciplineFilters {
  campus?: string;
  unidade?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DisciplineStats {
  total: number;
  with_valid_classes: number;
  campi: { campus: string; count: number }[];
  unidades: { unidade: string; count: number }[];
}

export interface SearchResult {
  codigo: string;
  nome: string;
  unidade: string | null;
  campus: string | null;
}

// ================ SERVIÇO ================

/**
 * Busca disciplinas com autocomplete
 * GET /api/disciplines/search?q=termo&limit=10
 */
export async function searchDisciplines(query: string, limit: number = 10): Promise<SearchResult[]> {
  console.log(`🔵 [DisciplinesService] Buscando disciplinas: "${query}"`);
  
  if (!query || query.length < 2) {
    return [];
  }
  
  const response = await fetch(`/api/disciplines/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  
  if (!response.ok) {
    console.error(`🔴 [DisciplinesService] Erro ao buscar disciplinas`);
    throw new Error("Erro ao buscar disciplinas");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplinesService] ${data.length} disciplinas encontradas`);
  return data;
}

/**
 * Busca disciplinas com filtros
 * GET /api/disciplines?campus=X&unidade=Y&search=Z&limit=N&offset=M
 */
export async function getDisciplines(filters: DisciplineFilters = {}): Promise<Discipline[]> {
  console.log(`🔵 [DisciplinesService] Buscando disciplinas com filtros:`, filters);
  
  const params = new URLSearchParams();
  if (filters.campus) params.append("campus", filters.campus);
  if (filters.unidade) params.append("unidade", filters.unidade);
  if (filters.search) params.append("search", filters.search);
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.offset) params.append("offset", filters.offset.toString());
  
  const url = `/api/disciplines${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`🔴 [DisciplinesService] Erro ao buscar disciplinas`);
    throw new Error("Erro ao buscar disciplinas");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplinesService] ${data.length} disciplinas retornadas`);
  return data;
}

/**
 * Busca disciplina por código
 * GET /api/disciplines/:codigo
 */
export async function getDisciplineByCodigo(codigo: string): Promise<Discipline | null> {
  console.log(`🔵 [DisciplinesService] Buscando disciplina: ${codigo}`);
  
  const response = await fetch(`/api/disciplines/${encodeURIComponent(codigo)}`);
  
  if (response.status === 404) {
    console.log(`🟡 [DisciplinesService] Disciplina não encontrada: ${codigo}`);
    return null;
  }
  
  if (!response.ok) {
    console.error(`🔴 [DisciplinesService] Erro ao buscar disciplina`);
    throw new Error("Erro ao buscar disciplina");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplinesService] Disciplina encontrada: ${codigo}`);
  return data;
}

/**
 * Busca disciplina completa com turmas, horários e professores
 * GET /api/disciplines/:codigo/full
 */
export async function getFullDiscipline(codigo: string): Promise<FullDiscipline | null> {
  console.log(`🔵 [DisciplinesService] Buscando disciplina completa: ${codigo}`);
  
  const response = await fetch(`/api/disciplines/${encodeURIComponent(codigo)}/full`);
  
  if (response.status === 404) {
    console.log(`🟡 [DisciplinesService] Disciplina não encontrada: ${codigo}`);
    return null;
  }
  
  if (!response.ok) {
    console.error(`🔴 [DisciplinesService] Erro ao buscar disciplina completa`);
    throw new Error("Erro ao buscar disciplina");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplinesService] Disciplina completa encontrada: ${codigo}`);
  return data;
}

/**
 * Lista todos os campi disponíveis
 * GET /api/disciplines/campi
 */
export async function getCampi(): Promise<string[]> {
  console.log(`🔵 [DisciplinesService] Buscando campi`);
  
  const response = await fetch(`/api/disciplines/campi`);
  
  if (!response.ok) {
    console.error(`🔴 [DisciplinesService] Erro ao buscar campi`);
    throw new Error("Erro ao buscar campi");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplinesService] ${data.length} campi encontrados`);
  return data;
}

/**
 * Lista todas as unidades disponíveis
 * GET /api/disciplines/unidades
 */
export async function getUnidades(campus?: string): Promise<string[]> {
  console.log(`🔵 [DisciplinesService] Buscando unidades${campus ? ` (campus: ${campus})` : ""}`);
  
  const url = campus ? `/api/disciplines/unidades?campus=${encodeURIComponent(campus)}` : "/api/disciplines/unidades";
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`🔴 [DisciplinesService] Erro ao buscar unidades`);
    throw new Error("Erro ao buscar unidades");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplinesService] ${data.length} unidades encontradas`);
  return data;
}

/**
 * Busca estatísticas das disciplinas
 * GET /api/disciplines/stats
 */
export async function getStats(): Promise<DisciplineStats> {
  console.log(`🔵 [DisciplinesService] Buscando estatísticas`);
  
  const response = await fetch(`/api/disciplines/stats`);
  
  if (!response.ok) {
    console.error(`🔴 [DisciplinesService] Erro ao buscar estatísticas`);
    throw new Error("Erro ao buscar estatísticas");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplinesService] Estatísticas retornadas`);
  return data;
}

/**
 * Conta total de disciplinas
 * GET /api/disciplines/count
 */
export async function countDisciplines(): Promise<number> {
  console.log(`🔵 [DisciplinesService] Contando disciplinas`);
  
  const response = await fetch(`/api/disciplines/count`);
  
  if (!response.ok) {
    console.error(`🔴 [DisciplinesService] Erro ao contar disciplinas`);
    throw new Error("Erro ao contar disciplinas");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplinesService] Total: ${data.count} disciplinas`);
  return data.count;
}

// ================ TIPOS PARA CRIAÇÃO ================

export interface CreateDisciplineData {
  codigo: string;
  nome: string;
  unidade?: string;
  campus?: string;
  creditos_aula?: number;
  creditos_trabalho?: number;
  is_postgrad?: boolean;
  ementa?: string;
  objetivos?: string;
  conteudo_programatico?: string;
}

export interface CreateDisciplineError {
  error: string;
  codigo?: string;
  nome?: string;
}

// ================ CRIAÇÃO MANUAL ================

/**
 * Cria uma disciplina manualmente
 * POST /api/disciplines
 */
export async function createDiscipline(data: CreateDisciplineData): Promise<Discipline> {
  console.log(`🔵 [DisciplinesService] Criando disciplina: ${data.codigo}`);
  
  const response = await fetch('/api/disciplines', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData: CreateDisciplineError = await response.json();
    console.error(`🔴 [DisciplinesService] Erro ao criar disciplina:`, errorData);
    
    // Retorna erro estruturado para tratamento no frontend
    const error = new Error(errorData.error) as Error & { data?: CreateDisciplineError };
    error.data = errorData;
    throw error;
  }
  
  const discipline = await response.json();
  console.log(`🟢 [DisciplinesService] Disciplina criada: ${discipline.codigo}`);
  return discipline;
}
