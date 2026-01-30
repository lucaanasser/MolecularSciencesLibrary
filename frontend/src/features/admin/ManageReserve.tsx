import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReservedBooksList from '@/features/books/components/lists/ReservedBooksList';
import { useBookReserve } from '@/features/books/hooks/useBookReserve';

const ManageReserve = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const { setBookReserved, loading, error } = useBookReserve();
  const [bookCode, setBookCode] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  console.log("🔵 [AdminPage/ManageReserve] Renderizando gerenciamento de reserva");

  const handleAddToReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    if (!bookCode) return;
    try {
      await setBookReserved(bookCode, true);
      setSuccess('Livro adicionado à reserva com sucesso!');
      setBookCode('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setSuccess(null);
    }
  };

  const handleRemoveFromReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    if (!bookCode) return;
    try {
      await setBookReserved(bookCode, false);
      setSuccess('Livro removido da reserva com sucesso!');
      setBookCode('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setSuccess(null);
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/books/reserved/clear', { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao limpar reserva');
      setSuccess('Todos os livros foram removidos da reserva!');
      setConfirmClearAll(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setSuccess('Erro ao limpar reserva');
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 font-semibold">Gerenciamento de Reserva Didática</h2>
      <p className="text-sm sm:text-base text-gray-600">Gerencie os livros reservados para uso didático.</p>
      
      {!selectedTab && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Adicionar à Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-cm-green hover:bg-cm-green/90 text-xs sm:text-sm"
                onClick={() => setSelectedTab('add')}
              >
                Adicionar
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Remover da Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-cm-red hover:bg-cm-red/90 text-xs sm:text-sm"
                onClick={() => setSelectedTab('remove')}
              >
                Remover
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">Livros Reservados</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-cm-blue hover:bg-cm-blue/90 text-xs sm:text-sm"
                onClick={() => setSelectedTab('list')}
              >
                Ver Todos
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'add' && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => {
              setSelectedTab(null);
              setBookCode('');
              setSuccess(null);
            }}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Adicionar Livro à Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddToReserve} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Código do Livro:</label>
                  <Input
                    type="text"
                    value={bookCode}
                    onChange={(e) => setBookCode(e.target.value)}
                    placeholder="Digite o código do livro"
                    disabled={loading}
                    required
                  />
                </div>
                {success && <div className="text-green-600 text-sm">{success}</div>}
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <Button
                  type="submit"
                  className="w-full bg-cm-green hover:bg-cm-green/90"
                  disabled={loading}
                >
                  {loading ? 'Adicionando...' : 'Adicionar à Reserva'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'remove' && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => {
              setSelectedTab(null);
              setBookCode('');
              setSuccess(null);
              setConfirmClearAll(false);
            }}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Remover Livro da Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleRemoveFromReserve} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Código do Livro:</label>
                  <Input
                    type="text"
                    value={bookCode}
                    onChange={(e) => setBookCode(e.target.value)}
                    placeholder="Digite o código do livro"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-cm-red hover:bg-cm-red/90"
                  disabled={loading || !bookCode}
                >
                  {loading ? 'Removendo...' : 'Remover da Reserva'}
                </Button>
              </form>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Remover Todos os Livros da Reserva:</p>
                {!confirmClearAll ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmClearAll(true)}
                  >
                    Remover Todos
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 font-semibold">Tem certeza? Esta ação não pode ser desfeita!</p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleClearAll}
                      >
                        Sim, Remover Todos
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setConfirmClearAll(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {success && <div className="text-green-600 text-sm">{success}</div>}
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'list' && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="mb-4 rounded-xl" 
            onClick={() => setSelectedTab(null)}
          >
            Voltar
          </Button>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Livros Reservados</CardTitle>
            </CardHeader>
            <CardContent>
              <ReservedBooksList />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageReserve;
