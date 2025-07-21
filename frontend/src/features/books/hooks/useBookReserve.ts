import { useCallback, useState } from 'react';
import { BookOption } from '@/features/books/types/book';

const API_BASE = '/api/books';

export function useBookReserve() {
  const [books, setBooks] = useState<BookOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Erro ao buscar livros');
      const data = await res.json();
      setBooks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const setBookReserved = useCallback(async (bookId: number | string, isReserved: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: Number(bookId), isReserved })
      });
      if (!res.ok) throw new Error('Erro ao atualizar reserva didática');
      await res.json();
      await fetchBooks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchBooks]);

  return {
    books,
    loading,
    error,
    fetchBooks,
    setBookReserved,
  };
}
