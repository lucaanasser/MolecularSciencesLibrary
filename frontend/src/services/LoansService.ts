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

import { logger } from "@/utils/logger";
import { fetchJson } from "@/utils/fetchJson";

const API_BASE = '/api/loans';

export const LoansService = {
  
  /* ================ EMPRÉSTIMO ================ */

  // Criar novo empréstimo (usuário)
  borrowBook: async (data: { book_id: number; NUSP: number; password: string }) => {
    logger.log("🔵 [LoansService] Criando empréstimo:", data);
    try {
      await fetchJson(`${API_BASE}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      logger.log("🟢 [LoansService] Empréstimo criado com sucesso");
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível criar o empréstimo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao criar empréstimo", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Criar novo empréstimo como admin (sem senha)
  borrowBookAsAdmin: async (data: { book_id: number; NUSP: number }) => {
    logger.log("🔵 [LoansService] Criando empréstimo (admin):", data);
    try {
      await fetchJson(`${API_BASE}/admin`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      logger.log("🟢 [LoansService] Empréstimo (admin) criado com sucesso");
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível criar o empréstimo como admin.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao criar empréstimo (admin)", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Registrar devolução de livro
  returnBook: async (data: { book_id: number }) => {
    logger.log("🔵 [LoansService] Devolvendo livro:", data.book_id);
    try {
      await fetchJson(`${API_BASE}/return`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      logger.log("🟢 [LoansService] Livro devolvido com sucesso");
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível devolver o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao devolver livro", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Registrar uso interno (empréstimo fantasma)
  registerInternalUse: async (data: { book_id: number }) => {
    logger.log("🔵 [LoansService] Registrando uso interno:", data.book_id);
    try {
      const result = await fetchJson(`${API_BASE}/internal-use`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      logger.log("🟢 [LoansService] Uso interno registrado:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível registrar uso interno.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao registrar uso interno", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ CONSULTA ================ */

  // Buscar todos os empréstimos (com filtro opcional de status)
  getLoans: async (status?: 'all' | 'active' | 'returned') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    logger.log("🔵 [LoansService] Buscando empréstimos (status):", status);
    try {
      const loans = await fetchJson(`${API_BASE}?${params.toString()}`);
      logger.log("🟢 [LoansService] Empréstimos encontrados:", loans.length);
      return loans;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os empréstimos.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao buscar empréstimos", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Buscar empréstimos de um usuário (com filtro opcional de status)
  getLoansByUser: async (userId: number, status?: 'all' | 'active' | 'returned') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    logger.log(`🔵 [LoansService] Buscando empréstimos do usuário ${userId} (status: ${status})`);
    try {
      const loans = await fetchJson(`${API_BASE}/user/${userId}?${params.toString()}`);
      logger.log("🟢 [LoansService] Empréstimos do usuário encontrados:", loans.length);
      return loans;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os empréstimos do usuário.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao buscar empréstimos do usuário", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ RENOVAÇÃO ================ */

  // Preview da renovação
  previewRenewLoan: async (loanId: number, userId: number) => {
    logger.log(`🔵 [LoansService] Preview de renovação: loanId=${loanId}, userId=${userId}`);
    try {
      const result = await fetchJson(`${API_BASE}/${loanId}/preview-renew`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
      logger.log("🟢 [LoansService] Preview de renovação obtido:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível obter a prévia da renovação.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao obter preview de renovação", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Renovar empréstimo
  renewLoan: async (loanId: number, userId: number) => {
    logger.log(`🔵 [LoansService] Renovando empréstimo: loanId=${loanId}, userId=${userId}`);
    try {
      const result = await fetchJson(`${API_BASE}/${loanId}/renew`, {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId }),
      });
      logger.log("🟢 [LoansService] Empréstimo renovado:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível renovar o empréstimo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao renovar empréstimo", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  // Buscar empréstimos de um livro específico (com filtro opcional de ativos)
  getLoansByBook: async (bookId: number, activeOnly?: boolean) => {
    const params = new URLSearchParams();
    if (activeOnly) params.append('activeOnly', activeOnly.toString());
    logger.log(`🔵 [LoansService] Buscando empréstimos do livro ${bookId} (activeOnly: ${activeOnly})`);
    try {
      const loans = await fetchJson(`${API_BASE}/book/${bookId}?${params.toString()}`);
      logger.log("🟢 [LoansService] Empréstimos do livro encontrados:", loans.length);
      return loans;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os empréstimos do livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [LoansService] Erro ao buscar empréstimos do livro", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },
};