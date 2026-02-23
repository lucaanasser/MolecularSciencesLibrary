/**
 * Hook para gerenciar buscas recentes do usuário.
 *
 * Retorna:
 * - recents: Array de buscas recentes.
 * - addRecent: Função para adicionar uma nova busca.
 * - clearRecents: Função para limpar o histórico.
 */

import { useState, useEffect } from "react";

export function useRecentSearches(key = "recentSearches", limit = 5) {
  const [recents, setRecents] = useState<string[]>([]);
  
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    setRecents(stored);
  }, []);

  function addRecent(query: string) {
    if (!query) return;
    const updated = [query, ...recents.filter(q => q !== query)].slice(0, limit);
    setRecents(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  }

  function clearRecents() {
    localStorage.removeItem(key);
    setRecents([]);
  }

  return [recents, addRecent, clearRecents] as const;
}