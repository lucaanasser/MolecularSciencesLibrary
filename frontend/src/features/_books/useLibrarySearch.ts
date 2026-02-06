import { useState, useEffect } from "react";
import { getBooks, countBooks } from "@/services/SearchService";
import { Book } from "@/types/book";
import { logger } from "@/utils/logger";
/*
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Fluxo alternativo 
 * 🔴 Erro
 */

export interface UseLibrarySearchFilters {
  q: string;
  limit?: number;
  offset?: number;
}

export interface UseLibrarySearchResult {
  books: Book[];
  totalCount: number;
  isLoading: boolean;
  availableStatus: string[];
  availableAreas: string[];
  availableLanguages: string[];
  error: unknown;
  refetch: () => void;
}

export function useLibrarySearch(filters: UseLibrarySearchFilters): UseLibrarySearchResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [availableStatus, setAvailableStatus] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const refetch = () => setReloadFlag((f) => f + 1);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!filters.q) {
        logger.info("🟡 [useLibrarySearch] Query vazia, limpando resultados.");
        setBooks([]);
        setTotalCount(0);
        setAvailableStatus([]);
        setAvailableAreas([]);
        setAvailableLanguages([]);
        setError(null);
        return;
      }
      logger.info(`🔵 [useLibrarySearch] Iniciando busca de livros: q='${filters.q}', limit=${filters.limit}, offset=${filters.offset}`);
      setIsLoading(true);
      setError(null);
      try {
        const [results, total] = await Promise.all([
          getBooks({ ...filters }),
          countBooks({ q: filters.q }),
        ]);
        setBooks(results);
        setTotalCount(total);
        // Extrair opções únicas para filtros
        const uniqueStatus = Array.from(
          new Set(results.map((b) => b.status).filter(Boolean))
        ).sort();
        setAvailableStatus(uniqueStatus);
        const uniqueAreas = Array.from(
          new Set(results.map((b) => b.area).filter(Boolean))
        ).sort();
        setAvailableAreas(uniqueAreas);
        const uniqueLanguages = Array.from(
          new Set(results.map((b) => b.language).filter(Boolean))
        ).sort();
        setAvailableLanguages(uniqueLanguages);
        logger.info(`🟢 [useLibrarySearch] Busca concluída com sucesso. Livros: ${results.length}, Total: ${total}`);
      } catch (err) {
        logger.error("🔴 [useLibrarySearch] Erro ao buscar livros:", err);
        setBooks([]);
        setTotalCount(0);
        setAvailableStatus([]);
        setAvailableAreas([]);
        setAvailableLanguages([]);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.limit, filters.offset, reloadFlag]);

  return {
    books,
    totalCount,
    isLoading,
    availableStatus,
    availableAreas,
    availableLanguages,
    error,
    refetch,
  };
}
