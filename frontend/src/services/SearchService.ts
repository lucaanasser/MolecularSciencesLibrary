/**
 * SERVIÇO UNIFICADO DE BUSCA
 * 
 * Centraliza todas as operações de busca dos 3 modos:
 * - Disciplinas (modo acadêmico)
 * - Usuários (modo acadêmico)
 * - Livros (modo biblioteca)
 * 
 * OBJETIVO: 
 * Evitar duplicação de código, facilitar manutenção e garantir consistência
 * entre os diferentes modos de busca.
 * 
 * EXPORTS:
 * - Reexporta todos os serviços específicos (disciplines, users, books)
 * - Tipos TypeScript unificados
 * - Função unifiedSearch() para busca genérica por modo
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// ================ TIPOS E SERVIÇOS DE DISCIPLINAS E USUÁRIOS ================
import { searchDisciplines } from "@/services/DisciplinesService";
import { searchUsers } from "./UsersService";

// Reexporta os tipos e serviços de disciplinas
export {
  searchDisciplines,
  checkExactMatch,
  getDisciplines,
  getDisciplineByCodigo,
} from "./DisciplinesService";

// Reexporta os tipos e serviços de usuários
export {
  searchUsers,
  getUserById,
  type User,
  type UserSearchFilters as UserFilters,
} from "./UsersService";

// ================ TIPOS PARA LIVROS ================

import { Book, BookFilters } from "@/types/book";

// ================ SERVIÇO DE LIVROS ================

/**
 * Busca livros com autocomplete
 * GET /api/books/search?q=termo&limit=10
 */
export async function searchBooks(query: string, limit: number = 10): Promise<BookSearchResult[]> {
  console.log(`🔵 [SearchService] Buscando livros: "${query}"`);
  
  if (!query || query.length < 2) {
    return [];
  }
  
  const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  
  if (!response.ok) {
    console.error(`🔴 [SearchService] Erro ao buscar livros`);
    throw new Error("Erro ao buscar livros");
  }
  
  const data = await response.json();
  console.log(`🟢 [SearchService] ${data.length} livros encontrados`);
  return data;
}

/**
 * Busca livros com filtros e paginação
 * GET /api/books?q=X&category=Y&limit=N&offset=M
 */
export async function getBooks(filters: BookFilters = {}): Promise<Book[]> {
  console.log(`🔵 [SearchService] Buscando livros com filtros:`, filters);
  
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.subcategory) params.append("subcategory", filters.subcategory);
  if (filters.search) params.append("search", filters.search);
  if (filters.q) params.append("q", filters.q);
  if (filters.status) params.append("status", filters.status);
  if (filters.reserved) params.append("reserved", filters.reserved);
  if (filters.extended !== undefined) params.append("extended", filters.extended.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.offset) params.append("offset", filters.offset.toString());
  
  const url = `/api/books${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`🔴 [SearchService] Erro ao buscar livros`);
    throw new Error("Erro ao buscar livros");
  }
  
  const data = await response.json();
  console.log(`🟢 [SearchService] ${data.length} livros retornados`);
  return data;
}

/**
 * Busca livro por ID
 * GET /api/books/:id
 */
export async function getBookById(id: number): Promise<Book | null> {
  console.log(`🔵 [SearchService] Buscando livro: ${id}`);
  
  const response = await fetch(`/api/books/${id}`);
  
  if (response.status === 404) {
    console.log(`🟡 [SearchService] Livro não encontrado: ${id}`);
    return null;
  }
  
  if (!response.ok) {
    console.error(`🔴 [SearchService] Erro ao buscar livro`);
    throw new Error("Erro ao buscar livro");
  }
  
  const data = await response.json();
  console.log(`🟢 [SearchService] Livro encontrado:`, data.title);
  return data;
}

/**
 * Conta total de livros com filtros
 * GET /api/books/count?q=X&category=Y
 */
export async function countBooks(filters: BookFilters = {}): Promise<number> {
  console.log(`🔵 [SearchService] Contando livros com filtros:`, filters);
  
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.subcategory) params.append("subcategory", filters.subcategory);
  if (filters.search) params.append("search", filters.search);
  if (filters.q) params.append("q", filters.q);
  if (filters.status) params.append("status", filters.status);
  if (filters.reserved) params.append("reserved", filters.reserved);
  
  const url = `/api/books/count${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`🔴 [SearchService] Erro ao contar livros`);
    throw new Error("Erro ao contar livros");
  }
  
  const data = await response.json();
  console.log(`🟢 [SearchService] Total de livros: ${data.count}`);
  return data.count;
}

/**
 * Obtém opções de categorias e subcategorias de livros
 * GET /api/books/options
 * 
 * O backend retorna nomes amigáveis para exibição no frontend:
 * - areas: { "Física": "Física", ... }
 * - subareas: { "Física": { "Mecânica": "Mecânica", ... } }
 */
export async function getBookOptions(): Promise<{ 
  areas: Record<string, string>;
  subareas: Record<string, Record<string, string>>;
}> {
  console.log(`🔵 [SearchService] Buscando opções de categorias`);
  
  const response = await fetch("/api/books/options");
  
  if (!response.ok) {
    console.error(`🔴 [SearchService] Erro ao buscar opções`);
    throw new Error("Erro ao buscar opções de categorias");
  }
  
  const data = await response.json();
  console.log(`🟢 [SearchService] Opções de categorias obtidas`);
  return data;
}

// ================ TIPOS UNIFICADOS ================

import { SearchMode } from "@/types/search";
import { BookSearchResult, DisciplineSearchResult, UserSearchResult } from "@/types/search";
export { type BookSearchResult, 
         type DisciplineSearchResult, 
         type UserSearchResult } from "@/types/search";

export type UnifiedSearchResult = 
  | (BookSearchResult & { _type: "livros" })
  | (DisciplineSearchResult & { _type: "disciplinas" })
  | (UserSearchResult & { _type: "usuarios" });
/**
 * Busca unificada - retorna resultados do modo atual
 */
export async function unifiedSearch(
  query: string, 
  mode: SearchMode, 
  limit: number = 10
): Promise<UnifiedSearchResult[]> {
  console.log(`🔵 [SearchService] Busca unificada: mode=${mode}, query="${query}"`);
  
  try {
    switch (mode) {
      case "livros": {
        const results = await searchBooks(query, limit);
        return results.map(r => ({ ...r, _type: "livros" as const }));
      }
      case "disciplinas": {
        const results = await searchDisciplines(query, limit);
        return results.map(r => ({ ...r, _type: "disciplinas" as const }));
      }
      case "usuarios": {
        const results = await searchUsers(query, limit);
        return results.map(r => ({ ...r, _type: "usuarios" as const }));
      }
      default:
        return [];
    }
  } catch (error) {
    console.error(`🔴 [SearchService] Erro na busca unificada:`, error);
    throw error;
  }
}