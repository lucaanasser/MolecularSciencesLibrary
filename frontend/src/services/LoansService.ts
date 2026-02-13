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
  // Posteriormente refatorar inserindo logs e eliminando hooks
  /* ================== TESTADOS ================== */
  // Criar empréstimo - useBorrowBook.ts
  borrowBook: (data: { book_id: number; NUSP: number; password: string }) => fetchJson(`${API_BASE}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Criar empréstimo como admin - useBorrowBook.ts
  borrowBookAsAdmin: (data: { book_id: number; NUSP: number }) => fetchJson(`${API_BASE}/admin`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Registrar devolução - useReturnBook.ts
  returnBook: (data: { book_id: number }) => fetchJson(`${API_BASE}/return`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Registrar uso interno - useInternalUseRegister.ts
  registerInternalUse: (data: { book_id: number }) => fetchJson(`${API_BASE}/internal-use`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Listar empréstimos ativos com status de atraso - useActiveLoansList.ts
  listActiveLoansWithOverdue: () => fetchJson(`${API_BASE}/active`),

  /* ================== NÃO TESTADOS ================== */

  // Preview renovação - deveria ser usado em RenewButton.tsx
  previewRenewLoan: (id: number, data: { loan_id: number; user_id: number }) => fetchJson(`${API_BASE}/${id}/preview-renew`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Renovar empréstimo - deveria ser usado em RenewButton.tsx
  renewLoan: (id: number, data: { loan_id: number; user_id: number }) => fetchJson(`${API_BASE}/${id}/renew`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Preview extensão - atualmente não implementado no frontend
  previewExtendLoan: (id: number, data: { loan_id: number; user_id: number }) => fetchJson(`${API_BASE}/${id}/preview-extend`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Estender empréstimo - atualmente não implementado no frontend
  extendLoan: (id: number, data: { loan_id: number; user_id: number }) => fetchJson(`${API_BASE}/${id}/extend`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Listar todos os empréstimos - atualmente não implementado no frontend
  listLoans: () => fetchJson(`${API_BASE}/`),

  // Listar empréstimos de um usuário específico - deveria ser usado em useGetUserLoans.ts
  listLoansByUser: (userId: number) => fetchJson(`${API_BASE}/user/${userId}`),

  // Listar empréstimos ativos de um usuário específico - atualmente não implementado no frontend
  listActiveLoansByUser: (userId: number) => fetchJson(`${API_BASE}/user/${userId}/active`),
};
