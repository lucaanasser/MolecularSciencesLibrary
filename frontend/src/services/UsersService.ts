// Serviço para operações de usuários
import { User } from "@/types/user";

const API_BASE = '/api/users';

function fetchJson(url: string, options: RequestInit = {}) {
  const userData = localStorage.getItem('user');
  const token = userData ? JSON.parse(userData).token : null;
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
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

  /* Criar usuário
   * Usada em: AddUserForm (admin page)
   */
  createUser: async (user: Pick<User, "name" | "email" | "NUSP" | "phone" | "class">) => {
    console.log("🔵 [UsersService] Adicionando usuário:", user);
    try {
      const data = await fetchJson(`${API_BASE}`, {
        method: 'POST',
        body: JSON.stringify(user),
      });
      console.log("🟢 [UsersService] Usuário adicionado com sucesso:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível adicionar o usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [UsersService] Erro ao adicionar usuário:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Deletar usuário por ID 
   * Usada em: RemoveUserForm (admin page)
   */
  deleteUserById: async (id: number) => {
    console.log(`🔵 [UsersService] Iniciando remoção do usuário ID: ${id}`);
    try {
      const data = await fetchJson(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      console.log(`🟢 [UsersService] Usuário removido com sucesso! ID: ${id}`);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível remover o usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error(`🔴 [UsersService] Erro ao remover usuário ID: ${id}`, technicalMsg || err);
      throw new Error(errorMsg);
    }
  },
  
  /* Busca usuários por nome, NUSP ou email (autocomplete) ou exibe todos se query vazia
   * Usada em: RemoveUserForm (admin page), ListUsers (admin page)
   */
  searchUsers: async (data: { q?: string; limit?: number; }) => {
    if (!data.q) {
      // Busca todos os usuários
      console.log("🔵 [UsersService] Buscando todos os usuários");
      try {
        const users = await fetchJson(`${API_BASE}/`);
        console.log(`🟢 [UsersService] Busca concluída. Usuários encontrados: ${users.length}`);
        return users;
      } catch (err: any) {
        let technicalMsg = "";
        try { technicalMsg = JSON.parse(err.message).error; } catch {}
        const errorMsg = `Não foi possível buscar os usuários.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
        console.error("🔴 [UsersService] Erro ao buscar todos os usuários", technicalMsg || err);
        throw new Error(errorMsg);
      }
    } else {
      // Busca filtrada
      const params = new URLSearchParams();
      params.append('q', data.q);
      if (data.limit) params.append('limit', String(data.limit));
      console.log(`🔵 [UsersService] Iniciando busca por usuários. Query: '${data.q}'`);
      try {
        const users = await fetchJson(`${API_BASE}/search?${params.toString()}`, {
          method: 'GET',
        });
        console.log(`🟢 [UsersService] Busca concluída. Usuários encontrados: ${users.length}`);
        return users;
      } catch (err: any) {
        let technicalMsg = "";
        try { technicalMsg = JSON.parse(err.message).error; } catch {}
        const errorMsg = `Não foi possível buscar o usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
        console.error(`🔴 [UsersService] Erro ao buscar usuários. Query: '${data.q}'`, technicalMsg || err);
        throw new Error(errorMsg);
      }
    }
  },

  /* Perfil do usuário autenticado
   * Usada em: ProfilePage, PublicProfilePage
   */
  getProfile: async () => {
    console.log("🔵 [UsersService] Buscando perfil do usuário autenticado");
    try {
      const data = await fetchJson(`${API_BASE}/me`);
      console.log("🟢 [UsersService] Perfil carregado com sucesso:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível carregar o perfil do usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [UsersService] Erro ao buscar perfil do usuário:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },


  /* Autenticação (login) 
   * Usada em: LoginForm
   */
  authenticateUser: async (data: { login: string | number; password: string }) => {
    console.log("🔵 [UsersService] Autenticando usuário:", data.login);
    try {
      const result = await fetchJson(`${API_BASE}/login`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [UsersService] Usuário autenticado com sucesso:", result.name);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível autenticar o usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [UsersService] Erro ao autenticar usuário:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },


  /* Solicitar redefinição de senha
   * Usada em: LoginForm (esqueci minha senha)
   */
  requestPasswordReset: async (data: { login: string | number }) => {
    console.log("🔵 [UsersService] Solicitando redefinição de senha para:", data.login);
    try {
      const result = await fetchJson(`${API_BASE}/forgot-password`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [UsersService] Solicitação de redefinição de senha enviada com sucesso");
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível solicitar a redefinição de senha.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [UsersService] Erro ao solicitar redefinição de senha:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },


  /* Redefinir senha 
   * Usada em: ResetPasswordPage
  */
  resetPassword: async (data: { token: string; newPassword: string }) => {
    console.log("🔵 [UsersService] Redefinindo senha com token:", data.token);
    try {
      const result = await fetchJson(`${API_BASE}/reset-password`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [UsersService] Senha redefinida com sucesso");
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível redefinir a senha.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [UsersService] Erro ao redefinir senha:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Atualizar imagem de perfil do usuário autenticado
   * A ser usada em: ProfilePage, PublicProfilePage
   */
  updateProfileImage: async (data: { id: number; profile_image: string }) => {
    console.log("🔵 [UsersService] Atualizando imagem de perfil do usuário:", data.id);
    try {
      const result = await fetchJson(`${API_BASE}/me/profile-image`, {
        method: 'PUT',
        body: JSON.stringify({ profile_image: data.profile_image }),
      });
      console.log("🟢 [UsersService] Imagem de perfil atualizada com sucesso");
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível atualizar a imagem de perfil.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [UsersService] Erro ao atualizar imagem de perfil:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },
  
  /* ================== NÃO TESTADOS ================== */

  // Buscar usuário por ID -- pagina de busca de usuários??
  getUserById: (id: number | string) => fetchJson(`${API_BASE}/${id}`),

  /** Importar usuários via arquivo CSV
   *  @param file: File - arquivo CSV a ser enviado
   *  @returns Promise<Object> - resultado da importação
   */
  importUsersFromCSV: async (file: File) => {
    console.log("🔵 [UsersService] Importando usuários via CSV");
    const formData = new FormData();
    formData.append('file', file);

    const userData = localStorage.getItem('user');
    const token = userData ? JSON.parse(userData).token : null;

    try {
      const res = await fetch('/api/users/import-csv', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro na importação do CSV');
      }
      const data = await res.json();
      console.log("🟢 [UsersService] Importação de usuários concluída:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível importar os usuários.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [UsersService] Erro ao importar usuários:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /** Exportar usuários para CSV
   *  @returns Promise<Blob> - arquivo CSV para download
   */
  exportUsersToCSV: async () => {
    console.log("🔵 [UsersService] Exportando usuários para CSV");
    const userData = localStorage.getItem('user');
    const token = userData ? JSON.parse(userData).token : null;

    try {
      const res = await fetch('/api/users/export-csv', {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro na exportação do CSV');
      }
      const blob = await res.blob();
      console.log("🟢 [UsersService] Exportação de usuários concluída");
      return blob;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível exportar os usuários.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [UsersService] Erro ao exportar usuários:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },


};
