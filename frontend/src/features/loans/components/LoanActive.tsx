import { RotateCcw, Book, Clock } from "lucide-react";
import { useUserLoans } from "../hooks/useUserLoans";
import { Loan } from "../types/loan";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoanItem } from "./LoanItem";
import { getLoanStatusProps } from "../utils/getLoanStatusProps";
import { useLoanRules } from "@/features/rules/hooks/useLoanRules";

interface LoanActiveProps { userId: number | undefined; }

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"; const date = new Date(dateString); return date.toLocaleDateString("pt-BR"); };

export default function LoanActive({ userId }: LoanActiveProps) {
  const { loans, loading, error, refetch } = useUserLoans(userId);
  const { rules } = useLoanRules();
  const [renewLoading, setRenewLoading] = useState<number | null>(null);
  const [renewError, setRenewError] = useState<string>("");
  const [renewSuccess, setRenewSuccess] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const [pendingRenew, setPendingRenew] = useState<{ loan: Loan, due_date: string | null } | null>(null);

  // Extensão
  const [extendLoading, setExtendLoading] = useState<number | null>(null);
  const [extendError, setExtendError] = useState<string>("");
  const [extendSuccess, setExtendSuccess] = useState<string>("");
  const [pendingExtend, setPendingExtend] = useState<{ loan: Loan, new_due_date: string } | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string>("");

  // Detecção de redução de prazo
  const previousDueDatesRef = useRef<Record<number, string>>({});
  useEffect(() => {
    (loans || []).forEach(l => { if (l.due_date) previousDueDatesRef.current[l.loan_id] = l.due_date; });
  }, []);
  useEffect(() => {
    (loans || []).forEach(l => {
      const prev = previousDueDatesRef.current[l.loan_id];
      if (prev && l.due_date && new Date(l.due_date) < new Date(prev) && l.is_extended === 1) {
        setDialogTitle("Prazo reduzido");
        setDialogDescription(`Seu prazo do livro '${l.book_title}' foi reduzido após uma cutucada. Nova data: ${formatDate(l.due_date)}`);
        setDialogOpen(true);
      }
      if (l.due_date) previousDueDatesRef.current[l.loan_id] = l.due_date;
    });
  }, [loans]);

  // Helpers
  function isOverdue(loan: Loan) { if (!loan.due_date) return false; return new Date() > new Date(loan.due_date); }
  function inExtensionWindow(loan: Loan) { if (!rules) return false; if (loan.is_extended === 1) return false; if ((loan.renewals ?? 0) !== rules.max_renewals) return false; if (!loan.due_date) return false; const due = new Date(loan.due_date); const now = new Date(); const diffDays = Math.ceil((due.getTime()-now.getTime())/(1000*60*60*24)); return diffDays >= 0 && diffDays <= rules.extension_window_days; }

  // Preview renovação existente
  async function handlePreviewRenew(loan: Loan) {
    setRenewError(""); setRenewSuccess(""); setRenewLoading(loan.loan_id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/loans/${loan.loan_id}/preview-renew`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), }, body: JSON.stringify({ user_id: loan.student_id }), });
      const data = await res.json();
      if (!res.ok) { setDialogTitle("Limite de renovações atingido"); setDialogDescription(data.error || "Você não pode mais renovar este empréstimo."); setDialogOpen(true); throw new Error(data.error || "Erro ao renovar empréstimo"); }
      setDialogTitle("Confirmação de renovação"); setDialogDescription(`Você está renovando o livro '${loan.book_title}' para a nova data: ${data.due_date ? formatDate(data.due_date) : "(desconhecida)"}. Confirmar?`); setDialogOpen(true); setPendingRenew({ loan, due_date: data.due_date });
    } catch (err: any) { setRenewError(err.message || "Erro ao renovar empréstimo"); } finally { setRenewLoading(null); }
  }

  async function handleConfirmRenew() {
    if (!pendingRenew) return; setRenewError(""); setRenewSuccess(""); setRenewLoading(pendingRenew.loan.loan_id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/loans/${pendingRenew.loan.loan_id}/renew`, { method: "PUT", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), }, body: JSON.stringify({ user_id: pendingRenew.loan.student_id }), });
      const data = await res.json();
      if (!res.ok) { setDialogTitle("Limite de renovações atingido"); setDialogDescription(data.error || "Você não pode mais renovar este empréstimo."); setDialogOpen(true); throw new Error(data.error || "Erro ao renovar empréstimo"); }
      setDialogTitle("Renovação realizada"); setDialogDescription(`Você renovou o livro '${pendingRenew.loan.book_title}'. Nova data: ${data.due_date ? formatDate(data.due_date) : "(desconhecida)"}`); setDialogOpen(true); setRenewSuccess("Empréstimo renovado com sucesso!"); refetch && refetch();
    } catch (err: any) { setRenewError(err.message || "Erro ao renovar empréstimo"); } finally { setRenewLoading(null); setPendingRenew(null); }
  }

  // Preview extensão
  async function handlePreviewExtend(loan: Loan) {
    setExtendError(""); setExtendSuccess(""); setExtendLoading(loan.loan_id);
    try {
      // Preview só para mostrar nova data potencial
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/loans/${loan.loan_id}/preview-extend`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ user_id: loan.student_id }) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDialogTitle('Solicitar extensão');
      setDialogDescription(`Ao confirmar, o prazo será estendido imediatamente para: ${data.new_due_date ? formatDate(data.new_due_date) : '(desconhecida)'}. Confirmar?`);
      setDialogOpen(true);
      setPendingExtend({ loan, new_due_date: data.new_due_date });
    } catch (err: any) { setExtendError(err.message || 'Erro ao preparar extensão'); } finally { setExtendLoading(null); }
  }

  async function handleConfirmExtend() {
    if (!pendingExtend) return; setExtendError(""); setExtendSuccess(""); setExtendLoading(pendingExtend.loan.loan_id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/loans/${pendingExtend.loan.loan_id}/request-extension`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ user_id: pendingExtend.loan.student_id }) });
      if (!res.ok) throw new Error(await res.text());
      setDialogTitle('Extensão aplicada');
      setDialogDescription(`O prazo do empréstimo foi estendido imediatamente.`);
      setExtendSuccess('Extensão registrada com sucesso');
      setPendingMessage('Extensão aplicada');
      refetch && refetch();
    } catch (err: any) { setExtendError(err.message || 'Erro ao solicitar extensão'); } finally { setExtendLoading(null); setPendingExtend(null); }
  }

  const activeLoans = (loans || []).filter(l => !l.returned_at);
  
  // Verifica se há algum empréstimo atrasado
  const hasOverdueLoans = activeLoans.some(l => isOverdue(l));
  
  if (loading) return <div className="text-center py-8">Carregando empréstimos ativos...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!activeLoans.length) return <div className="text-center py-8 text-gray-500">Nenhum empréstimo ativo.</div>;

  return (
    <div className="space-y-4">
      {hasOverdueLoans && (
        <div className=" rounded-xl p-2 mb-4">
          <p className="text-cm-red">Você possui livro(s) atrasado(s). Devolva-o(s) antes de renovar ou estender qualquer empréstimo.</p>
        </div>
      )}
      <div className="space-y-3">
        {activeLoans.map((loan) => {
          const overdue = isOverdue(loan);
          const { statusText } = getLoanStatusProps(loan);
          const reachedMaxRenewals = rules ? (loan.renewals ?? 0) >= rules.max_renewals : false;
          // Bloqueia renovação/extensão se houver qualquer empréstimo atrasado
          const showRenew = !hasOverdueLoans && !overdue && (loan.is_extended !== 1) && !reachedMaxRenewals;
          const showExtend = !hasOverdueLoans && !overdue && (loan.is_extended !== 1) && reachedMaxRenewals;
          return (
            <div
              key={loan.loan_id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cm-purple/10 flex items-center justify-center">
                  <Book className="w-5 h-5 text-cm-purple" />
                </div>
                <div>
                  <div className="flex flex-row flex-wrap items-center gap-x-1">
                    <span className="text-md font-medium text-black">{loan.book_title || `Livro ID: ${loan.book_id}`}</span>
                    <span className="text-sm text-gray-500">{loan.book_authors ? `, ${loan.book_authors}` : ", Autor desconhecido"}</span>
                  </div>
                  <div className="flex flex-row gap-4 mt-1">
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Empréstimo: {loan.borrowed_at ? new Date(loan.borrowed_at).toLocaleDateString("pt-BR") : "-"}
                    </span>
                    <span className="flex items-center text-sm font-semibold text-cm-purple">
                      <Clock className="w-3 h-3 mr-1" />
                      Prazo: {loan.due_date ? new Date(loan.due_date).toLocaleDateString("pt-BR") : "Sem data"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    loan.returned_at
                      ? "bg-cm-green/20 text-cm-green"
                      : overdue
                      ? "bg-cm-red/20 text-cm-red"
                      : "bg-cm-yellow/20 text-cm-orange"
                  }`}
                >
                  {loan.returned_at ? "Devolvido" : overdue ? "Atrasado" : statusText}
                </span>
                {/* Prazo removido daqui, pois já aparece ao lado do empréstimo */}
                {/* Botões de ação */}
                <div className="flex flex-col gap-1 items-end w-full mt-2">
                  {showRenew && (
                    <button
                      className="flex items-center gap-2 bg-cm-purple text-white px-3 py-1 rounded-full hover:bg-cm-purple/80 disabled:opacity-50"
                      onClick={() => handlePreviewRenew(loan)}
                      disabled={renewLoading === loan.loan_id}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {renewLoading === loan.loan_id ? "Renovando..." : "Renovar"}
                    </button>
                  )}
                  {showExtend && (
                    <button
                      className="flex items-center gap-2 bg-cm-orange text-white px-2 py-1 rounded text-xs hover:bg-cm-orange/80 disabled:opacity-50"
                      disabled={extendLoading === loan.loan_id}
                      onClick={() => handlePreviewExtend(loan)}
                    >
                      {extendLoading === loan.loan_id ? "Estendendo..." : "Extender"}
                    </button>
                  )}
                  {renewLoading === loan.loan_id && renewError && (
                    <div className="text-red-600 text-xs mt-1">{renewError}</div>
                  )}
                  {renewLoading === loan.loan_id && renewSuccess && (
                    <div className="text-green-600 text-xs mt-1">{renewSuccess}</div>
                  )}
                  {extendLoading === loan.loan_id && extendError && (
                    <div className="text-red-600 text-xs mt-1">{extendError}</div>
                  )}
                  {extendLoading === loan.loan_id && extendSuccess && (
                    <div className="text-green-600 text-xs mt-1">{extendSuccess}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Diálogo de confirmação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="tracking-wider">{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          {pendingRenew && dialogTitle.startsWith("Confirmação de renovação") && (
            <div className="flex gap-2 mt-4">
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleConfirmRenew} disabled={renewLoading === pendingRenew.loan.loan_id}>
                {renewLoading === pendingRenew.loan.loan_id ? "Confirmando..." : "Confirmar renovação"}
              </button>
              <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => { setPendingRenew(null); setDialogOpen(false); }} disabled={renewLoading === pendingRenew.loan.loan_id}>Cancelar</button>
            </div>
          )}
          {pendingExtend && dialogTitle.startsWith("Solicitar extensão") && (
            <div className="flex gap-2 mt-4">
              <button className="bg-cm-orange text-white px-3 py-1 rounded" onClick={handleConfirmExtend} disabled={extendLoading === pendingExtend.loan.loan_id}>
                {extendLoading === pendingExtend.loan.loan_id ? "Confirmando..." : "Confirmar extensão"}
              </button>
              <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => { setPendingExtend(null); setDialogOpen(false); }} disabled={extendLoading === pendingExtend.loan.loan_id}>Cancelar</button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
