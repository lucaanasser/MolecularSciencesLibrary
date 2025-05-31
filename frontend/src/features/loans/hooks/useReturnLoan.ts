import { useState } from "react";

/**
 * Hook para registrar devolução de empréstimo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface ReturnLoanParams {
  book_id: number;
  loan_id?: number; 
}

export function useReturnLoan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const returnLoan = async (params: ReturnLoanParams) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      console.log("🔵 [useReturnLoan] Registrando devolução:", params);
      const res = await fetch("/api/loans/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("🔴 [useReturnLoan] Erro ao registrar devolução:", data.error);
        throw new Error(data.error || "Erro ao registrar devolução");
      }
      setSuccess(true);
      console.log("🟢 [useReturnLoan] Devolução registrada com sucesso");
      return true;
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      console.error("🔴 [useReturnLoan] Erro ao registrar devolução:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { returnLoan, loading, error, success };
}