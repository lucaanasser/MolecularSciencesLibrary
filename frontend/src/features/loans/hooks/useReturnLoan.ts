import { useState } from "react";

interface ReturnLoanParams {
  NUSP: string;
  password: string;
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
      const res = await fetch("/api/loans/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao registrar devolução");
      }
      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { returnLoan, loading, error, success };
}