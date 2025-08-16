import { useEffect, useState } from "react";
import useBookOptions from "./useBookOptions";
import useBookSearch from "./useBookList";

/**
 * Hook de busca de livros com filtros (estado único).
 * Filtros: { category, subcategory, filterStatus, search }
 */
export default function useBookSearchPage(onError?: (e: Error) => void) {
  // Mapeamentos de áreas/subáreas
  const { areaCodes, subareaCodes } = useBookOptions(onError);

  // Estado único de filtros
  type StatusFilter = "all" | "available" | "borrowed" | "reserved" | "overdue" | "extended";
  type Filters = {
    category: string;
    subcategory: string;
    filterStatus: StatusFilter;
    search: string;
  };

  const [filters, setFilters] = useState<Filters>({
    category: "",
    subcategory: "",
    filterStatus: "all",
    search: "",
  });

  // Busca de livros baseada nos filtros aplicados
  const {
    books,
    filteredBooks,
    isLoading,
    search: internalSearch,
    setSearch: setInternalSearch,
  } = useBookSearch(filters.category, filters.subcategory, true, onError);

  // Sincroniza o termo de busca único com o hook de dados
  useEffect(() => {
    if (internalSearch !== filters.search) {
      setInternalSearch(filters.search);
    }
  }, [filters.search, internalSearch, setInternalSearch]);

  // Filtra por status desejado (no cliente)
  const filteredByStatus = filteredBooks.filter((book) => {
    const isReserved = !!(book as any).is_reserved;
    const isAvailable = !!book.available && !isReserved; // disponível para empréstimo
    switch (filters.filterStatus) {
      case "all":
        return true;
      case "available":
        return isAvailable;
      case "borrowed":
        return !book.available;
      case "reserved":
        return isReserved;
      case "overdue":
        return !!(book as any).overdue;
      case "extended":
        return !!(book as any).extended_phase;
      default:
        return true;
    }
  });

  // Ações helper compatíveis com a UI atual
  const setCategory = (category: string) => {
    setFilters((prev) => ({ ...prev, category, subcategory: "" }));
  };
  const setSubcategory = (subcategory: string) => {
    setFilters((prev) => ({ ...prev, subcategory }));
  };
  const setFilterStatus = (status: StatusFilter) => {
    setFilters((prev) => ({ ...prev, filterStatus: status }));
  };
  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  // Reset atômico dos filtros
  function resetFilters() {
    setFilters({ category: "", subcategory: "", filterStatus: "all", search: "" });
  }

  return {
    // Filtros (mantém API esperada por BookSearchPanel)
    category: filters.category,
    setCategory,
    subcategory: filters.subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes,
    filterStatus: filters.filterStatus,
    setFilterStatus,
    search: filters.search,
    setSearch,

    // Dados
    books: filteredByStatus,
    isLoading,

    // Utilitários
    resetFilters,

    // Opcional: expor setFilters se quiser usar de forma atômica
    // setFilters,
  };
}