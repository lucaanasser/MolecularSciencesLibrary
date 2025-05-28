import { useState } from "react";

const API_URL = '/api';

/**
 * Hook para remover livro.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function useRemoveBook() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeBook = async (bookId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("🔵 [useRemoveBook] Removendo livro:", bookId);
      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const msg = `Error ${response.status}: ${response.statusText}`;
        console.error("🔴 [useRemoveBook] Erro ao remover livro:", msg);
        throw new Error(msg);
      }

      console.log("🟢 [useRemoveBook] Livro removido com sucesso:", bookId);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { removeBook, isSubmitting, error };
}