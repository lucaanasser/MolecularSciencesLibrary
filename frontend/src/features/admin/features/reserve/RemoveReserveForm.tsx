import React, { useState } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { Input } from "@/components/ui/input";
import { BooksService } from "@/services/BooksService";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const RemoveReserveForm: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  const [bookCode, setBookCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRemoveFromReserve = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookCode.trim()) {
      onError('Informe o código do livro.');
      return;
    }

    setLoading(true);
    try {
      const book = await BooksService.unreserveBook(Number(bookCode.trim()));
      setBookCode('');
      onSuccess(`Livro "${book}" removido da reserva.`);
    } catch (err: any) {
      onError(err || 'Erro ao remover da reserva.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p>Insira o código de barras do livro que deseja remover da reserva:</p>
      <form onSubmit={handleRemoveFromReserve} className="">
        <Input
          type="text"
          value={bookCode}
          onChange={(e) => setBookCode(e.target.value)}
          placeholder="Escaneie ou digite o código de barras"
          disabled={loading}
        />
        <ActionBar
          onCancel={onBack}
          onConfirm={undefined}
          confirmLabel="Remover"
          confirmColor="bg-cm-red"
          loading={loading}
        />
      </form>
    </>
  );
};

export default RemoveReserveForm;