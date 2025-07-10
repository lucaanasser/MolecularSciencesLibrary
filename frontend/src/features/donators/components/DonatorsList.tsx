import React, { useEffect, useState } from 'react';
import { useDonatorsList } from '../hooks/useDonatorsList';
import { Donator } from '../types/Donator';

export default function DonatorsList() {
  const [filters, setFilters] = useState<{ isUser?: boolean; donationType?: string; name?: string }>({});
  const { donators, loading, error, fetchDonators } = useDonatorsList();

  useEffect(() => {
    fetchDonators(filters);
    // eslint-disable-next-line
  }, [filters]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Buscar Doadores</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="border rounded p-1"
          value={filters.isUser === undefined ? '' : filters.isUser ? 'user' : 'guest'}
          onChange={e => setFilters(f => ({ ...f, isUser: e.target.value === '' ? undefined : e.target.value === 'user' }))}
        >
          <option value="">Todos</option>
          <option value="user">Usuário</option>
          <option value="guest">Não usuário</option>
        </select>
        <select
          className="border rounded p-1"
          value={filters.donationType || ''}
          onChange={e => setFilters(f => ({ ...f, donationType: e.target.value || undefined }))}
        >
          <option value="">Todos os tipos</option>
          <option value="book">Livro</option>
          <option value="money">Financeira</option>
        </select>
        <input
          className="border rounded p-1"
          placeholder="Nome do doador"
          value={filters.name || ''}
          onChange={e => setFilters(f => ({ ...f, name: e.target.value || undefined }))}
        />
        <button className="border rounded px-2 py-1 bg-cm-blue text-white" onClick={() => fetchDonators(filters)}>
          Buscar
        </button>
      </div>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {donators.map((d: Donator) => (
          <li key={d.id} className="py-2">
            <span className="font-bold">{d.name || 'Usuário #' + d.user_id}</span> —
            {d.donation_type === 'book' ? (
              <span> Doou livro (ID: {d.book_id})</span>
            ) : (
              <span> Doou R$ {d.amount?.toFixed(2)}</span>
            )}
            {d.contact && <span> — Contato: {d.contact}</span>}
            <span className="text-gray-500 ml-2">({new Date(d.created_at || '').toLocaleString()})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
