import { useCallback } from 'react';
import { LoansService } from '@/services/LoansService';

interface UseLoanBookProps {
  adminMode?: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  getFormValues: () => {
    bookId: number;
    nusp: number;
    password?: string;
  };
}

export function useBorrowBook({ adminMode = true, onSuccess, onError, getFormValues }: UseLoanBookProps) {
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const { bookId, nusp, password } = getFormValues();
    try {
      const book_id = Number(bookId);
      const NUSP = Number(nusp);
      if (adminMode) {
        await LoansService.borrowBookAsAdmin({ book_id, NUSP });
      } else {
        await LoansService.borrowBook({ book_id, NUSP, password: password || '' });
      }
      const successMsg = 'Empréstimo registrado com sucesso!';
      onSuccess(successMsg);
    } catch (err: any) {
      let technicalMsg = '';
      try {
        technicalMsg = JSON.parse(err.message).error;
      } catch {}
      const errorMsg = `Não foi possível registrar o empréstimo.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      onError(errorMsg);
    }
  }, [adminMode, onSuccess, onError, getFormValues]);

  return { handleSubmit };
}
