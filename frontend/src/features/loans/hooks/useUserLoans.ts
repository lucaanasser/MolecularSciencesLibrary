import { useEffect, useState } from "react";
import { Loan } from "../types/loan"; // Assuming your Loan type is in this path

/**
 * Hook para buscar histórico de empréstimos do usuário.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useUserLoans(userId: number | undefined) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // Do not fetch if userId is not available
      setLoans([]);
      console.warn("🟡 [useUserLoans] userId não informado, não buscando empréstimos.");
      return;
    }

    setLoading(true);
    setError(null);
    console.log("🔵 [useUserLoans] Buscando histórico de empréstimos para userId:", userId);
    fetch(`/api/loans/user/${userId}`)
      .then(async res => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao buscar histórico de empréstimos");
        }
        return res.json();
      })
      .then(data => {
        setLoans(data as Loan[]);
        console.log("🟢 [useUserLoans] Histórico de empréstimos carregado:", (data as Loan[]).length);
      })
      .catch(err => {
        setError(err.message || "Erro ao buscar histórico de empréstimos");
        console.error("🔴 [useUserLoans] Erro ao buscar histórico:", err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { loans, loading, error };
}