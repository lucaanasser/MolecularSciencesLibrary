// Serviço para operações de livros
import { Book } from "@/types/new_book";

const API_BASE = '/api/books';

function fetchJson(url: string, options: RequestInit = {}) {
  const userData = localStorage.getItem('user');
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
    // CSV export
    if (res.headers.get('Content-Type')?.includes('text/csv')) {
      return res.text();
    }
    return res.json();
  });
}

export const BooksService = {

  /* ================ CRUD ================ */

  /* Adicionar livro
   * Usada em: AddBookForm
   */
  createBook: async (book: Omit<Book, 'id'> & { id?: number; code?: string }) => {
    console.log("🔵 [BooksService] Adicionando livro:", book);
    try {
      const data = await fetchJson(`${API_BASE}`, {
        method: 'POST',
        body: JSON.stringify({bookData: book}),
      });
      console.log("🟢 [BooksService] Livro adicionado com sucesso:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível adicionar o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao adicionar livro:", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Deletar livro por ID */
  deleteBookById: async (id: number) => {
    console.log(`🔵 [BooksService] Iniciando remoção do livro ID: ${id}`);
    try {
      const data = await fetchJson(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      console.log(`🟢 [BooksService] Livro removido com sucesso! ID: ${id}`);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível remover o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error(`🔴 [BooksService] Erro ao remover livro ID: ${id}`, technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Buscar livros (com filtros, paginação e múltiplos valores)
   * Usada em: ListBooks, BookSearch, etc
   */
  searchBooks: async (filters: {
    q?: string;
    area?: string | string[];
    subarea?: string | string[];
    status?: string | string[];
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));
    // Múltiplos valores
    ['area', 'subarea', 'status'].forEach((key) => {
      const value = filters[key as keyof typeof filters];
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          // Suporta vírgula
          value.toString().split(',').forEach(v => params.append(key, v));
        }
      }
    });
    console.log("🔵 [BooksService] Buscando livros:", filters);
    try {
      const books = await fetchJson(`${API_BASE}/?${params.toString()}`);
      console.log(`🟢 [BooksService] Livros encontrados: ${books.length}`);
      return books;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os livros.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao buscar livros", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Buscar livro por ID */
  getBookById: async (id: number) => {
    console.log(`🔵 [BooksService] Buscando livro ID: ${id}`);
    try {
      const data = await fetchJson(`${API_BASE}/${id}`);
      console.log("🟢 [BooksService] Livro encontrado:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error(`🔴 [BooksService] Erro ao buscar livro ID: ${id}`, technicalMsg || err);
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
    console.log("🔵 [BooksService] Contando livros:", filters);
    try {
      const result = await fetchJson(`${API_BASE}/count?${params.toString()}`);
      console.log("🟢 [BooksService] Contagem de livros:", result.count);
      return result.count;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível contar os livros.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao contar livros", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ EMPRÉSTIMO E DEVOLUÇÃO ================ */

  /* Emprestar livro */
  borrowBook: async (data: { bookId: number; userId: number }) => {
    console.log("🔵 [BooksService] Emprestando livro:", data);
    try {
      const result = await fetchJson(`${API_BASE}/borrow`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [BooksService] Livro emprestado:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível emprestar o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao emprestar livro", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Devolver livro */
  returnBook: async (data: { bookId: number }) => {
    console.log("🔵 [BooksService] Devolvendo livro:", data.bookId);
    try {
      const result = await fetchJson(`${API_BASE}/return`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [BooksService] Livro devolvido:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível devolver o livro.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao devolver livro", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ RESERVA DIDÁTICA ================ */

  /* Definir/remover reserva didática */
  setReservedStatus: async (data: { bookId: number; isReserved: boolean }) => {
    console.log("🔵 [BooksService] Alterando status de reserva didática:", data);
    try {
      const result = await fetchJson(`${API_BASE}/reserve`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log("🟢 [BooksService] Status de reserva didática alterado:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível alterar o status de reserva didática.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao alterar status de reserva didática", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Limpar reserva didática */
  clearAllReservedBooks: async () => {
    console.log("🔵 [BooksService] Removendo todos os livros da reserva didática");
    try {
      const result = await fetchJson(`${API_BASE}/reserved/clear`, {
        method: 'DELETE',
      });
      console.log("🟢 [BooksService] Todos os livros removidos da reserva didática:", result);
      return result;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível limpar a reserva didática.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao limpar reserva didática", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Listar livros reservados didaticamente */
  getReservedBooks: async () => {
    console.log("🔵 [BooksService] Buscando livros reservados didaticamente");
    try {
      const books = await fetchJson(`${API_BASE}/reserved`, {
        method: 'GET',
      });
      console.log(`🟢 [BooksService] Livros reservados encontrados: ${books.length}`);
      return books;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível buscar os livros reservados.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao buscar livros reservados", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* ================ IMPORTAÇÃO E EXPORTAÇÃO ================ */

  /* Importar livros via CSV */
  importBooksFromCSV: async (csvFile: File) => {
    console.log("🔵 [BooksService] Importando livros via CSV");
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    try {
      const result = await fetch(`${API_BASE}/import/csv`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(localStorage.getItem('user') ? { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).token}` } : {})
        },
      });
      if (!result.ok) {
        const error = await result.text();
        throw new Error(error || 'Erro na importação');
      }
      const data = await result.json();
      console.log("🟢 [BooksService] Importação de livros via CSV concluída:", data);
      return data;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível importar os livros.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao importar livros via CSV", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

  /* Exportar catálogo em CSV */
  exportBooksToCSV: async () => {
    console.log("🔵 [BooksService] Exportando catálogo de livros para CSV");
    try {
      const csv = await fetchJson(`${API_BASE}/export/csv`, {
        method: 'GET',
      });
      console.log("🟢 [BooksService] Exportação de livros para CSV concluída");
      return csv;
    } catch (err: any) {
      let technicalMsg = "";
      try { technicalMsg = JSON.parse(err.message).error; } catch {}
      const errorMsg = `Não foi possível exportar o catálogo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.error("🔴 [BooksService] Erro ao exportar catálogo", technicalMsg || err);
      throw new Error(errorMsg);
    }
  },

};
