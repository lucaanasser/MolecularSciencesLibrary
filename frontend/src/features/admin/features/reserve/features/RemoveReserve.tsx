import React, { useState } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookReserve } from '@/features/books/hooks/useBookReserve';
import { toast } from '@/components/ui/use-toast';

interface RemoveReserveProps {
  onBack: () => void;
}

const RemoveReserve: React.FC<RemoveReserveProps> = ({ onBack }) => {
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
      toast({
        title: 'Livro removido da reserva!',
        description: `O livro "${found.title}" foi removido da reserva didática.`,
      });
      setBookCode('');
      setTimeout(() => onBack(), 400);
    } catch (err: any) {
      setInputError(err?.message || 'Erro ao remover da reserva.');
    }
  };

  const handleClearAll = async () => {
    setInputError(null);
    try {
      const response = await fetch('/api/books/reserved/clear', { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao limpar reserva');
      toast({
        title: 'Reserva limpa!',
        description: 'Todos os livros foram removidos da reserva didática.',
      });
      setConfirmClearAll(false);
      setTimeout(() => onBack(), 400);
    } catch (err: any) {
      setInputError('Erro ao limpar reserva');
    }
  };

  return (
    <>
      <p>Insira o código de barras do livro que deseja remover da reserva:</p>
      <form onSubmit={handleRemoveFromReserve} className="space-y-4">
        <Input
          type="text"
          value={bookCode}
          onChange={(e) => setBookCode(e.target.value)}
          placeholder="Digite o código do livro"
          disabled={loading}
        />
        {inputError && <p className="text-cm-red prose-sm">{inputError}</p>}
        <ActionBar
          onCancel={onBack}
          onConfirm={undefined}
          confirmLabel="Remover da Reserva"
          confirmColor="bg-cm-red"
          loading={loading}
        />
      </form>
      {error && <div className="text-cm-red prose-sm">{error}</div>}
    </>
  );
};

export default RemoveReserve;
