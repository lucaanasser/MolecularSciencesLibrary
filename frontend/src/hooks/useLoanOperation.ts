import { useState } from "react";

/**
 * Hook reutilizável para operações de empréstimo.
 * Pode ser usado tanto na página admin quanto na página do aluno.
 * 
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

export interface CreateLoanParams {
  NUSP: string;
  password?: string; // Opcional para modo admin
  book_id: number;
}

export interface CreateLoanAdminParams {
  NUSP: string;
  book_id: number;
}

export interface LoanResult {
  id?: number;
  loan_id?: number;
  NUSP: string;
  book_id: number;
  loan_date?: string;
  due_date?: string;
  return_date?: string | null;
  status?: string;
}

export function useLoanOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoanResult | null>(null);

  /**
   * Cria um novo empréstimo usando autenticação do usuário
   */
  const createLoan = async (params: CreateLoanParams): Promise<LoanResult> => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔵 [useLoanOperations] Registrando novo empréstimo:", { NUSP: params.NUSP, book_id: params.book_id });
      
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("🔴 [useLoanOperations] Erro ao criar empréstimo:", data.error);
        throw new Error(data.error || "Erro ao criar empréstimo");
      }

      const data = await res.json();
      setResult(data);
      console.log("🟢 [useLoanOperations] Empréstimo registrado com sucesso:", data);
      return data as LoanResult;
    } catch (err: any) {
      const errorMsg = err.message || "Erro desconhecido ao criar empréstimo";
      setError(errorMsg);
      console.error("🔴 [useLoanOperations] Erro ao criar empréstimo:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria um novo empréstimo no modo admin (sem necessidade de senha)
   */
  const createLoanAdmin = async (params: CreateLoanAdminParams): Promise<LoanResult> => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔵 [useLoanOperations] Registrando empréstimo (admin):", params);
      
      const res = await fetch("/api/loans/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("🔴 [useLoanOperations] Erro ao criar empréstimo (admin):", data.error);
        throw new Error(data.error || "Erro ao criar empréstimo");
      }

      const data = await res.json();
      setResult(data);
      console.log("🟢 [useLoanOperations] Empréstimo registrado com sucesso (admin):", data);
      return data as LoanResult;
    } catch (err: any) {
      const errorMsg = err.message || "Erro desconhecido ao criar empréstimo";
      setError(errorMsg);
      console.error("🔴 [useLoanOperations] Erro ao criar empréstimo (admin):", err);
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
    createLoan,
    createLoanAdmin,
    loading,
    error,
    result,
    reset,
  };
}
