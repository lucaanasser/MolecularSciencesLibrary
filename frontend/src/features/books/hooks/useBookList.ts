import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Só busca se pelo menos um filtro estiver preenchido
    if (!enabled && !search && !category && !subcategory) {
      setBooks([]);
      return;
    }

    setIsLoading(true);
    setBooks([]);

    // Monta a query string dinamicamente
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (subcategory) params.append("subcategory", subcategory);
    if (search) params.append("q", search);

    console.log("🔵 [useBookList] Buscando livros da API...", params.toString());

    fetch(`${API_URL}/books?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setBooks(Array.isArray(data) ? data : []);
        setIsLoading(false);
        console.log("🟢 [useBookList] Livros carregados:", Array.isArray(data) ? data.length : 0);
      })
      .catch(error => {
        console.error("🔴 [useBookList] Erro ao buscar livros:", error);
        if (onError) onError(error);
        setBooks([]);
        setIsLoading(false);
      });
  }, [category, subcategory, search, enabled, onError]);

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