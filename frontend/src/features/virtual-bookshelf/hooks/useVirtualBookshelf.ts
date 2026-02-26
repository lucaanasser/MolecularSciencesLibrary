import { useState, useEffect } from "react";
import { VirtualShelf, VirtualBookshelfService } from "..";
import { Book } from "@/types/book";

const NUM_BOOKSHELVES = 4;
const SHELVES_PER_BOOKSHELF = 6;

export default function useVirtualBookshelf() {
  // Estado para as estantes, configuração, loading e erro
  const [bookshelves, setBookshelves] = useState<Book[][][]>([]);
  const [shelvesConfig, setShelvesConfig] = useState<VirtualShelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await VirtualBookshelfService.getShelvesConfig();
      setShelvesConfig(config);

      const allShelves: Book[][][] = [];
      for (let shelfNumber = 1; shelfNumber <= NUM_BOOKSHELVES; shelfNumber++) {
        const shelves: Book[][] = [];
        for (let shelfRow = 1; shelfRow <= SHELVES_PER_BOOKSHELF; shelfRow++) {
          const books = await VirtualBookshelfService.getBooksByShelf(shelfNumber, shelfRow);
          shelves.push(books);
        }
        allShelves.push(shelves);
      }
      setBookshelves(allShelves);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar estantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Navegação entre estantes
  const [current, setCurrent] = useState(0);
  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));
  const handleNext = () => setCurrent((c) => Math.min(bookshelves.length - 1, c + 1));

  return {
    bookshelves,
    shelvesConfig,
    loading,
    error,
    reload: fetchData,
    setBookshelves,
    setShelvesConfig,
    current,
    handlePrev,
    handleNext,
  };
}