import { useState, useEffect } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { Input } from "@/components/ui/input";
import { BooksService } from "@/services/BooksService";

export default function AddToReserveForm({ onBack, onSuccess, onError }) {
  const [bookCode, setBookCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddToReserve = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookCode.trim()) {
      onError('Informe o código do livro.');
      return;
    }
    setLoading(true);
    try {
      const book = await BooksService.reserveBook(Number(bookCode.trim()));
      setBookCode('');
      onSuccess(`Livro "${book}" adicionado à reserva.`);
    } catch (err: any) {
      onError(err?.message || 'Erro ao adicionar à reserva.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p>Insira o código de barras do livro que deseja adicionar à reserva:</p>
      <form onSubmit={handleAddToReserve}>
        <div>
          <Input
            type="text"
            value={bookCode}
            onChange={(e) => setBookCode(e.target.value)}
            placeholder="Escaneie ou digite o código de barras"
            disabled={loading}
          />
        </div>
        <ActionBar
          onCancel={onBack}
          onConfirm={undefined}
          confirmLabel="Adicionar"
          loading={loading}
        />
      </form>
    </>
  );
};