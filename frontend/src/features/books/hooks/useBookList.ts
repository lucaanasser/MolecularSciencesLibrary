import { useState, useEffect, useRef } from "react";
import { BookOption } from "../types/book";

const API_URL = '/api';

/**
 * Hook para buscar livros da API.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function useBookSearch(
  category: string,
  subcategory: string,
  enabled = false,
  onError?: (error: Error) => void
) {
  const [books, setBooks] = useState<BookOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  // Debounce do termo de busca para reduzir requisições
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Track latest request to avoid race conditions
  const latestRequestId = useRef<number>(0);
  const requestSeq = useRef<number>(0);
  const latestQueryKey = useRef<string>("");

  useEffect(() => {
    const shouldFetch = enabled || !!debouncedSearch || !!category || !!subcategory;

    // Não buscar quando não há filtros e não há busca
    if (!shouldFetch) {
      setIsLoading(false);
      setBooks([]);
      latestQueryKey.current = "";
      return;
    }

    setIsLoading(true);
    setBooks([]);

    // Monta a query string dinamicamente
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (subcategory) params.append("subcategory", subcategory);
    if (debouncedSearch) params.append("q", debouncedSearch);

    const queryKey = `cat=${category}|sub=${subcategory}|q=${debouncedSearch}`;
    latestQueryKey.current = queryKey;

    console.log("🔵 [useBookList] Buscando livros da API...", params.toString());

    const controller = new AbortController();
    const requestId = ++requestSeq.current;
    latestRequestId.current = requestId;

    fetch(`${API_URL}/books?${params.toString()}`, { signal: controller.signal, cache: 'no-store' as RequestCache })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        // Ignore responses from outdated requests or mismatched query
        if (latestRequestId.current !== requestId) {
          console.warn("🟡 [useBookList] Ignorando resposta obsoleta por requestId");
          return;
        }
        const currentKey = `cat=${category}|sub=${subcategory}|q=${debouncedSearch}`;
        if (currentKey !== latestQueryKey.current) {
          console.warn("🟡 [useBookList] Ignorando resposta obsoleta por queryKey");
          return;
        }
        setBooks(Array.isArray(data) ? data : []);
        setIsLoading(false);
        console.log("🟢 [useBookList] Livros carregados:", Array.isArray(data) ? data.length : 0);
      })
      .catch(error => {
        if ((error as any)?.name === 'AbortError') {
          console.warn("🟡 [useBookList] Requisição abortada");
          if (latestRequestId.current === requestId) {
            setIsLoading(false);
          }
          return;
        }
        console.error("🔴 [useBookList] Erro ao buscar livros:", error);
        if (onError) onError(error);
        setBooks([]);
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [category, subcategory, debouncedSearch, enabled]);

  // Não precisa mais filtrar por search aqui, pois a API já faz isso
  const filteredBooks = books;

  return {
    books,
    filteredBooks,
    isLoading,
    search,
    setSearch,
  };
}