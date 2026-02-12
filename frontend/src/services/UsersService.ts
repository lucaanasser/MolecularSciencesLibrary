// Serviço para operações de usuários
import { User } from "@/types/new_user";

const API_BASE = '/api/users';

function fetchJson(url: string, options: RequestInit = {}) {
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Erro na requisição');
    }
    return res.json();
  });
}

export const UsersService = {

  /* ================ TESTADOS ================ */

  // Criar usuário (apenas admin) -- useAddUser.tsx
  createUser: (user: Pick<User, "name" | "email" | "NUSP" | "phone" | "class">) => fetchJson(`${API_BASE}`, {
    method: 'POST',
    body: JSON.stringify(user),
  }),

  // Deletar usuário por ID (apenas admin) -- deveria ser usado em RemoveUserForm.tsx
  deleteUserById: (id: number) => fetchJson(`${API_BASE}/${id}`, {
    method: 'DELETE',
  }),
  
  // Busca usuários por termo (autocomplete).
  searchUsers: (params: {
    q: string;
    limit?: number;
    tags?: string[];
    curso?: string;
    disciplina?: string;
    turma?: string;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.curso) queryParams.append('curso', params.curso);
    if (params.disciplina) queryParams.append('disciplina', params.disciplina);
    if (params.turma) queryParams.append('turma', params.turma);
    return fetchJson(`${API_BASE}/search?${queryParams.toString()}`);
  },
  /* ================== NÃO TESTADOS ================== */

  // Perfil do usuário autenticado
  getProfile: () => fetchJson(`${API_BASE}/me`),

  // Atualizar imagem de perfil do usuário autenticado
  updateProfileImage: (data: FormData) => fetch(`${API_BASE}/me/profile-image`, {
    method: 'PUT',
    body: data,
    headers: {}, // FormData já define Content-Type
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Erro na requisição');
    }
    return res.json();
  }),

  // Buscar usuário por ID
  getUserById: (id: number | string) => fetchJson(`${API_BASE}/${id}`),

  // Autenticação (login)
  authenticateUser: (data: { NUSP: number; password: string }) => fetchJson(`${API_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Solicitar redefinição de senha
  requestPasswordReset: (data: { NUSP: number }) => fetchJson(`${API_BASE}/forgot-password`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Redefinir senha
  resetPassword: (data: { NUSP: number; password: string; token: string }) => fetchJson(`${API_BASE}/reset-password`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Listar todos os usuários (apenas admin) -- deveria ser usado em RemoveUserForm.tsx, 
  getAllUsers: () => fetchJson(`${API_BASE}/`),

  // Exportar todos os usuários para CSV (apenas admin) -- deveria ser usado em UserList.tsx
  exportUsersToCSV: () => fetch(`${API_BASE}/export/csv`).then(async (res) => {
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Erro na requisição');
    }
    return res.blob();
  }),

  // Importar usuários via CSV (apenas admin) -- deveria ser usado em ImportUsers.tsx
  importUsersFromCSV: (data: FormData) => fetch(`${API_BASE}/import/csv`, {
    method: 'POST',
    body: data,
    headers: {}, // FormData já define Content-Type
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Erro na requisição');
    }
    return res.json();
  }),
};
