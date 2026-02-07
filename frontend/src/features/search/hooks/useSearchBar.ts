
import { useState, useRef, useCallback } from "react";
import { getAggregatedRatings } from "@/services/DisciplineEvaluationsService";
import {
  searchBooks, type BookSearchResult,
  searchDisciplines, type DisciplineSearchResult,
  searchUsers, type UserSearchResult,
} from "@/services/SearchService";
import { logger } from "@/utils/logger";

// Função genérica reutilizável
function useGenericSearchBar<T>({
  searchFn,
  resultProcessor,
  minLength = 2,
  limit = 8,
}: {
  searchFn: (query: string, limit: number) => Promise<T[]>;
  resultProcessor?: (result: T) => Promise<T>;
  minLength?: number;
  limit?: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const searchDebounced = useCallback(async (query: string) => {
      if (query.length < minLength) {
        logger.warn(`🟡 [useGenericSearchBar] Query muito curta: '${query}'`);
        setSuggestions([]);
        return;
      }
      logger.info(`🔵 [useGenericSearchBar] Início de busca por: '${query}'`);
      setIsLoading(true);
      try {
        const results = await searchFn(query, limit);
        let processedResults = results;
        if (resultProcessor) {
          processedResults = await Promise.all(results.map(resultProcessor));
        }
        if (processedResults.length === 0) {
          logger.warn(`🟡 [useGenericSearchBar] Nenhum resultado encontrado para: '${query}'`);
        } else {
          logger.info(`🟢 [useGenericSearchBar] Busca concluída para '${query}' com ${processedResults.length} resultado(s)`);
        }
        setSuggestions(processedResults);
      } catch (error) {
        logger.error(`🔴 [useGenericSearchBar] Erro ao buscar:`, error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
  }, [searchFn, resultProcessor, minLength, limit]);

  return {
    searchQuery,
    setSearchQuery,
    isLoading,
    suggestions,
    searchDebounced,
    searchTimeoutRef,
  };
}

// Tipos auxiliares
export interface DisciplineWithRating extends DisciplineSearchResult {
  avaliacao?: number | null;
}
export interface BookWithAvailability extends BookSearchResult {
  availability?: string;
}

// Função específica para busca de livros
function useBookSearchBar() {
  return useGenericSearchBar<BookWithAvailability>({
    searchFn: searchBooks,
  });
}

// Função específica para busca de disciplinas
function useDisciplineSearchBar() {
  return useGenericSearchBar<DisciplineWithRating>({
    searchFn: searchDisciplines,
    resultProcessor: async (disc) => {
      try {
        const stats = await getAggregatedRatings(disc.codigo);
        return { ...disc, avaliacao: stats.media_geral };
      } catch {
        return { ...disc, avaliacao: null };
      }
    },
  });
}

// Função específica para busca de usuários
function useUserSearchBar() {
  return useGenericSearchBar<UserSearchResult>({
    searchFn: searchUsers,
  });
}

// Função principal que escolhe o modo correto
export function useSearchBar(searchMode: "livros" | "disciplinas" | "usuarios") {
  if (searchMode === "livros") {
    return useBookSearchBar();
  } else if (searchMode === "disciplinas") {
    return useDisciplineSearchBar();
  } else {
    return useUserSearchBar();
  }
}