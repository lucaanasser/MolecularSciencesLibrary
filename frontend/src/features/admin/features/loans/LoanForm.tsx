import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ActionBar from '@/features/admin/components/ActionBar';
import { useBorrowBook } from '@/features/admin/features/loans/hooks/useBorrowBook';
import type { TabComponentProps } from '@/features/admin/components/AdminTabRenderer';

interface LoanFormProps extends TabComponentProps {
  adminMode?: boolean;
}

const LoanForm: React.FC<LoanFormProps> = ({ onBack, onSuccess, onError, adminMode = true }) => {
  // Campos do formulário
  const [bookId, setBookId] = useState('');
  const [nusp, setNusp] = useState('');
  const [password, setPassword] = useState('');

  // Hook cuida da lógica de empréstimo
  const { handleSubmit } = useBorrowBook({
    adminMode,
    onSuccess,
    onError,
    getFormValues: () => ({
      bookId: Number(bookId),
      nusp: Number(nusp),
      password,
    })
  });

  return (
    <>
    <p>
      Preencha os dados abaixo para registrar um empréstimo.
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
      <Label htmlFor="nusp">NUSP do usuário:</Label>
      <Input 
        id="nusp" 
        value={nusp} 
        onChange={e => setNusp(e.target.value)} 
        placeholder="Ex.: 12345678"
        required
      />
      {!adminMode && (
        <div>
          <Label htmlFor="password">Senha do usuário:</Label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
          />
        </div>
      )}

        <ActionBar
          onConfirm={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          onCancel={onBack}
          confirmLabel="Registrar"
        />
    </form>
    </>
  );
};

export default LoanForm;
