import { useState } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { BooksService } from "@/services/BooksService";

export default function ClearReserve({ onBack, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handleClearAll = async () => {
    setLoading(true);
    try {
      await BooksService.clearAllReservedBooks();
      onSuccess('Todos os livros foram removidos da reserva didática.');
    } catch (err: any) {
      onError(err || 'Erro ao limpar reserva');
    } finally {
      setLoading(false);
    }
  };

  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <p>
        Esta ação irá remover <b>todos</b> os livros da reserva didática.
        Tem certeza que deseja continuar?
      </p>
      
      <ActionBar
        onCancel={onBack}
        onConfirm={() => {
          if (!confirming) {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000); // reseta após 3s
          } else {
            handleClearAll();
          }
        }}
        confirmLabel={confirming ? "Clique novamente para confirmar" : "Limpar Reserva"}
        confirmColor="bg-cm-red"
        loading={loading}
      />
    </>
  );
};