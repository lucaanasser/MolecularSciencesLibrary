import { useCallback, useState } from 'react';
import { LoansService } from '@/services/LoansService';

interface UseReturnBookProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  getFormValues: () => {
    bookId: number;
  };
}

export function useReturnBook({ onSuccess, onError, getFormValues }: UseReturnBookProps) {

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const { bookId } = getFormValues();
    try {
      await LoansService.returnBook({ book_id: Number(bookId) });
      const successMsg = 'Devolução registrada com sucesso!';
      console.log('[ReturnForm handleSubmit] Sucesso:', successMsg);
      onSuccess(successMsg);
    } catch (err: any) {
      let technicalMsg = '';
      try {
        technicalMsg = JSON.parse(err.message).error;
      } catch {}
      const errorMsg = `Não foi possível registrar a devolução.${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      console.log('[ReturnForm handleSubmit] Erro:', errorMsg);
      onError(errorMsg);
    }
  }, [onSuccess, onError, getFormValues]);

  return { handleSubmit };
}