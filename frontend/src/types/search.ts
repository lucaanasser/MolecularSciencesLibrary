export type SearchMode = "disciplinas" | "usuarios" | "livros";

export interface SearchModeConfig<T = any> {
  key: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  getSuggestions: (query: string) => Promise<T[]>;
  searchPath?: string;
  searchFallback?: string;
  renderSuggestion: (item: T, query: string, selected: boolean) => React.ReactNode;
  renderEmpty?: (query: string) => React.ReactNode;
  renderRecent?: (recent: string[], setQuery: (q: string) => void) => React.ReactNode;
  renderPopular?: (setQuery: (q: string) => void) => React.ReactNode;
}

export interface SearchResult {
  codigo: string;
  nome: string;
  unidade: string | null;
  campus: string | null;
}

export { type Book as BookSearchResult } from "@/types/book";
export { type Discipline as DisciplineSearchResult } from "@/types/discipline";
export { type User as UserSearchResult } from "@/types/user";
export { type UnifiedSearchResult } from "@/services/SearchService";
