import { useState } from "react";
import { RotateCcw } from "lucide-react";
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

interface RenewButtonProps {
  loan: Loan;
  color?: string;
  renewLoading: number | null;
  setRenewLoading: (id: number | null) => void;
  refetch?: () => void;
}

export function RenewButton({ loan, color = "library-purple", renewLoading, setRenewLoading, refetch }: RenewButtonProps) {
  const [renewError, setRenewError] = useState("");
  const [renewSuccess, setRenewSuccess] = useState("");
  const [renewDialog, setRenewDialog] = useState<{ open: boolean; due_date?: string }>({ open: false });

  const dateFormatting = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  async function handlePreviewRenew() {
    setRenewError(""); setRenewSuccess(""); setRenewLoading(loan.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/loans/${loan.id}/preview-renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ user_id: loan.user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRenewDialog({ open: true });
        setRenewError(data.error || "Você não pode mais renovar este empréstimo.");
        toast({
          title: "Erro ao renovar",
          description: data.error || "Você não pode mais renovar este empréstimo.",
          variant: "destructive"
        });
        throw new Error(data.error || "Erro ao renovar empréstimo");
      }
      setRenewDialog({ open: true, due_date: data.due_date });
    } catch (err: any) {
      setRenewError(err.message || "Erro ao renovar empréstimo");
      toast({
        title: "Erro ao renovar",
        description: err.message || "Erro ao renovar empréstimo",
        variant: "destructive"
      });
    } finally {
      setRenewLoading(null);
    }
  }

  async function handleConfirmRenew() {
    setRenewError(""); setRenewSuccess(""); setRenewLoading(loan.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/loans/${loan.id}/renew`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ user_id: loan.user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRenewDialog({ open: true });
        setRenewError(data.error || "Você não pode mais renovar este empréstimo.");
        toast({
          title: "Erro ao renovar",
          description: data.error || "Você não pode mais renovar este empréstimo.",
          variant: "destructive"
        });
        throw new Error(data.error || "Erro ao renovar empréstimo");
      }
      setRenewSuccess("Empréstimo renovado com sucesso!");
      setRenewDialog({ open: false });
      toast({
        title: "Renovação realizada",
        description: "Empréstimo renovado com sucesso!",
        variant: "default"
      });
      refetch && refetch();
    } catch (err: any) {
      setRenewError(err.message || "Erro ao renovar empréstimo");
      toast({
        title: "Erro ao renovar",
        description: err.message || "Erro ao renovar empréstimo",
        variant: "destructive"
      });
    } finally {
      setRenewLoading(null);
    }
  }

  return (
    <>
      <Button
        variant='wide'
        size='sm'
        className={`bg-${color} text-white`}
        onClick={handlePreviewRenew}
        disabled={renewLoading === loan.id}
      >
        <RotateCcw className="w-4 h-4" />
        {renewLoading === loan.id ? "Renovando..." : "Renovar"}
      </Button>

      <AlertDialog open={renewDialog.open} onOpenChange={open => setRenewDialog({ ...renewDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renovar empréstimo</AlertDialogTitle>
            <AlertDialogDescription>
              {renewError
                ? <span className="text-red-600">{renewError}</span>
                : <>
                  Você está renovando o livro <b>{loan.book.title}</b> para a nova data: <b>{renewDialog.due_date ? dateFormatting(renewDialog.due_date) : "(desconhecida)"}</b>
                </>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="wide" size="sm" className="bg-gray-400 text-white" disabled={renewLoading === loan.id} onClick={() => setRenewDialog({ open: false })}>
                Cancelar
              </Button>
            </AlertDialogCancel>
            {!renewError && (
              <AlertDialogAction asChild>
                <Button variant="wide" size="sm" className="bg-cm-green text-white" disabled={renewLoading === loan.id} onClick={handleConfirmRenew}>
                  {renewLoading === loan.id ? "Confirmando..." : "Confirmar"}
                </Button>
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
