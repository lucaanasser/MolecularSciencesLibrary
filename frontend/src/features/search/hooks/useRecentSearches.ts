import { useState, useCallback } from "react";

export function useRecentSearches(key = "academicRecentSearches", max = 5) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveRecentSearch = useCallback((term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, max);
    setRecentSearches(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  }, [recentSearches, key, max]);

  return { recentSearches, saveRecentSearch };
}