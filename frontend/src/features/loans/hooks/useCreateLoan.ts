import { useState } from "react";
import { Loan } from "../types/loan";

interface CreateLoanParams {
  NUSP: string;      // ou email, mas backend espera NUSP
  password: string;
  book_id: number;
}

export function useCreateLoan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loan, setLoan] = useState<Loan | null>(null);

  const createLoan = async (params: CreateLoanParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar empréstimo");
      }
      const data = await res.json();
      setLoan(data);
      return data as Loan;
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createLoan, loading, error, loan };
}