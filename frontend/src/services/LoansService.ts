// Serviço para operações de empréstimos de livros

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
  /* ================== TESTADOS ================== */
  // Criar empréstimo
  borrowBook: (data: { book_id: number; NUSP: number; password: string }) => fetchJson(`${API_BASE}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Criar empréstimo como admin
  borrowBookAsAdmin: (data: { book_id: number; NUSP: number }) => fetchJson(`${API_BASE}/admin`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Registrar devolução
  returnBook: (data: { book_id: number }) => fetchJson(`${API_BASE}/return`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Registrar uso interno
  registerInternalUse: (data: { book_id: number }) => fetchJson(`${API_BASE}/internal-use`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /* ================== NÃO TESTADOS ================== */

  // Preview renovação
  previewRenewLoan: (id: string, data: { loan_id: number; user_id: number }) => fetchJson(`${API_BASE}/${id}/preview-renew`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Renovar empréstimo
  renewLoan: (id: string, data: { loan_id: number; user_id: number }) => fetchJson(`${API_BASE}/${id}/renew`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Preview extensão
  previewExtendLoan: (id: string, data: { loan_id: number; user_id: number }) => fetchJson(`${API_BASE}/${id}/preview-extend`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Estender empréstimo
  extendLoan: (id: string, data: { loan_id: number; user_id: number }) => fetchJson(`${API_BASE}/${id}/extend`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Listar todos os empréstimos
  listLoans: () => fetchJson(`${API_BASE}/`),

  // Listar empréstimos ativos com status de atraso
  listActiveLoansWithOverdue: () => fetchJson(`${API_BASE}/active`),

  // Listar empréstimos de um usuário específico
  listLoansByUser: (userId: number) => fetchJson(`${API_BASE}/user/${userId}`),

  // Listar empréstimos ativos de um usuário específico
  listActiveLoansByUser: (userId: number) => fetchJson(`${API_BASE}/user/${userId}/active`),
};
