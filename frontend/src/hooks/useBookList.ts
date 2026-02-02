
import { useState, useEffect, useRef } from "react";
import { Book } from "@/types/book";

const API_URL = '/api';

/**
 * Hook para buscar livros da API com filtros dinâmicos.
 */
export default function useBookList(filters: Record<string, string>, enabled = false, onError?: (error: Error) => void) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const latestRequestId = useRef<number>(0);
  const requestSeq = useRef<number>(0);

  useEffect(() => {
    const shouldFetch = enabled || Object.values(filters).some(v => !!v);
    if (!shouldFetch) {
      setIsLoading(false);
      setBooks([]);
      return;
    }
    setIsLoading(true);
    setBooks([]);
    // Monta a query string dinamicamente
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const controller = new AbortController();
    const requestId = ++requestSeq.current;
    latestRequestId.current = requestId;
    fetch(`${API_URL}/books?${params.toString()}`, { signal: controller.signal, cache: 'no-store' as RequestCache })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        if (latestRequestId.current !== requestId) return;
        setBooks(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(error => {
        if ((error as any)?.name === 'AbortError') {
          if (latestRequestId.current === requestId) setIsLoading(false);
          return;
        }
        if (onError) onError(error);
        setBooks([]);
        setIsLoading(false);
      });
    return () => {
      controller.abort();
    };
  }, [JSON.stringify(filters), enabled]);

  return {
    books,
    isLoading,
  };
}