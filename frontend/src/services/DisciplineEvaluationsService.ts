/**
 * Serviço para gerenciar avaliações de disciplinas
 * 
 * Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
 * Avaliações de estrelas são sempre anônimas
 * Comentários mostram nome por padrão, mas usuário pode escolher anonimato
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// ================ TIPOS ================

export interface Evaluation {
  id: number;
  discipline_id: number;
  user_id: number;
  turma_codigo: string | null;
  semestre: string | null;
  rating_geral: number | null;
  rating_dificuldade: number | null;
  rating_carga_trabalho: number | null;
  rating_professores: number | null;
  rating_clareza: number | null;
  rating_utilidade: number | null;
  rating_organizacao: number | null;
  comentario: string | null;
  is_anonymous: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  is_own_evaluation?: boolean;
  user_has_voted?: boolean;
}

export interface AggregatedRatings {
  total_avaliacoes: number;
  media_geral: number | null;
  media_dificuldade: number | null;
  media_carga_trabalho: number | null;
  media_professores: number | null;
  media_clareza: number | null;
  media_utilidade: number | null;
  media_organizacao: number | null;
  total_comentarios: number;
}

export interface CreateEvaluationData {
  disciplineCodigo: string;
  turmaCodigo?: string;
  semestre?: string;
  ratingGeral?: number | null;
  ratingDificuldade?: number | null;
  ratingCargaTrabalho?: number | null;
  ratingProfessores?: number | null;
  ratingClareza?: number | null;
  ratingUtilidade?: number | null;
  ratingOrganizacao?: number | null;
  comentario?: string;
  isAnonymous?: boolean;
}

export interface UpdateEvaluationData {
  turmaCodigo?: string;
  semestre?: string;
  ratingGeral?: number | null;
  ratingDificuldade?: number | null;
  ratingCargaTrabalho?: number | null;
  ratingProfessores?: number | null;
  ratingClareza?: number | null;
  ratingUtilidade?: number | null;
  ratingOrganizacao?: number | null;
  comentario?: string;
  isAnonymous?: boolean;
}

export interface EvaluationWithDiscipline extends Evaluation {
  discipline_codigo: string;
  discipline_nome: string;
}

// ================ HELPERS ================

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ================ SERVIÇO ================

/**
 * Busca avaliações de uma disciplina (ordenadas por likes)
 * Rota pública, mas se autenticado retorna info adicional
 */
export async function getEvaluationsByDiscipline(codigo: string): Promise<Evaluation[]> {
  console.log(`🔵 [DisciplineEvaluationsService] Buscando avaliações: ${codigo}`);
  
  const response = await fetch(`/api/evaluations/discipline/${codigo}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    console.error(`🔴 [DisciplineEvaluationsService] Erro ao buscar avaliações`);
    throw new Error("Erro ao buscar avaliações");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplineEvaluationsService] ${data.length} avaliações encontradas`);
  return data;
}

/**
 * Busca ratings agregados (médias) de uma disciplina
 * Rota pública
 */
export async function getAggregatedRatings(codigo: string): Promise<AggregatedRatings> {
  console.log(`🔵 [DisciplineEvaluationsService] Buscando ratings agregados: ${codigo}`);
  
  const response = await fetch(`/api/evaluations/discipline/${codigo}/stats`);
  
  if (!response.ok) {
    console.error(`🔴 [DisciplineEvaluationsService] Erro ao buscar ratings`);
    throw new Error("Erro ao buscar ratings");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplineEvaluationsService] Ratings agregados retornados`);
  return data;
}

/**
 * Busca a avaliação do usuário logado para uma disciplina
 * Requer autenticação
 */
export async function getMyEvaluationForDiscipline(codigo: string): Promise<Evaluation | null> {
  console.log(`🔵 [DisciplineEvaluationsService] Buscando minha avaliação: ${codigo}`);
  
  const response = await fetch(`/api/evaluations/discipline/${codigo}/mine`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (response.status === 404) {
    console.log(`🟡 [DisciplineEvaluationsService] Usuário ainda não avaliou`);
    return null;
  }
  
  if (!response.ok) {
    console.error(`🔴 [DisciplineEvaluationsService] Erro ao buscar minha avaliação`);
    throw new Error("Erro ao buscar sua avaliação");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplineEvaluationsService] Avaliação do usuário encontrada`);
  return data;
}

/**
 * Busca todas as avaliações do usuário logado
 * Requer autenticação
 */
export async function getMyEvaluations(): Promise<EvaluationWithDiscipline[]> {
  console.log(`🔵 [DisciplineEvaluationsService] Buscando minhas avaliações`);
  
  const response = await fetch(`/api/evaluations/mine`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    console.error(`🔴 [DisciplineEvaluationsService] Erro ao buscar avaliações`);
    throw new Error("Erro ao buscar suas avaliações");
  }
  
  const data = await response.json();
  console.log(`🟢 [DisciplineEvaluationsService] ${data.length} avaliações encontradas`);
  return data;
}

/**
 * Cria uma nova avaliação
 * Requer autenticação
 */
export async function createEvaluation(data: CreateEvaluationData): Promise<{ id: number }> {
  console.log(`🔵 [DisciplineEvaluationsService] Criando avaliação: ${data.disciplineCodigo}`);
  
  const response = await fetch(`/api/evaluations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`🔴 [DisciplineEvaluationsService] Erro ao criar avaliação:`, error);
    throw new Error(error.error || "Erro ao criar avaliação");
  }
  
  const result = await response.json();
  console.log(`🟢 [DisciplineEvaluationsService] Avaliação criada: id=${result.id}`);
  return result;
}

/**
 * Atualiza uma avaliação existente (só a própria)
 * Requer autenticação
 */
export async function updateEvaluation(id: number, data: UpdateEvaluationData): Promise<{ id: number; updated: boolean }> {
  console.log(`🔵 [DisciplineEvaluationsService] Atualizando avaliação: ${id}`);
  
  const response = await fetch(`/api/evaluations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`🔴 [DisciplineEvaluationsService] Erro ao atualizar avaliação:`, error);
    throw new Error(error.error || "Erro ao atualizar avaliação");
  }
  
  const result = await response.json();
  console.log(`🟢 [DisciplineEvaluationsService] Avaliação atualizada: id=${id}`);
  return result;
}

/**
 * Deleta uma avaliação (só a própria)
 * Requer autenticação
 */
export async function deleteEvaluation(id: number): Promise<void> {
  console.log(`🔵 [DisciplineEvaluationsService] Deletando avaliação: ${id}`);
  
  const response = await fetch(`/api/evaluations/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`🔴 [DisciplineEvaluationsService] Erro ao deletar avaliação:`, error);
    throw new Error(error.error || "Erro ao deletar avaliação");
  }
  
  console.log(`🟢 [DisciplineEvaluationsService] Avaliação deletada: id=${id}`);
}

/**
 * Toggle like em uma avaliação
 * Requer autenticação
 */
export async function toggleLike(evaluationId: number): Promise<{ liked: boolean }> {
  console.log(`🔵 [DisciplineEvaluationsService] Toggle like: ${evaluationId}`);
  
  const response = await fetch(`/api/evaluations/${evaluationId}/like`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`🔴 [DisciplineEvaluationsService] Erro ao toggle like:`, error);
    throw new Error(error.error || "Erro ao processar like");
  }
  
  const result = await response.json();
  console.log(`🟢 [DisciplineEvaluationsService] Like ${result.liked ? 'adicionado' : 'removido'}`);
  return result;
}
