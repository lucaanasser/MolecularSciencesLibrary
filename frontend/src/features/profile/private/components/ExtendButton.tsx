import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Loan } from "@/types/loan";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ExtendButtonProps {
  loan: Loan;
  color?: string;
  extendLoading: number | null;
  setExtendLoading: (id: number | null) => void;
  refetch?: () => void;
}

export function ExtendButton({ loan, color = "library-purple", extendLoading, setExtendLoading, refetch }: ExtendButtonProps) {
  const [extendError, setExtendError] = useState("");
  const [extendDialog, setExtendDialog] = useState<{ open: boolean; due_date?: string }>({ open: false });

  const dateFormatting = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  async function handlePreviewExtend() {
    setExtendError(""); setExtendLoading(loan.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/loans/${loan.id}/preview-extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ user_id: loan.user?.id ?? loan.user_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExtendDialog({ open: true });
        setExtendError(data.error || "Não é possível estender este empréstimo.");
        toast({
          title: "Erro ao estender",
          description: data.error || "Não é possível estender este empréstimo.",
          variant: "destructive",
        });
        throw new Error(data.error || "Erro ao estender empréstimo");
      }
      setExtendDialog({ open: true, due_date: data.new_due_date });
    } catch (err: any) {
      setExtendError(err.message || "Erro ao estender empréstimo");
      toast({
        title: "Erro ao estender",
        description: err.message || "Erro ao estender empréstimo",
        variant: "destructive",
      });
    } finally {
      setExtendLoading(null);
    }
  }

  async function handleConfirmExtend() {
    setExtendError(""); setExtendLoading(loan.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/loans/${loan.id}/extend`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ user_id: loan.user?.id ?? loan.user_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExtendError(data.error || "Não é possível estender este empréstimo.");
        toast({
          title: "Erro ao estender",
          description: data.error || "Não é possível estender este empréstimo.",
          variant: "destructive",
        });
        throw new Error(data.error || "Erro ao estender empréstimo");
      }
      setExtendDialog({ open: false });
      toast({
        title: "Extensão realizada",
        description: "Empréstimo estendido com sucesso!",
        variant: "default",
      });
      refetch && refetch();
    } catch (err: any) {
      setExtendError(err.message || "Erro ao estender empréstimo");
      toast({
        title: "Erro ao estender",
        description: err.message || "Erro ao estender empréstimo",
        variant: "destructive",
      });
    } finally {
      setExtendLoading(null);
    }
  }

  return (
    <>
      <Button
        variant="wide"
        size="sm"
        className={`bg-cm-orange text-white`}
        onClick={handlePreviewExtend}
        disabled={extendLoading === loan.id}
      >
        <CalendarPlus className="w-4 h-4" />
        {extendLoading === loan.id ? "Estendendo..." : "Estender"}
      </Button>

      <AlertDialog open={extendDialog.open} onOpenChange={open => setExtendDialog({ ...extendDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estender empréstimo</AlertDialogTitle>
            <AlertDialogDescription>
              {extendError
                ? <span className="text-red-600">{extendError}</span>
                : <>
                  Você está estendendo o empréstimo do livro <b>{loan.book.title}</b> para a nova data: <b>{extendDialog.due_date ? dateFormatting(extendDialog.due_date) : "(desconhecida)"}</b>.
                  <br />
                  <span className="text-sm text-gray-500">Se outro usuário reservar o livro, seu prazo poderá ser encurtado.</span>
                </>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="wide" size="sm" className="bg-gray-400 text-white" disabled={extendLoading === loan.id} onClick={() => setExtendDialog({ open: false })}>
                Cancelar
              </Button>
            </AlertDialogCancel>
            {!extendError && (
              <AlertDialogAction asChild>
                <Button variant="wide" size="sm" className="bg-cm-green text-white" disabled={extendLoading === loan.id} onClick={handleConfirmExtend}>
                  {extendLoading === loan.id ? "Confirmando..." : "Confirmar"}
                </Button>
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
