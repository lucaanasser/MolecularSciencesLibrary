import React, { useState } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface ClearReserveTabProps {
  onBack: () => void;
}

const ClearReserve: React.FC<ClearReserveTabProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleClearAll = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/books/reserved/clear', { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao limpar reserva');
      toast({
        title: 'Reserva limpa!',
        description: 'Todos os livros foram removidos da reserva didática.',
      });
      setTimeout(() => onBack(), 100);
    } catch (err: any) {
      setError('Erro ao limpar reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p>
        Esta ação irá remover <b>todos</b> os livros da reserva didática.
        Tem certeza que deseja continuar?
      </p>
      <ActionBar
        onCancel={onBack}
        onConfirm={() => setAlertOpen(true)}
        confirmLabel="Limpar Reserva"
        confirmColor="bg-cm-red"
        loading={loading}
      />

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar limpeza da reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <b>todos</b> os livros da reserva didática?
              <span className="text-cm-red font-semibold"> Esta ação não pode ser desfeita!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="w-full">
              <ActionBar
                onCancel={() => setAlertOpen(false)}
                onConfirm={async () => {
                  setAlertOpen(false);
                  setConfirm(false);
                  await handleClearAll();
                }}
                confirmLabel="Sim, Limpar Tudo"
                confirmColor="bg-cm-red"
                cancelLabel="Cancelar"
                loading={loading}
              />
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </>
  );
};

export default ClearReserve;
