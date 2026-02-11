import { useCallback } from 'react';
import { LoansService } from '@/services/LoansService';

interface UseInternalUseRegisterProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  getFormValues: () => {
    bookId: number;
  };
}

export function useInternalUseRegister({ onSuccess, onError, getFormValues }: UseInternalUseRegisterProps) {
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const { bookId } = getFormValues();
    try {
      const book_id = Number(bookId);
      await LoansService.registerInternalUse({ book_id });
      const successMsg = 'Uso interno registrado com sucesso!';
      onSuccess(successMsg);
    } catch (err: any) {
      let technicalMsg = '';
      try {
        technicalMsg = JSON.parse(err.message).error;
      } catch {}
      const errorMsg = `Não foi possível registrar o uso interno. ${technicalMsg ? '\nMotivo: ' + technicalMsg : ''}`;
      onError(errorMsg);
    }
  }, [onSuccess, onError, getFormValues]);

  return { handleSubmit };
}
