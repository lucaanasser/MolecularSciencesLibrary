/**
 * Serviço para gerenciar avaliações de livros
 * 
 * Ratings: 0.5 a 5.0 em incrementos de 0.5 (estilo Letterboxd)
 * Critérios: Geral, Qualidade do Conteúdo, Legibilidade, Utilidade, Precisão
 * 
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

export interface BookEvaluation {
  id: number;
  book_id: number;
  user_id: number;
  rating_geral: number | null;
  rating_qualidade: number | null;
  rating_legibilidade: number | null;
  rating_utilidade: number | null;
  rating_precisao: number | null;
  comentario: string | null;
  is_anonymous: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  is_own_evaluation?: boolean;
  user_has_voted?: boolean;
}

export interface BookAggregatedRatings {
  total_avaliacoes: number;
  media_geral: number | null;
  media_qualidade: number | null;
  media_legibilidade: number | null;
  media_utilidade: number | null;
  media_precisao: number | null;
  total_comentarios: number;
}

export interface CreateBookEvaluationData {
  bookId: number;
  ratingGeral?: number | null;
  ratingQualidade?: number | null;
  ratingLegibilidade?: number | null;
  ratingUtilidade?: number | null;
  ratingPrecisao?: number | null;
  comentario?: string;
  isAnonymous?: boolean;
}

export interface UpdateBookEvaluationData {
  ratingGeral?: number | null;
  ratingQualidade?: number | null;
  ratingLegibilidade?: number | null;
  ratingUtilidade?: number | null;
  ratingPrecisao?: number | null;
  comentario?: string;
  isAnonymous?: boolean;
}

export interface BookEvaluationWithBook extends BookEvaluation {
  book_title: string;
  book_authors: string;
  book_code: string;
}

// ================ HELPERS ================

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ================ SERVIÇO ================

/**
 * Busca avaliações de um livro (ordenadas por likes)
 * Rota pública, mas se autenticado retorna info adicional
 */
export async function getBookEvaluations(bookId: number): Promise<BookEvaluation[]> {
  console.log(`🔵 [BookEvaluationsService] Buscando avaliações: bookId=${bookId}`);
  
  const response = await fetch(`/api/books/${bookId}/evaluations`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    console.error(`🔴 [BookEvaluationsService] Erro ao buscar avaliações`);
    throw new Error("Erro ao buscar avaliações");
  }
  
  const data = await response.json();
  console.log(`🟢 [BookEvaluationsService] ${data.length} avaliações encontradas`);
  return data;
}

/**
 * Busca ratings agregados (médias) de um livro
 * Rota pública
 */
export async function getBookAggregatedRatings(bookId: number): Promise<BookAggregatedRatings> {
  console.log(`🔵 [BookEvaluationsService] Buscando ratings agregados: bookId=${bookId}`);
  
  const response = await fetch(`/api/books/${bookId}/evaluations/stats`);
  
  if (!response.ok) {
    console.error(`🔴 [BookEvaluationsService] Erro ao buscar ratings`);
    throw new Error("Erro ao buscar ratings");
  }
  
  const data = await response.json();
  console.log(`🟢 [BookEvaluationsService] Ratings agregados retornados`);
  return data;
}

/**
 * Busca a avaliação do usuário logado para um livro
 * Requer autenticação
 */
export async function getMyBookEvaluation(bookId: number): Promise<BookEvaluation | null> {
  console.log(`🔵 [BookEvaluationsService] Buscando minha avaliação: bookId=${bookId}`);
  
  const response = await fetch(`/api/books/${bookId}/evaluations/mine`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (response.status === 404) {
    console.log(`🟡 [BookEvaluationsService] Usuário ainda não avaliou`);
    return null;
  }
  
  if (!response.ok) {
    console.error(`🔴 [BookEvaluationsService] Erro ao buscar minha avaliação`);
    throw new Error("Erro ao buscar sua avaliação");
  }
  
  const data = await response.json();
  console.log(`🟢 [BookEvaluationsService] Avaliação do usuário encontrada`);
  return data;
}

/**
 * Busca todas as avaliações de livros do usuário logado
 * Requer autenticação
 */
export async function getMyBookEvaluations(): Promise<BookEvaluationWithBook[]> {
  console.log(`🔵 [BookEvaluationsService] Buscando minhas avaliações de livros`);
  
  const response = await fetch(`/api/books/evaluations/mine`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    console.error(`🔴 [BookEvaluationsService] Erro ao buscar avaliações`);
    throw new Error("Erro ao buscar suas avaliações");
  }
  
  const data = await response.json();
  console.log(`🟢 [BookEvaluationsService] ${data.length} avaliações encontradas`);
  return data;
}

/**
 * Cria uma nova avaliação de livro
 * Requer autenticação
 */
export async function createBookEvaluation(data: CreateBookEvaluationData): Promise<{ id: number }> {
  console.log(`🔵 [BookEvaluationsService] Criando avaliação: bookId=${data.bookId}`);
  
  const response = await fetch(`/api/books/evaluations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`🔴 [BookEvaluationsService] Erro ao criar avaliação:`, error);
    throw new Error(error.error || "Erro ao criar avaliação");
  }
  
  const result = await response.json();
  console.log(`🟢 [BookEvaluationsService] Avaliação criada: id=${result.id}`);
  return result;
}

/**
 * Atualiza uma avaliação existente (só a própria)
 * Requer autenticação
 */
export async function updateBookEvaluation(id: number, data: UpdateBookEvaluationData): Promise<{ id: number; updated: boolean }> {
  console.log(`🔵 [BookEvaluationsService] Atualizando avaliação: ${id}`);
  
  const response = await fetch(`/api/books/evaluations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`🔴 [BookEvaluationsService] Erro ao atualizar avaliação:`, error);
    throw new Error(error.error || "Erro ao atualizar avaliação");
  }
  
  const result = await response.json();
  console.log(`🟢 [BookEvaluationsService] Avaliação atualizada: id=${id}`);
  return result;
}

/**
 * Deleta uma avaliação de livro (só a própria)
 * Requer autenticação
 */
export async function deleteBookEvaluation(id: number): Promise<void> {
  console.log(`🔵 [BookEvaluationsService] Deletando avaliação: ${id}`);
  
  const response = await fetch(`/api/books/evaluations/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`🔴 [BookEvaluationsService] Erro ao deletar avaliação:`, error);
    throw new Error(error.error || "Erro ao deletar avaliação");
  }
  
  console.log(`🟢 [BookEvaluationsService] Avaliação deletada: id=${id}`);
}

/**
 * Toggle like em uma avaliação de livro
 * Requer autenticação
 */
export async function toggleBookEvaluationLike(evaluationId: number): Promise<{ liked: boolean }> {
  console.log(`🔵 [BookEvaluationsService] Toggle like: ${evaluationId}`);
  
  const response = await fetch(`/api/books/evaluations/${evaluationId}/like`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`🔴 [BookEvaluationsService] Erro ao toggle like:`, error);
    throw new Error(error.error || "Erro ao processar like");
  }
  
  const result = await response.json();
  console.log(`🟢 [BookEvaluationsService] Like ${result.liked ? 'adicionado' : 'removido'}`);
  return result;
}
