/**
 * Hook controlador para lógica da barra de busca.
 *
 * Gerencia:
 * - Valor do input de busca.
 * - Submissão da busca.
 * - Sugestões/autocomplete.
 * - Navegação por teclado nas sugestões.
 *
 * Retorna handlers e estados para uso no SearchPanel.
 */

import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRecentSearches, useSuggestions, useFiltersController } from "..";
import type { SearchPropsConfig, SearchItem } from "..";

export function useSearchController({
  icon,
  placeholder,
  autocompleteService: searchService,
  resultRoute,
  suggestionRoute,
  renderSuggestion,
  populars = [],
}: SearchPropsConfig) {

  const navigate = useNavigate();

  // Estados de input, sugestões, buscas recentes, foco e seleção
  const [query, setQuery] = useState("");
  const suggestions = useSuggestions(query, searchService);
  const [recent, addRecent, clearRecents] = useRecentSearches();
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Ref para o input (para foco programático)
  const inputRef = useRef<HTMLInputElement>(null);

  // Lista unificada de sugestões, recentes e populares (para navegação por teclado)
  const allItems = [
    ...(suggestions || []),
    ...recent.map(q => ({ label: q })),
    ...(populars || []),
  ];

  // Handler para submissão da busca
  const handleSearchSubmit = useCallback((searchValue?: string) => {
    const q = searchValue ?? query;
    if (!q.trim()) return;
    addRecent(q);
    navigate(`${resultRoute}?q=${encodeURIComponent(q)}`);
  }, [query, addRecent, navigate, resultRoute]);

  // Handler para navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!allItems.length) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } 
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } 
    else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const item = allItems[selectedIndex];
      
      // Decide qual handler chamar conforme a origem do item
      if (suggestions?.includes(item)) onSuggestionClick(item);
      else if (recent.map(q => ({ label: q })).includes(item)) onRecentClick(item);
      else if (populars?.includes(item)) onPopularClick(item);
    }
  };

  // Handlers para clique nas sugestões, recentes e populares
  const onSuggestionClick = (item: SearchItem) => { 
    navigate(suggestionRoute(item));
  };
  const onRecentClick = (item: SearchItem) => {
    handleSearchSubmit(item.label);
  };
  const onPopularClick = (item: SearchItem) => {
    handleSearchSubmit(item.label);
  };

  return {
    // Props visuais
    icon,
    placeholder,

    // Estado do input
    query,

    // Dados para dropdown
    suggestions,
    recents: recent.map(q => ({ label: q })),
    populars,
    renderSuggestion,

    // Handlers principais
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    onSubmit: handleSearchSubmit,
    onSuggestionClick,
    onRecentClick,
    onPopularClick,
    onClearRecents: clearRecents,

    // Controle de UI/UX
    inputRef,
    focused,
    setFocused,
    selectedIndex,
    handleKeyDown,
  };
}