import React, { useState } from 'react';
import { useBookReserve } from '@/features/books/hooks/useBookReserve';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BookReservePanel: React.FC = () => {
  const { setBookReserved, loading, error } = useBookReserve();
  const [bookId, setBookId] = useState('');
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    if (!bookId) return;
    try {
      await setBookReserved(bookId, action === 'add');
      setSuccess(`Livro ${action === 'add' ? 'adicionado à' : 'removido da'} reserva didática com sucesso!`);
      setBookId('');
    } catch (err: any) {
      setSuccess(null);
    }
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Reserva Didática</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block font-bold mb-1">ID do Livro</label>
          <input
            type="number"
            value={bookId}
            onChange={e => setBookId(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="Digite o ID do livro"
            required
          />
          <div className="flex gap-2">
            <Button type="submit" className="bg-cm-green text-white" disabled={loading} onClick={() => setAction('add')}>
              Adicionar à Reserva Didática
            </Button>
            <Button type="submit" className="bg-cm-red text-white" disabled={loading} onClick={() => setAction('remove')}>
              Remover da Reserva Didática
            </Button>
          </div>
          {success && <div className="text-green-700 mt-2">{success}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded mt-2">{error}</div>}
        </form>
      </CardContent>
    </Card>
  );
};

export default BookReservePanel;
