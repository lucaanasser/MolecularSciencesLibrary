import React, { useState } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { Input } from "@/components/ui/input";
import { useBookReserve } from '@/features/books/hooks/useBookReserve';
import { toast } from '@/components/ui/use-toast';

interface AddReserveProps {
  onBack: () => void;
}

const AddReserve: React.FC<AddReserveProps> = ({ onBack }) => {
  const { setBookReserved, loading, error, books, fetchBooks } = useBookReserve();
  const [bookCode, setBookCode] = useState('');
  // Removido success, usaremos toast
  const [inputError, setInputError] = useState<string | null>(null);

  // Garante que a lista de livros está carregada
  React.useEffect(() => {
    if (books.length === 0) fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    if (!bookCode.trim()) {
      setInputError('Informe o código do livro.');
      return;
    }
    // Busca o livro pelo código
    const found = books.find(b => b.code === bookCode.trim());
    if (!found) {
      setInputError('Livro não encontrado para o código informado.');
      return;
    }
    try {
      await setBookReserved(found.id, true);
      toast({
        title: 'Livro reservado com sucesso!',
        description: `O livro "${found.title}" foi adicionado à reserva didática.`,
      });
      setBookCode('');
      setTimeout(() => onBack(), 100);
    } catch (err: any) {
      setInputError(err?.message || 'Erro ao adicionar à reserva.');
    }
  };

  return (
    <>
      <>
        <p>Insira o código de barras do livro que deseja adicionar à reserva:</p>
        <form onSubmit={handleAddToReserve} className="space-y-4">
          <div>
            <Input
              type="text"
              value={bookCode}
              onChange={(e) => setBookCode(e.target.value)}
              placeholder="Digite o código do livro"
              disabled={loading}
              required
            />
          </div>
          {inputError && <p className="text-cm-red prose-sm">{inputError}</p>}
          <ActionBar
            onCancel={onBack}
            onConfirm={undefined}
            confirmLabel="Adicionar à Reserva"
            loading={loading}
          />
        </form>
      </>
    </>
  );
};

export default AddReserve;
