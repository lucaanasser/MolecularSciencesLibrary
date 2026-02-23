/**
 * Hook para buscar e gerenciar sugestões de busca/autocomplete.
 *
 * Parâmetros:
 * - query: Termo de busca atual.
 *
 * Retorna:
 * - suggestions: Array de sugestões.
 */

import { useState, useEffect, useCallback } from "react";
import type { SearchItem, AutocompleteService } from "..";

export function useSuggestions(
  query: string,
  searchService: AutocompleteService,
  limit = 5
) {
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    searchService(query, limit)
      .then(results => {
        if (!cancelled) setSuggestions(results);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => { cancelled = true; };
  }, [query, searchService, limit]);

  return suggestions;
}