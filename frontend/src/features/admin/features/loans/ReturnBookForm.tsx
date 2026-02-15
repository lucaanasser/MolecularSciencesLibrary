import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ActionBar from '@/features/admin/components/ActionBar';
import { LoansService } from '@/services/LoansService';
import type { TabComponentProps } from '@/features/admin/components/AdminTabRenderer';

const ReturnBookForm: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  // Campo do formulário
  const [bookId, setBookId] = useState('');
  const [loading, setLoading] = useState(false);

  // Submissão do formulário usando LoansService
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return; // Previne múltiplos envios
    setLoading(true);
    try {
      await LoansService.returnBook({ book_id: Number(bookId) });
      setLoading(false);
      onSuccess("Devolução registrada com sucesso!");
    } catch (err: any) {
      setLoading(false);
      onError(err || 'Erro ao registrar devolução');
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
          onCancel={onBack}
          confirmLabel={loading ? "Registrando..." : "Registrar"}
        />
      </form>
    </>
  );
};

export default ReturnBookForm;