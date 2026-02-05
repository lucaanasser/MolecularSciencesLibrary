import { useState, useRef, useCallback } from "react";
import { searchDisciplines, searchUsers, searchBooks, type DisciplineSearchResult, type UserSearchResult, type BookSearchResult, type SearchMode } from "@/services/SearchService";
import { getAggregatedRatings } from "@/services/DisciplineEvaluationsService";
import { logger } from "@/utils/logger";

interface DisciplineWithRating extends DisciplineSearchResult {
  avaliacao?: number | null;
}

interface BookWithAvailability extends BookSearchResult {
  availability?: string;
}

export function useAcademicSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("disciplinas");
  const [isLoading, setIsLoading] = useState(false);
  const [disciplineSuggestions, setDisciplineSuggestions] = useState<DisciplineWithRating[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserSearchResult[]>([]);
  const [bookSuggestions, setBookSuggestions] = useState<BookWithAvailability[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar disciplinas na API com debounce
  const searchDisciplinesDebounced = useCallback(async (query: string) => {
    if (query.length < 2) {
      setDisciplineSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchDisciplines(query, 8);
      const resultsWithRatings = await Promise.all(
        results.map(async (disc) => {
          try {
            const stats = await getAggregatedRatings(disc.codigo);
            return { ...disc, avaliacao: stats.media_geral };
          } catch {
            return { ...disc, avaliacao: null };
          }
        })
      );
      setDisciplineSuggestions(resultsWithRatings);
    } catch (error) {
      logger.error("🔴 [useAcademicSearch] Erro ao buscar disciplinas:", error);
      setDisciplineSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar usuários na API com debounce
  const searchUsersDebounced = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUserSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchUsers(query, 8);
      setUserSuggestions(results);
    } catch (error) {
      logger.error("🔴 [useAcademicSearch] Erro ao buscar usuários:", error);
      setUserSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar livros na API com debounce
  const searchBooksDebounced = useCallback(async (query: string) => {
    if (query.length < 2) {
      setBookSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchBooks(query, 8);
      setBookSuggestions(results);
    } catch (error) {
      logger.error("🔴 [useAcademicSearch] Erro ao buscar livros:", error);
      setBookSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    isLoading,
    disciplineSuggestions,
    userSuggestions,
    bookSuggestions,
    searchDisciplinesDebounced,
    searchUsersDebounced,
    searchBooksDebounced,
    searchTimeoutRef,
  };
}
