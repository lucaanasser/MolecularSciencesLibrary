import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ActionBar from '@/features/admin/components/ActionBar';
import type { TabComponentProps } from '@/features/admin/components/AdminTabRenderer';
import { LoansService } from '@/services/LoansService';

interface BorrowBookFormProps extends TabComponentProps {
  adminMode?: boolean;
}

const BorrowBookForm: React.FC<BorrowBookFormProps> = ({ onBack, onSuccess, onError, adminMode = true }) => {
  // Campos do formulário
  const [bookId, setBookId] = useState('');
  const [nusp, setNusp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Submissão do formulário usando LoansService
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return; // Previne múltiplos envios
    setLoading(true);
    try {
      if (adminMode) {
        await LoansService.borrowBookAsAdmin({
          book_id: Number(bookId),
          NUSP: Number(nusp),
        });
      } else {
        await LoansService.borrowBook({
          book_id: Number(bookId),
          NUSP: Number(nusp),
          password,
        });
      }
      setLoading(false);
      onSuccess("Empréstimo registrado com sucesso!");
    } catch (err: any) {
      setLoading(false);
      onError(err);
    }
  };

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
          disabled={loading}
        />
        <Label htmlFor="nusp">NUSP do usuário:</Label>
        <Input 
          id="nusp" 
          value={nusp} 
          onChange={e => setNusp(e.target.value)} 
          placeholder="Ex.: 12345678"
          required
          disabled={loading}
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
              disabled={loading}
            />
          </div>
        )}

        <ActionBar
          onConfirm={() => handleSubmit()}
          onCancel={onBack}
          confirmLabel={loading ? "Registrando..." : "Registrar"}
          loading={loading}
        />
      </form>
    </>
  );
};

export default BorrowBookForm;