import React, { useState } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { Input } from "@/components/ui/input";
import { useBookReserve } from '@/features/books/hooks/useBookReserve';
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const RemoveReserveForm: React.FC<TabComponentProps> = ({ onBack, onSuccess }) => {
  const { setBookReserved, loading, error, books, fetchBooks } = useBookReserve();
  const [bookCode, setBookCode] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  React.useEffect(() => {
    if (books.length === 0) fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveFromReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    if (!bookCode.trim()) {
      setInputError('Informe o código do livro.');
      return;
    }
    const found = books.find(b => b.code === bookCode.trim());
    if (!found) {
      setInputError('Livro não encontrado para o código informado.');
      return;
    }
    try {
      await setBookReserved(found.id, false);
      setBookCode('');
      onSuccess(`Livro "${found.title}" removido da reserva didática.`);
    } catch (err: any) {
      setInputError(err?.message || 'Erro ao remover da reserva.');
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
        {inputError && <p className="text-cm-red prose-sm">{inputError}</p>}
        <ActionBar
          onCancel={onBack}
          onConfirm={undefined}
          confirmLabel="Remover"
          confirmColor="bg-cm-red"
          loading={loading}
        />
      </form>
      {error && <div className="text-cm-red prose-sm">{error}</div>}
    </>
  );
};

export default RemoveReserveForm;
