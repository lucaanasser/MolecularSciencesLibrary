import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { useState, useRef, useEffect } from "react";
import { useRecentSearches } from "@/features/search/hooks/useRecentSearches";

import { SearchMode, SearchModeConfig as GenericSearchModeConfig } from "@/types/search";

export function useSearchLogic({
  modes,
  initialMode,
  hideModeSwitcher = false,
}: {
  modes: GenericSearchModeConfig[];
  initialMode?: SearchMode;
  hideModeSwitcher?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode || modes[0].key as SearchMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { recentSearches, saveRecentSearch } = useRecentSearches();
  const mode = modes.find(m => m.key === searchMode);
  const navigate = useNavigate();
  const onSelect = (item: any) => navigate(mode?.searchPath + `?q=${encodeURIComponent(item.id)}`);

  // Buscar sugestões ao digitar
  useEffect(() => {
    let active = true;
    if (searchQuery.length >= 2) {
      logger.info(`[useSearchLogic] Buscando sugestões para '${searchQuery}' no modo '${searchMode}'`);
      setIsLoading(true);
      const mode = modes.find(m => m.key === searchMode);
      if (mode) {
        mode.getSuggestions(searchQuery).then(results => {
          if (active) {
            logger.info(`[useSearchLogic] ${results.length} sugestão(ões) recebida(s) para '${searchQuery}'`);
            setSuggestions(results);
          }
        }).catch(error => {
          logger.error(`[useSearchLogic] Erro ao buscar sugestões:`, error);
        }).finally(() => {
          if (active) setIsLoading(false);
        });
      }
    } else {
      setSuggestions([]);
    }
    return () => { active = false; };
  }, [searchQuery, searchMode, modes]);

  // Handler para clique fora do dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsFocused]);

  // Reset selection quando query ou modo muda
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery, searchMode]);

  // Troca de modo
  const handleModeChange = (key: string) => {
    if (hideModeSwitcher) return;
    logger.info(`[useSearchLogic] Modo de busca alterado para '${key}'`);
    setSearchMode(key as SearchMode);
    setSearchQuery("");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Seleção de sugestão
  const handleSelect = (item: any) => {
    logger.info(`[useSearchLogic] Sugestão selecionada:`, item);
    if (searchMode == "disciplinas")
      navigate(mode.searchPath + `${encodeURIComponent(item.codigo)}`);
    else
      navigate(mode.searchPath + `${encodeURIComponent(item.id)}`);
  };

  // Teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        handleSelect(items[selectedIndex]);
      }
      else 
        handleSearch();
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Botão de busca: tenta match exato antes de qualquer ação, navega conforme resultado, senão seleciona primeiro resultado
  const handleSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length == 0) {
        logger.warn(`[useSearchLogic] Sem query para busca: '${trimmedQuery}'`);
        return;
      }
      logger.info(`[useSearchLogic] Iniciando busca para '${trimmedQuery}' no modo '${searchMode}'`);
      saveRecentSearch(trimmedQuery);
      if (suggestions.length > 0) {
        logger.info(`[useSearchLogic] Selecionando primeiro resultado da sugestão para '${trimmedQuery}'`);
        handleSelect(suggestions[0]);
        return;
      }
      logger.info(`[useSearchLogic] Nenhuma sugestão, navegando para fallback: ${mode.searchFallback}${encodeURIComponent(trimmedQuery)}`);
      navigate(mode.searchFallback + `${encodeURIComponent(trimmedQuery)}`);
    } 
    catch (error) {
      logger.error("Erro ao executar busca:", error);
      if (suggestions.length > 0) {
        logger.info(`[useSearchLogic] Erro na busca, selecionando primeiro resultado da sugestão para '${searchQuery}'`);
        handleSelect(suggestions[0]);
      }
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    isLoading,
    suggestions,
    isFocused,
    setIsFocused,
    selectedIndex,
    setSelectedIndex,
    inputRef,
    dropdownRef,
    handleSelect,
    handleModeChange,
    handleKeyDown,
    handleSearch,
    recentSearches,
    saveRecentSearch,
    onSelect,
  };
}