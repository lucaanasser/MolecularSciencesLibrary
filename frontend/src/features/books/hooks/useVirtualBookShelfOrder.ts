import { useState, useEffect } from 'react';
import VirtualBookshelfService from '@/services/VirtualBookshelfService';
import { Book } from '@/types/VirtualBookshelf';

/**
 * Hook para gerenciar livros ordenados da estante virtual
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function useOrderedBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    console.log('🔵 [useOrderedBooks] Iniciando carregamento de livros');
    setIsLoading(true);
    setError(null);
    
    try {
      const booksData = await VirtualBookshelfService.getOrderedBooks();
      setBooks(booksData);
      console.log(`🟢 [useOrderedBooks] ${booksData.length} livros carregados com sucesso`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar livros';
      console.error('🔴 [useOrderedBooks] Erro ao carregar livros:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const refreshBooks = () => {
    console.log('🔵 [useOrderedBooks] Atualizando lista de livros');
    fetchBooks();
  };

  return {
    books,
    isLoading,
    error,
    refreshBooks
  };
}