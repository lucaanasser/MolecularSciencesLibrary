import { useState, useEffect } from "react";
import { LoanRules } from "../types/rules";

export function useLoanRules() {
  const [rules, setRules] = useState<LoanRules | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rules");
      if (!res.ok) throw new Error("Erro ao buscar regras de empréstimo");
      const data = await res.json();
      setRules(data);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar regras");
    } finally {
      setLoading(false);
    }
  };

  const updateRules = async (newRules: LoanRules) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRules),
      });
      if (!res.ok) throw new Error("Erro ao atualizar regras");
      const data = await res.json();
      setRules(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar regras");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return { rules, loading, error, fetchRules, updateRules };
}
