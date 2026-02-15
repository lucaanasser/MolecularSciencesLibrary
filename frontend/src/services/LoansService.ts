/*
 * Serviço para operações de empréstimos de livros
 * Centraliza as chamadas à API relacionadas a empréstimos: criação, renovação, devolução, consulta, etc.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const API_BASE = '/api/loans';

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

export const LoansService = {
  
  /* ================ EMPRÉSTIMO ================ */

  // Criar novo empréstimo (usuário)
  borrowBook: async (data: { book_id: number; NUSP: number; password: string }) => {
    console.log("🔵 [LoansService] Criando empréstimo:", data);
    try {
      const result = await fetchJson(`${API_BASE}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [LoansService] Empréstimo criado:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível criar o empréstimo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [LoansService] Erro ao criar empréstimo", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Criar novo empréstimo como admin (sem senha)
  borrowBookAsAdmin: async (data: { book_id: number; NUSP: number }) => {
    console.log("🔵 [LoansService] Criando empréstimo (admin):", data);
    try {
      const result = await fetchJson(`${API_BASE}/admin`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [LoansService] Empréstimo (admin) criado:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível criar o empréstimo como admin.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [LoansService] Erro ao criar empréstimo (admin)", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Registrar devolução de livro
  returnBook: async (data: { book_id: number }) => {
    console.log("🔵 [LoansService] Devolvendo livro:", data.book_id);
    try {
      const result = await fetchJson(`${API_BASE}/return`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [LoansService] Livro devolvido:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível devolver o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [LoansService] Erro ao devolver livro", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Registrar uso interno (empréstimo fantasma)
  registerInternalUse: async (data: { book_id: number }) => {
    console.log("🔵 [LoansService] Registrando uso interno:", data.book_id);
    try {
      const result = await fetchJson(`${API_BASE}/internal-use`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [LoansService] Uso interno registrado:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível registrar uso interno.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [LoansService] Erro ao registrar uso interno", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ CONSULTA ================ */

  // Buscar todos os empréstimos (com filtro opcional de status)
  getLoans: async (status?: 'all' | 'active' | 'returned') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    console.log("🔵 [LoansService] Buscando empréstimos (status):", status);
    try {
      const loans = await fetchJson(`${API_BASE}?${params.toString()}`);
      console.log("🟢 [LoansService] Empréstimos encontrados:", loans.length);
      return loans;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os empréstimos.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [LoansService] Erro ao buscar empréstimos", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Buscar empréstimos de um usuário (com filtro opcional de status)
  getLoansByUser: async (userId: number, status?: 'all' | 'active' | 'returned') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    console.log(`🔵 [LoansService] Buscando empréstimos do usuário ${userId} (status: ${status})`);
    try {
      const loans = await fetchJson(`${API_BASE}/user/${userId}?${params.toString()}`);
      console.log("🟢 [LoansService] Empréstimos do usuário encontrados:", loans.length);
      return loans;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os empréstimos do usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [LoansService] Erro ao buscar empréstimos do usuário", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ RENOVAÇÃO ================ */

  // Preview da renovação
  previewRenewLoan: async (loanId: number, userId: number) => {
    console.log(`🔵 [LoansService] Preview de renovação: loanId=${loanId}, userId=${userId}`);
    try {
      const result = await fetchJson(`${API_BASE}/${loanId}/preview-renew`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
      console.log("🟢 [LoansService] Preview de renovação obtido:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível obter a prévia da renovação.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [LoansService] Erro ao obter preview de renovação", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Renovar empréstimo
  renewLoan: async (loanId: number, userId: number) => {
    console.log(`🔵 [LoansService] Renovando empréstimo: loanId=${loanId}, userId=${userId}`);
    try {
      const result = await fetchJson(`${API_BASE}/${loanId}/renew`, {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId }),
      });
      console.log("🟢 [LoansService] Empréstimo renovado:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível renovar o empréstimo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [LoansService] Erro ao renovar empréstimo", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

};