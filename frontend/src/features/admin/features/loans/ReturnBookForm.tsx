import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ActionBar from '@/features/admin/components/ActionBar';
import { LoansService } from '@/services/LoansService';

export default function ReturnBookForm({onBack, onSuccess, onError, bgColor = "bg-cm-green"}) {
  // Campo do formulário
  const [bookId, setBookId] = useState('');
  const [loading, setLoading] = useState(false);

  // Submissão do formulário usando LoansService
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return; // Previne múltiplos envios

    // O backend busca por books.id (código de barras numérico). Sem esta validação,
    // um código de prateleira (ex.: MAT-06.06) virava NaN → null no JSON e o erro
    // voltava como "ID do livro é obrigatório", que não ajuda quem está no balcão.
    const parsed = Number(bookId.trim());
    if (!bookId.trim() || !Number.isFinite(parsed)) {
      onError('Código inválido. Escaneie ou digite o código de barras numérico do livro, não o código da prateleira (ex.: MAT-06.06).');
      return;
    }

    setLoading(true);
    try {
      await LoansService.returnBook({ book_id: parsed });
      setLoading(false);
      onSuccess("Devolução registrada com sucesso!");
    } catch (err: any) {
      setLoading(false);
      onError(err?.message || 'Erro ao registrar devolução');
    }
  };

  return (
    <>
      <p>
        Preencha os dados abaixo para registrar uma devolução.
      </p>

      <form onSubmit={handleSubmit}>
        <Label htmlFor="bookId">Código do livro:</Label>
        <Input 
          id="bookId" 
          value={bookId} 
          onChange={e => setBookId(e.target.value)} 
          placeholder="Escaneie ou digite o código de barras"
          required
          disabled={loading}
        />
        <ActionBar
          onConfirm={() => handleSubmit()}
          confirmColor={bgColor}
          onCancel={onBack}
          confirmLabel={loading ? "Registrando..." : "Registrar"}
        />
      </form>
    </>
  );
};