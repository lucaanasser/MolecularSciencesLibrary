import { useState } from "react";

/**
 * Hook reutilizável para operações de devolução de livros.
 * Pode ser usado tanto na página admin quanto na página do aluno.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

export interface ReturnBookParams {
  book_id: number;
}

export interface ReturnResult {
  message?: string;
  loan_id?: number;
  book_id?: number;
  return_date?: string;
}

export function useReturnOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnResult | null>(null);

  /**
   * Processa a devolução de um livro
   */
  const returnBook = async (params: ReturnBookParams): Promise<ReturnResult> => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔵 [useReturnOperations] Processando devolução do livro:", params.book_id);
      
      const res = await fetch("/api/loans/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("🔴 [useReturnOperations] Erro ao processar devolução:", data.error);
        throw new Error(data.error || "Erro ao processar devolução");
      }

      const data = await res.json();
      setResult(data);
      console.log("🟢 [useReturnOperations] Devolução processada com sucesso:", data);
      return data as ReturnResult;
    } catch (err: any) {
      const errorMsg = err.message || "Erro desconhecido ao processar devolução";
      setError(errorMsg);
      console.error("🔴 [useReturnOperations] Erro ao processar devolução:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpa o estado do hook
   */
  const reset = () => {
    setError(null);
    setResult(null);
  };

  return {
    returnBook,
    loading,
    error,
    result,
    reset,
  };
}
