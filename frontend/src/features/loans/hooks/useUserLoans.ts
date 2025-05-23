import { useEffect, useState } from "react";
import { Loan } from "../types/loan"; // Assuming your Loan type is in this path

export function useUserLoans(userId: number | undefined) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // Do not fetch if userId is not available
      setLoans([]);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`/api/loans/user/${userId}`)
      .then(async res => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao buscar histórico de empréstimos");
        }
        return res.json();
      })
      .then(data => setLoans(data as Loan[]))
      .catch(err => setError(err.message || "Erro ao buscar histórico de empréstimos"))
      .finally(() => setLoading(false));
  }, [userId]);

  return { loans, loading, error };
}