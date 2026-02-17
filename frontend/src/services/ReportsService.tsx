/*
 * Serviço para operações de relatórios
 * Centraliza as chamadas à API relacionadas a estatísticas e relatórios da biblioteca.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

import { logger } from "@/utils/logger";

const API_BASE = '/api/reports';

function fetchJson(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {};

  // Adiciona o token se existir
  const user = localStorage.getItem('user');
  if (user) {
    headers['Authorization'] = `Bearer ${JSON.parse(user).token}`;
  }

  // Só adiciona Content-Type se não for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    headers: {
      ...headers,
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

export const ReportsService = {
  /* Estatísticas de empréstimos */
  getLoansStatistics: async () => {
    logger.log("🔵 [ReportsService] Buscando estatísticas de empréstimos");
    try {
      const data = await fetchJson(`${API_BASE}/loans`);
      logger.log("🟢 [ReportsService] Estatísticas de empréstimos recebidas");
      return data;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao buscar estatísticas de empréstimos", err);
      throw new Error("Não foi possível buscar estatísticas de empréstimos.");
    }
  },

  /* Estatísticas de usuários */
  getUsersStatistics: async () => {
    logger.log("🔵 [ReportsService] Buscando estatísticas de usuários");
    try {
      const data = await fetchJson(`${API_BASE}/users`);
      logger.log("🟢 [ReportsService] Estatísticas de usuários recebidas");
      return data;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao buscar estatísticas de usuários", err);
      throw new Error("Não foi possível buscar estatísticas de usuários.");
    }
  },

  /* Estatísticas do acervo */
  getBooksStatistics: async () => {
    logger.log("🔵 [ReportsService] Buscando estatísticas do acervo");
    try {
      const data = await fetchJson(`${API_BASE}/books`);
      logger.log("🟢 [ReportsService] Estatísticas do acervo recebidas");
      return data;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao buscar estatísticas do acervo", err);
      throw new Error("Não foi possível buscar estatísticas do acervo.");
    }
  },

  /* Estatísticas de doadores */
  getDonatorsStatistics: async (params?: { startDate?: string; endDate?: string }) => {
    logger.log("🔵 [ReportsService] Buscando estatísticas de doadores", params);
    const urlParams = new URLSearchParams();
    if (params?.startDate) urlParams.append('startDate', params.startDate);
    if (params?.endDate) urlParams.append('endDate', params.endDate);
    try {
      const data = await fetchJson(`${API_BASE}/donators${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
      logger.log("🟢 [ReportsService] Estatísticas de doadores recebidas");
      return data;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao buscar estatísticas de doadores", err);
      throw new Error("Não foi possível buscar estatísticas de doadores.");
    }
  },

  /* Relatório completo */
  getCompleteReport: async () => {
    logger.log("🔵 [ReportsService] Buscando relatório completo");
    try {
      const data = await fetchJson(`${API_BASE}/complete`);
      logger.log("🟢 [ReportsService] Relatório completo recebido");
      return data;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao buscar relatório completo", err);
      throw new Error("Não foi possível buscar o relatório completo.");
    }
  },

  /* PDFs de relatórios */
  
  getLoansReportPDF: async () => {
    logger.log("🔵 [ReportsService] Solicitando PDF de empréstimos");
    try {
      const res = await fetch(`${API_BASE}/loans/pdf`, {
        headers: {
          Authorization: localStorage.getItem('user')
            ? `Bearer ${JSON.parse(localStorage.getItem('user')!).token}`
            : '',
        },
      });
      if (!res.ok) throw new Error(await res.text());
      logger.log("🟢 [ReportsService] PDF de empréstimos recebido");
      return await res.blob();
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao baixar PDF de empréstimos", err);
      throw new Error("Não foi possível baixar o PDF de empréstimos.");
    }
  },

  getUsersReportPDF: async () => {
    logger.log("🔵 [ReportsService] Solicitando PDF de usuários");
    try {
      const blob = await fetchJson(`${API_BASE}/users/pdf`, {
        headers: { Accept: 'application/pdf' }
      });
      logger.log("🟢 [ReportsService] PDF de usuários recebido");
      return blob;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao baixar PDF de usuários", err);
      throw new Error("Não foi possível baixar o PDF de usuários.");
    }
  },

  getBooksReportPDF: async () => {
    logger.log("🔵 [ReportsService] Solicitando PDF do acervo");
    try {
      const blob = await fetchJson(`${API_BASE}/books/pdf`, {
        headers: { Accept: 'application/pdf' }
      });
      logger.log("🟢 [ReportsService] PDF do acervo recebido");
      return blob;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao baixar PDF do acervo", err);
      throw new Error("Não foi possível baixar o PDF do acervo.");
    }
  },

  getDonatorsReportPDF: async () => {
    logger.log("🔵 [ReportsService] Solicitando PDF de doadores");
    try {
      const blob = await fetchJson(`${API_BASE}/donators/pdf`, {
        headers: { Accept: 'application/pdf' }
      });
      logger.log("🟢 [ReportsService] PDF de doadores recebido");
      return blob;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao baixar PDF de doadores", err);
      throw new Error("Não foi possível baixar o PDF de doadores.");
    }
  },

  getCompleteReportPDF: async () => {
    logger.log("🔵 [ReportsService] Solicitando PDF do relatório completo");
    try {
      const blob = await fetchJson(`${API_BASE}/complete/pdf`, {
        headers: { Accept: 'application/pdf' }
      });
      logger.log("🟢 [ReportsService] PDF do relatório completo recebido");
      return blob;
    } catch (err: any) {
      logger.error("🔴 [ReportsService] Erro ao baixar PDF do relatório completo", err);
      throw new Error("Não foi possível baixar o PDF do relatório completo.");
    }
  },
};