/**
 * Serviço para API do Fórum
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ================ TIPOS ================

export interface Question {
  id: number;
  title: string;
  content: string;
  user_id: number;
  user_name: string;
  user_image?: string | null;
  is_anonymous?: number;
  view_count: number;
  answer_count: number;
  vote_count: number;
  tags: string[];
  has_accepted_answer: boolean;
  created_at: string;
  user_vote?: number;
}

export interface Answer {
  id: number;
  question_id: number;
  user_id: number;
  user_name: string;
  user_image?: string | null;
  is_anonymous?: number;
  content: string;
  vote_count: number;
  is_accepted: boolean;
  created_at: string;
  user_vote?: number;
}

export interface QuestionDetail {
  id: number;
  title: string;
  content: string;
  user_id: number;
  user_name: string;
  user_image?: string | null;
  is_anonymous?: number;
  view_count: number;
  answer_count: number;
  vote_count: number;
  tags: string[];
  has_accepted_answer: boolean;
  created_at: string;
  user_vote?: number;
  answers: Answer[];
}

export interface Tag {
  id?: number;
  nome: string;
  topico?: string;
  descricao?: string;
  count?: number;
  created_by_user?: number;
  created_by_name?: string;
  approved?: number;
  created_at?: string;
}

export interface UserStats {
  questions_asked: number;
  answers_given: number;
  accepted_answers: number;
  total_reputation: number;
}

export interface GlobalStats {
  total_questions: number;
  total_answers: number;
  active_users: number;
  response_rate: number;
}

export interface TopContributor {
  id: number;
  name: string;
  profile_image?: string;
  pontos: number;
  questions: number;
  answers: number;
  accepted_answers: number;
}

export interface CreateQuestionDTO {
  titulo: string;
  conteudo: string;
  tags: string[];
  is_anonymous?: boolean;
}

export interface CreateAnswerDTO {
  conteudo: string;
  is_anonymous?: boolean;
}

// ================ HELPERS ================

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Erro na requisição');
  }
  return response.json();
}

// ================ FUNÇÕES DA API ================

export async function getQuestions(params?: {
  sortBy?: string;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<{ questions: Question[]; total: number; page: number; pages: number }> {
  const queryParams = new URLSearchParams();
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.tag) queryParams.append('tag', params.tag);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));

  const response = await fetch(
    `${API_BASE_URL}/api/forum/questions?${queryParams}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

export async function getQuestionById(id: number): Promise<QuestionDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/questions/${id}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

export async function createQuestion(data: CreateQuestionDTO): Promise<{ id: number; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/questions`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(response);
}

export async function updateQuestion(
  id: number,
  data: Partial<CreateQuestionDTO>
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/questions/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(response);
}

export async function deleteQuestion(id: number): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/questions/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function voteQuestion(questionId: number, value: 1 | -1): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/questions/${questionId}/vote`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ voteType: value }),
    }
  );
  return handleResponse(response);
}

export async function createAnswer(
  questionId: number,
  content: string,
  is_anonymous?: boolean
): Promise<{ id: number; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/questions/${questionId}/answers`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conteudo: content, is_anonymous }),
    }
  );
  return handleResponse(response);
}

export async function updateAnswer(
  answerId: number,
  content: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/answers/${answerId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conteudo: content }),
    }
  );
  return handleResponse(response);
}

export async function deleteAnswer(answerId: number): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/answers/${answerId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function acceptAnswer(answerId: number): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/answers/${answerId}/accept`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function voteAnswer(answerId: number, value: 1 | -1): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/answers/${answerId}/vote`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ voteType: value }),
    }
  );
  return handleResponse(response);
}

export async function getTags(): Promise<Tag[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/tags`,
    { headers: getAuthHeaders() }
  );
  const tags = await handleResponse<Tag[]>(response);
  return tags.sort((a, b) => (b.count || 0) - (a.count || 0));
}

export async function getPopularTags(limit: number = 8): Promise<Tag[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/tags/popular?limit=${limit}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

export async function getTopics(): Promise<string[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/topics`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

export async function createTag(data: { nome: string; topico: string; descricao: string }): Promise<{ id: number; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/tags`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(response);
}

export async function getPendingTags(): Promise<Tag[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/tags/pending`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

export async function approveTag(tagId: number): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/tags/${tagId}/approve`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function deleteTag(tagId: number): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/tags/${tagId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/stats`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

export async function getTopContributors(limit: number = 5): Promise<TopContributor[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/top-contributors?limit=${limit}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

export async function getUserStats(userId: number): Promise<UserStats> {
  const response = await fetch(
    `${API_BASE_URL}/api/forum/stats/user/${userId}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
}

// ================ UTILITÁRIOS ================

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `há ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `há ${months} mês${months > 1 ? 'es' : ''}`;
  }
  const years = Math.floor(diffDays / 365);
  return `há ${years} ano${years > 1 ? 's' : ''}`;
}
