import React, { useState } from "react";
import ActionBar from "@/features/admin/components/ActionBar";
import { Input } from "@/components/ui/input";
import { useBookReserve } from '@/features/books/hooks/useBookReserve';
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const AddReserveForm: React.FC<TabComponentProps> = ({ onBack, onSuccess }) => {
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
      setBookCode('');
      onSuccess(`Livro "${found.title}" adicionado à reserva didática.`);
    } catch (err: any) {
      setInputError(err?.message || 'Erro ao adicionar à reserva.');
    }
  };

  return (
    <>
      <>
        <p>Insira o código de barras do livro que deseja adicionar à reserva:</p>
        <form onSubmit={handleAddToReserve} className="">
          <div>
            <Input
              type="text"
              value={bookCode}
              onChange={(e) => setBookCode(e.target.value)}
              placeholder="Escaneie ou digite o código de barras"
              disabled={loading}
              required
            />
          </div>
          {inputError && <p className="text-cm-red prose-sm">{inputError}</p>}
          <ActionBar
            onCancel={onBack}
            onConfirm={undefined}
            confirmLabel="Adicionar"
            loading={loading}
          />
        </form>
      </>
    </>
  );
};

export default AddReserveForm;
