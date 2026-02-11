import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ActionBar from '@/features/admin/components/ActionBar';
import { useReturnBook } from '@/features/admin/features/loans/hooks/useReturnBook';
import type { TabComponentProps } from '@/features/admin/components/AdminTabRenderer';

const ReturnForm: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  // Campo do formulário
  const [bookId, setBookId] = useState('');
  
  // Hook cuida da lógica de devolução
  const { handleSubmit } = useReturnBook({
    onSuccess,
    onError,
    getFormValues: () => ({ bookId: Number(bookId) })
  });

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
        />
        <ActionBar
          onConfirm={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          onCancel={onBack}
          confirmLabel="Registrar"
        />
      </form>
    </>
  );
};

export default ReturnForm;