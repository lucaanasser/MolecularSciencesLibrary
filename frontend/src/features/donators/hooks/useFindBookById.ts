import useBookSearch from "../../../hooks/useBookList";
import { BookOption } from "@/types/book";

/**
 * Hook para buscar livro por ID.
 */
export function useFindBookById() {
  // Busca todos os livros (sem filtro) - enabled=true força a busca
  const { books, isLoading } = useBookSearch({}, true);

  function findBookById(id: string | number): BookOption | undefined {
    return books.find((b) => String(b.id) === String(id));
  }

  return { findBookById, isLoading };
}
