import { useEffect, useState } from "react";
import { Loan } from "../types/loan";

/**
 * Hook para buscar lista de empréstimos.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export function useLoanList() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log("🔵 [useLoanList] Buscando lista de empréstimos...");
    fetch("/api/loans")
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar empréstimos");
        return res.json();
      })
      .then(data => {
        setLoans(data);
        console.log("🟢 [useLoanList] Lista de empréstimos carregada:", data.length);
      })
      .catch(err => {
        setError(err.message || "Erro ao buscar empréstimos");
        console.error("🔴 [useLoanList] Erro ao buscar empréstimos:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { loans, loading, error };
}