import { useState } from "react";
import useAreaSelection from "./useAreaSelection";
import useBookSearch from "./useFetchSearch";

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

  // Estado para filtro de disponibilidade
  const [filterAvailable, setFilterAvailable] = useState<"all" | "available" | "borrowed">("all");

  // Hook de busca de livros
const {
  books,
  filteredBooks,
  isLoading,
  search,
  setSearch,
} = useBookSearch(category, subcategory, true, onError);
  // Filtra por disponibilidade
  const filteredByAvailability = filteredBooks.filter(book => {
    if (filterAvailable === "all") return true;
    if (filterAvailable === "available") return book.available;
    if (filterAvailable === "borrowed") return !book.available;
    return true;
  });

  return {
    category,
    setCategory,
    subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes,
    filterAvailable,
    setFilterAvailable,
    search,
    setSearch,
    books: filteredByAvailability,
    isLoading,
  };
}