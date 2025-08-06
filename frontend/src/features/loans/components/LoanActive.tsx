import { RotateCcw } from "lucide-react";
import { useUserLoans } from "../hooks/useUserLoans";
import { Loan } from "../types/loan";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoanItem } from "./LoanItem";
import { getLoanStatusProps } from "../utils/getLoanStatusProps";

interface LoanActiveProps {
  userId: number | undefined;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

export default function LoanActive({ userId }: LoanActiveProps) {
  const { loans, loading, error, refetch } = useUserLoans(userId);
  const [nudgeTimestamps, setNudgeTimestamps] = useState<{ [loanId: number]: string }>({});
  const [nudgeLoading, setNudgeLoading] = useState<number | null>(null);
  const [nudgeError, setNudgeError] = useState<string>("");
  const [nudgeSuccess, setNudgeSuccess] = useState<string>("");

  const [renewLoading, setRenewLoading] = useState<number | null>(null);
  const [renewError, setRenewError] = useState<string>("");
  const [renewSuccess, setRenewSuccess] = useState<string>("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  // Helper: check if loan is overdue
  function isOverdue(loan: Loan) {
    if (!loan.due_date) return false;
    return new Date() > new Date(loan.due_date);
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

  // Nova função para preview da renovação
  async function handlePreviewRenew(loan: Loan) {
    setRenewError("");
    setRenewSuccess("");
    setRenewLoading(loan.loan_id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/loans/${loan.loan_id}/preview-renew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: loan.student_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDialogTitle("Limite de renovações atingido");
        setDialogDescription(data.error || "Você não pode mais renovar este empréstimo.");
        setDialogOpen(true);
        throw new Error(data.error || "Erro ao renovar empréstimo");
      }
      // Mostra confirmação antes de renovar
      setDialogTitle("Confirmação de renovação");
      setDialogDescription(`Você está renovando o livro '${loan.book_title}' para a nova data: ${data.due_date ? formatDate(data.due_date) : "(desconhecida)"}. Tem certeza disso?`);
      setDialogOpen(true);
      // Salva dados para confirmar depois
      setPendingRenew({ loan, due_date: data.due_date });
    } catch (err: any) {
      setRenewError(err.message || "Erro ao renovar empréstimo");
    } finally {
      setRenewLoading(null);
    }
  }

  // Estado para confirmação
  const [pendingRenew, setPendingRenew] = useState<{ loan: Loan, due_date: string | null } | null>(null);

  // Função para confirmar renovação
  async function handleConfirmRenew() {
    if (!pendingRenew) return;
    setRenewError("");
    setRenewSuccess("");
    setRenewLoading(pendingRenew.loan.loan_id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/loans/${pendingRenew.loan.loan_id}/renew`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: pendingRenew.loan.student_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDialogTitle("Limite de renovações atingido");
        setDialogDescription(data.error || "Você não pode mais renovar este empréstimo.");
        setDialogOpen(true);
        throw new Error(data.error || "Erro ao renovar empréstimo");
      }
      setDialogTitle("Renovação realizada");
      setDialogDescription(`Você renovou o livro '${pendingRenew.loan.book_title}'. A nova data de entrega é: ${data.due_date ? formatDate(data.due_date) : "(desconhecida)"}`);
      setDialogOpen(true);
      setRenewSuccess("Empréstimo renovado com sucesso!");
      refetch && refetch();
    } catch (err: any) {
      setRenewError(err.message || "Erro ao renovar empréstimo");
    } finally {
      setRenewLoading(null);
      setPendingRenew(null);
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
        let statusText: string;
        let statusColor: string;
        if (overdue) {
          statusText = "Atrasado";
          statusColor = "bg-cm-red/10 text-cm-red";
        } else {
          ({ statusText, statusColor } = getLoanStatusProps(item));
        }
        return (
          <LoanItem
            key={item.loan_id}
            loan={item}
            statusText={statusText}
            statusColor={statusColor}
            showRenew={!overdue}
            onRenew={() => handlePreviewRenew(item)}
            renewLoading={renewLoading === item.loan_id}
          >
            {renewError && renewLoading === item.loan_id && (
              <div className="text-red-600 text-xs mt-1">{renewError}</div>
            )}
            {renewSuccess && renewLoading === item.loan_id && (
              <div className="text-green-600 text-xs mt-1">{renewSuccess}</div>
            )}
          </LoanItem>
        );
      })}
      {nudgeError && <div className="text-red-600 mt-2">{nudgeError}</div>}
      {nudgeSuccess && <div className="text-green-600 mt-2">{nudgeSuccess}</div>}

      {/* Dialog de feedback */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="tracking-wider">{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          {/* Botões de confirmação dentro do pop-up */}
          {pendingRenew && dialogTitle === "Confirmação de renovação" && (
            <div className="flex gap-2 mt-4">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleConfirmRenew}
                disabled={renewLoading === pendingRenew.loan.loan_id}
              >
                Confirmar renovação
              </button>
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={() => { setPendingRenew(null); setDialogOpen(false); }}
              >
                Cancelar
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
