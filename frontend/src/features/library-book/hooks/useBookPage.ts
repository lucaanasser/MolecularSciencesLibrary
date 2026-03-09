import { useState, useCallback, useEffect } from "react";
import { logger } from "@/utils/logger";
import { Book } from "@/types/book";
import { BooksService } from "@/services/BooksService";
import { LoansService } from "@/services/LoansService";

export function useBookPage(code: string | undefined) {
  const [books, setBooks] = useState<Book[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [loanByBook, setLoanByBook] = useState<{ [id: number]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    if (!code) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BooksService.getBooksByCode(code);
      if (!data || data.length === 0) {
        setError("Nenhum exemplar encontrado para este código");
        return;
      }
      setBooks(data);
      setBook(data[0]);
      const loanResults = await Promise.all(
        data.map((b) =>
          LoansService.getLoansByBook(b.id, true)
            .then((loans) => ({ id: b.id, loan: loans[0] ?? null }))
            .catch(() => ({ id: b.id, loan: null }))
        )
      );
      const loanMap: { [id: number]: any } = {};
      loanResults.forEach((r) => { loanMap[r.id] = r.loan; });
      setLoanByBook(loanMap);
    } catch (err) {
      logger.error("Erro ao carregar exemplares:", err);
      setError("Erro ao carregar exemplares");
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return { books, book, loanByBook, isLoading, error, reload: loadBooks };
}
