import { useState } from "react";
import useAreaSelection from "./useAreaSelection";
import useBookSearch from "./useBookList";

/**
 * Hook de busca de livros com filtros de área, subárea e disponibilidade.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function useBookSearchPage(onError?: (e: Error) => void) {
  // Gerencia seleção de área e subárea
  const {
    category,
    setCategory,
    subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes,
  } = useAreaSelection(onError);

  // Estado para filtro de status
  type StatusFilter = "all" | "available" | "borrowed" | "reserved" | "overdue" | "extended";
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");

  // Hook de busca de livros
  const {
    books,
    filteredBooks,
    isLoading,
    search,
    setSearch,
  } = useBookSearch(category, subcategory, true, onError);

  // Filtra por status desejado
  const filteredByStatus = filteredBooks.filter(book => {
    switch (filterStatus) {
      case "all":
        return true;
      case "available":
        return !!book.available;
      case "borrowed":
        return !book.available;
      case "reserved":
        return !!(book as any).is_reserved; // API usa 1/0
      case "overdue":
        return !!(book as any).overdue;
      case "extended":
        return !!(book as any).extended_phase; // API usa 1/0
      default:
        return true;
    }
  });

  // Função para limpar todos os filtros e busca
  function resetFilters() {
    console.log("🟢 [useBookSearchPage] Resetando filtros e busca");
    setCategory("");
    setSubcategory("");
    setFilterStatus("all");
    setSearch("");
  }

  return {
    category,
    setCategory,
    subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes,
    filterStatus,
    setFilterStatus,
    search,
    setSearch,
    books: filteredByStatus,
    isLoading,
    resetFilters,
  };
}