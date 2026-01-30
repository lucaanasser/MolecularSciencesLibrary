import { useState } from 'react';
import { Donator } from '@/features/donators/types/Donator';

export function useDonatorsList() {
  const [donators, setDonators] = useState<Donator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchDonators(filters?: { isUser?: boolean; donationType?: string; name?: string }) {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/donators';
      if (filters && (filters.isUser !== undefined || filters.donationType || filters.name)) {
        const params = new URLSearchParams();
        if (filters.isUser !== undefined) params.append('isUser', String(filters.isUser));
        if (filters.donationType) params.append('donationType', filters.donationType);
        if (filters.name) params.append('name', filters.name);
        url += `/filter?${params.toString()}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao buscar doadores');
      const data = await res.json();
      setDonators(data);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return { donators, loading, error, fetchDonators };
}
