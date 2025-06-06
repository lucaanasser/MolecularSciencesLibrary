import { Clock } from "lucide-react";
import { useUserLoans } from "../hooks/useUserLoans";
import { Loan } from "../types/loan";
import { useState } from "react";

interface LoanActiveProps {
  userId: number | undefined;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

export default function LoanActive({ userId }: LoanActiveProps) {
  const { loans, loading, error } = useUserLoans(userId);
  const [nudgeTimestamps, setNudgeTimestamps] = useState<{ [loanId: number]: string }>({});
  const [nudgeLoading, setNudgeLoading] = useState<number | null>(null);
  const [nudgeError, setNudgeError] = useState<string>("");
  const [nudgeSuccess, setNudgeSuccess] = useState<string>("");

  // Helper: check if loan is overdue
  function isOverdue(loan: Loan) {
    if (!loan.borrowed_at) return false;
    const borrowed = new Date(loan.borrowed_at);
    const due = new Date(borrowed);
    due.setDate(borrowed.getDate() + 7); // TODO: get maxDays from backend/rules if dynamic
    return new Date() > due;
  }

  // Helper: check if can nudge (1 day cooldown)
  function canNudge(loan: Loan) {
    const last = nudgeTimestamps[loan.loan_id];
    if (!last) return true;
    const lastDate = new Date(last);
    return (Date.now() - lastDate.getTime()) > 24 * 60 * 60 * 1000;
  }

  async function handleNudge(loan: Loan) {
    setNudgeError("");
    setNudgeSuccess("");
    setNudgeLoading(loan.loan_id);
    try {
      const token = localStorage.getItem("token");
      // TODO: pegar nome do usuário logado
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
      const requester_name = currentUser?.name || undefined;
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: loan.student_id,
          type: "nudge",
          message: "nudge",
          sendEmail: true,
          metadata: {
            book_title: loan.book_title,
            book_id: loan.book_id,
            loan_id: loan.loan_id,
            requester_name
          }
        })
      });
      if (!res.ok) throw new Error("Erro ao cutucar usuário");
      setNudgeTimestamps(prev => ({ ...prev, [loan.loan_id]: new Date().toISOString() }));
      setNudgeSuccess("Cutucada enviada com sucesso!");
    } catch (e: any) {
      setNudgeError(e.message || "Erro ao cutucar");
    } finally {
      setNudgeLoading(null);
    }
  }

  const activeLoans = (loans || []).filter((loan: Loan) => !loan.returned_at);

  if (loading) {
    return <div className="text-center py-8">Carregando empréstimos ativos...</div>;
  }
  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }
  if (!activeLoans.length) {
    return <div className="text-center py-8 text-gray-500">Nenhum empréstimo ativo.</div>;
  }

  return (
    <div className="space-y-4">
      {activeLoans.map((item: Loan) => {
        const overdue = isOverdue(item);
        const canNudgeNow = canNudge(item);
        return (
          <div
            key={item.loan_id}
            className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{item.book_title || `Livro ID: ${item.book_id}`}</h4>
                <div className="flex space-x-4 mt-1 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Empréstimo: {formatDate(item.borrowed_at)}</span>
                  </div>
                  {overdue && (
                    <span className="ml-2 text-cm-red font-semibold">Atrasado</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 rounded-full text-xs bg-cm-yellow/10 text-cm-orange">
                  Em andamento
                </span>
                {overdue && (
                  <button
                    className={`px-2 py-1 rounded bg-cm-blue text-white text-xs mt-2 disabled:opacity-50`}
                    disabled={!canNudgeNow || nudgeLoading === item.loan_id}
                    onClick={() => handleNudge(item)}
                  >
                    {nudgeLoading === item.loan_id ? "Enviando..." : canNudgeNow ? "Cutucar" : "Aguarde 1 dia"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {nudgeError && <div className="text-red-600 mt-2">{nudgeError}</div>}
      {nudgeSuccess && <div className="text-green-600 mt-2">{nudgeSuccess}</div>}
    </div>
  );
}
