/**
 * Serviço para buscar usuários da API
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// ================ TIPOS ================

export interface User {
  id: number;
  name: string;
  NUSP: string;
  email: string;
  phone: string;
  role: string;
  profile_image?: string;
  class?: string;
  created_at: string;
}

export interface UserSearchResult {
  id: number;
  name: string;
  class?: string;
  profile_image?: string;
  tags?: string[];
  curso_origem?: string;
  disciplines?: string[];
}

export interface UserSearchFilters {
  tags?: string[];
  curso?: string;
  disciplina?: string;
  turma?: string;
}

// ================ HELPERS ================

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

// ================ SERVIÇO ================

/**
 * Busca usuários com autocomplete e filtros
 * GET /api/users/search?q=termo&limit=10&tags[]=tag1&curso=BCC&disciplina=MAC0110&turma=2024A
 */
export async function searchUsers(
  query: string, 
  limit: number = 1000,
  filters?: UserSearchFilters
): Promise<UserSearchResult[]> {
  console.log(`🔵 [UsersService] Buscando usuários: "${query}"`, filters);
  
  // Monta query params
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  params.append('limit', limit.toString());
  
  if (filters) {
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    if (filters.curso) params.append('curso', filters.curso);
    if (filters.disciplina) params.append('disciplina', filters.disciplina);
    if (filters.turma) params.append('turma', filters.turma);
  }
  
  const response = await fetch(
    `/api/users/search?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    console.error(`🔴 [UsersService] Erro ao buscar usuários`);
    throw new Error("Erro ao buscar usuários");
  }
  
  const data = await response.json();
  console.log(`🟢 [UsersService] ${data.length} usuários encontrados`);
  return data;
}

/**
 * Lista todos os usuários
 * GET /api/users
 */
export async function getAllUsers(): Promise<User[]> {
  console.log(`🔵 [UsersService] Listando todos os usuários`);
  
  const response = await fetch('/api/users', {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    console.error(`🔴 [UsersService] Erro ao listar usuários`);
    throw new Error("Erro ao listar usuários");
  }
  
  const data = await response.json();
  console.log(`🟢 [UsersService] ${data.length} usuários listados`);
  return data;
}

/**
 * Busca usuário por ID
 * GET /api/users/:id
 */
export async function getUserById(id: number): Promise<User> {
  console.log(`🔵 [UsersService] Buscando usuário por ID: ${id}`);
  
  const response = await fetch(`/api/users/${id}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    console.error(`🔴 [UsersService] Erro ao buscar usuário ${id}`);
    throw new Error("Usuário não encontrado");
  }
  
  const data = await response.json();
  console.log(`🟢 [UsersService] Usuário encontrado: ${data.name}`);
  return data;
}
