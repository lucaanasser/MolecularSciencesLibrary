/*
 * Serviço para operações de livros
 * Centraliza as chamadas à API relacionadas a livros, como busca, criação, empréstimo, etc.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

import { Book } from "@/types/new_book";
import { logger } from "@/utils/logger";
import { fetchJson } from "@/utils/fetchJson";

const API_BASE = '/api/books';

export const BooksService = {

  /* ================ CRUD ================ */

  /* Adicionar livro
   * Usada em: AddBookForm (adminpage)
   */
  addBook: async (bookData: Book, selectedBookcode?: string) => {
    logger.log("🔵 [BooksService] Adicionando livro:", bookData.id || bookData.title);
    try {
      const data = await fetchJson(`${API_BASE}`, {
        method: 'POST',
        body: JSON.stringify({bookData, selectedBookcode}),
      });
      logger.log("🟢 [BooksService] Livro adicionado com sucesso:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível adicionar o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao adicionar livro:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Deletar livro por ID 
   * Usada em: RemoveBookForm (adminpage)
   */
  deleteBook: async (id: number) => {
    logger.log(`🔵 [BooksService] Iniciando remoção do livro ID: ${id}`);
    try {
      const data = await fetchJson(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      logger.log(`🟢 [BooksService] Livro removido com sucesso! ID: ${id}`);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível remover o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error(`🔴 [BooksService] Erro ao remover livro ID: ${id}`, technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Buscar informações básicas de livro com autocomplete
   * Usada em: ....
   */
  autocompleteSearchBooks: async (q?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (limit) params.append('limit', limit.toString());
    logger.log("🔵 [BooksService] Buscando livros:", { q, limit });
    try {
      const books = await fetchJson(`${API_BASE}/search?${params.toString()}`);
      logger.log(`🟢 [BooksService] Livros encontrados: ${books.length}`);
      return books;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os livros.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao buscar livros", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Buscar dados completos de livros com query e filtros opcionais (área, subárea, status)
   * Suporta paginação (definindo limit e offset)
   * Usada em: RemoveBookForm (adminpage), BooksList (adminpage), ...
   */
  searchBooks: async (filters?: {
    q?: string;
    area?: string | string[];
    subarea?: string | string[];
    status?: string | string[];
  }) => {
    const params = new URLSearchParams();
    if (filters?.q) params.append('q', filters.q);
    ['area', 'subarea', 'status'].forEach((key) => {
      const value = filters?.[key as keyof typeof filters];
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }
    });
    ['area', 'subarea', 'status'].forEach((key) => {
      const value = filters[key as keyof typeof filters];
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          value.toString().split(',').forEach(v => params.append(key, v));
        }
      }
    });
    logger.log("🔵 [BooksService] Buscando livros (completo):", filters);
    try {
      const books = await fetchJson(`${API_BASE}?${params.toString()}`);
      logger.log(`🟢 [BooksService] Livros encontrados (completo): ${books.total}`);
      return books;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os livros.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao buscar livros (completo)", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Buscar livro por ID */
  getBookById: async (id: number) => {
    logger.log(`🔵 [BooksService] Buscando livro ID: ${id}`);
    try {
      const data = await fetchJson(`${API_BASE}/${id}`);
      logger.log("🟢 [BooksService] Livro encontrado:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error(`🔴 [BooksService] Erro ao buscar livro ID: ${id}`, technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Contar livros com filtros */
  countBooks: async (filters: {
    q?: string;
    area?: string | string[];
    subarea?: string | string[];
    status?: string | string[];
  }) => {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    ['area', 'subarea', 'status'].forEach((key) => {
      const value = filters[key as keyof typeof filters];
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          value.toString().split(',').forEach(v => params.append(key, v));
        }
      }
    });
    logger.log("🔵 [BooksService] Contando livros:", filters);
    try {
      const result = await fetchJson(`${API_BASE}/count?${params.toString()}`);
      logger.log("🟢 [BooksService] Contagem de livros:", result.count);
      return result.count;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível contar os livros.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao contar livros", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ RESERVA DIDÁTICA ================ */

  /* Reservar livro didaticamente */
  reserveBook: async (bookId: number) => {
    logger.log("🔵 [BooksService] Reservando livro didaticamente:", bookId);
    try {
      const result = await fetchJson(`${API_BASE}/reserve`, {
        method: 'POST',
        body: JSON.stringify({ bookId }),
      });
      logger.log("🟢 [BooksService] Livro reservado didaticamente:", result.book);
      return result.book;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).message; } catch {}
      const errorMsg = `Não foi possível reservar o livro didaticamente.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao reservar livro didaticamente", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Remover reserva didática do livro */
  unreserveBook: async (bookId: number) => {
    logger.log("🔵 [BooksService] Removendo reserva didática do livro:", bookId);
    try {
      const result = await fetchJson(`${API_BASE}/unreserve`, {
        method: 'POST',
        body: JSON.stringify({ bookId }),
      });
      logger.log("🟢 [BooksService] Reserva didática removida:", result.book);
      return result.book;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).message; } catch {}
      const errorMsg = `Não foi possível remover a reserva didática.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao remover reserva didática", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Limpar reserva didática */
  clearAllReservedBooks: async () => {
    logger.log("🔵 [BooksService] Removendo todos os livros da reserva didática");
    try {
      const result = await fetchJson(`${API_BASE}/reserve/clear`, {
        method: 'DELETE',
      });
      logger.log("🟢 [BooksService] Todos os livros removidos da reserva didática:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível limpar a reserva didática.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao limpar reserva didática", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Listar livros reservados didaticamente */
  getReservedBooks: async () => {
    logger.log("🔵 [BooksService] Buscando livros reservados didaticamente");
    try {
      const books = await fetchJson(`${API_BASE}/reserved`, {
        method: 'GET',
      });
      logger.log(`🟢 [BooksService] Livros reservados encontrados: ${books.length}`);
      return books;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os livros reservados.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao buscar livros reservados", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ IMPORTAÇÃO E EXPORTAÇÃO ================ */

  /* Importar livros via CSV */
  importBooksFromCSV: async (csvFile: File) => {
    logger.log("🔵 [BooksService] Importando livros via CSV");
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    try {
      const result = await fetchJson(`${API_BASE}/import/csv`, {
        method: 'POST',
        body: formData,
      });
      if (result.success)
          logger.log("🟢 [BooksService] Importação de livros via CSV concluída:", result.message);
      else{
          logger.log("🟡 [BooksService] Importação de livros via CSV concluída com errros.");
          throw new Error(result.message);
      }
    } catch (err) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).message; } catch {}
      logger.error("🔴 [BooksService] Erro ao importar livros via CSV", technicalMsg || err);
      throw new Error(technicalMsg || err);
    }
  },

  /* Exportar catálogo em CSV */
  exportBooksToCSV: async () => {
    logger.log("🔵 [BooksService] Exportando catálogo de livros para CSV");
    try {
      const csv = await fetchJson(`${API_BASE}/export/csv`, {
        method: 'GET',
      });
      logger.log("🟢 [BooksService] Exportação de livros para CSV concluída");
      return csv;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível exportar o catálogo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      logger.error("🔴 [BooksService] Erro ao exportar catálogo", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

};
