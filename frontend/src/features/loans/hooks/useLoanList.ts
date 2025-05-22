import { useEffect, useState } from "react";
import { Loan } from "../types/loan";

export function useLoanList() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/loans")
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar empréstimos");
        return res.json();
      })
      .then(data => setLoans(data))
      .catch(err => setError(err.message || "Erro ao buscar empréstimos"))
      .finally(() => setLoading(false));
  }, []);

  return { loans, loading, error };
}