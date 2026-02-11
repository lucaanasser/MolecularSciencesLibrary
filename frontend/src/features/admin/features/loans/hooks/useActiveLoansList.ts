import { useState, useEffect } from "react";
import { LoansService } from "@/services/LoansService";
import { Loan } from "@/types/loan";

export type ActiveLoan = Loan & { is_overdue: boolean };

interface UseActiveLoansListOptions {
  onError?: (msg: string) => void;
}

export function useActiveLoansList({ onError }: UseActiveLoansListOptions = {}) {
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "extended" | "renewed">("all");

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const filteredLoans = (() => {
    let filtered = [...loans];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (loan) =>
          (String(loan.user.name || "")).toLowerCase().includes(term) ||
          (String(loan.user.NUSP || "")).toLowerCase().includes(term) ||
          (String(loan.book.title || "")).toLowerCase().includes(term)
      );
    }
    if (filterStatus === "overdue") {
      filtered = filtered.filter((loan) => loan.is_overdue);
    } else if (filterStatus === "extended") {
      filtered = filtered.filter((loan) => loan.is_extended);
    } else if (filterStatus === "renewed") {
      filtered = filtered.filter((loan) => loan.renewals > 0);
    }
    return filtered;
  })();


  const fetchActiveLoans = async () => {
    try {
      setLoading(true);
      const data = await LoansService.listActiveLoansWithOverdue();
      setLoans(data);
    } catch (err: any) {
      if (onError) onError("Erro ao buscar empréstimos ativos");
    } finally {
      setLoading(false);
    }
  };

  return {
    loans,
    loading,
    fetchActiveLoans,
    filteredLoans,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
  };
}
