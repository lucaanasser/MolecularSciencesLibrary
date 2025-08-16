import { useEffect, useState } from "react";
import useBookOptions from "./useBookOptions";
import useBookList from "./useBookList";

/**
 * Hook de busca de livros com filtros (estado único).
 * Filtros: { category, subcategory, filterStatus, search }
 */
export default function useBookSearchPage(onError?: (e: Error) => void) {
  // Mapeamentos de áreas/subáreas
  const { areaCodes, subareaCodes } = useBookOptions(onError);

  // Estado único de filtros
  type Filters = {
    category: string;
    subcategory: string;
    status: string;
    search: string;
  };

  const [filters, setFilters] = useState<Filters>({
    category: "",
    subcategory: "",
    status: "",
    search: "",
  });

  // Mapeamento de status do frontend para backend
  const statusMap: Record<string, string> = {
    available: "disponível",
    reserved: "reserva didática",
    overdue: "atrasado",
    borrowed: "emprestado",
    all: "",
    extended: "" // não suportado diretamente
  };
  const mappedFilters = {
    ...filters,
    status: statusMap[filters.status] ?? filters.status
  };
  // Busca de livros baseada nos filtros aplicados
  const { books, isLoading } = useBookList(mappedFilters, true, onError);

  // Helpers para UI
  const setCategory = (category: string) => {
    setFilters((prev) => ({ ...prev, category, subcategory: "" }));
  };
  const setSubcategory = (subcategory: string) => {
    setFilters((prev) => ({ ...prev, subcategory }));
  };
  const setStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  };
  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  function resetFilters() {
    setFilters({ category: "", subcategory: "", status: "", search: "" });
  }

  return {
    category: filters.category,
    setCategory,
    subcategory: filters.subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes,
    status: filters.status,
    setStatus,
    search: filters.search,
    setSearch,
    books,
    isLoading,
    resetFilters,
  };
}