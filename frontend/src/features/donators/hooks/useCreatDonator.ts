import { useState } from 'react';
import { Donator } from '@/features/donators/types/Donator';

export function useCreateDonator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function createDonator(donator: Donator) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/donators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donator),
      });
      if (!res.ok) throw new Error('Erro ao adicionar doador');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return { createDonator, loading, error, success };
}
