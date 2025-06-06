import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VirtualShelf, EditingMode } from '@/types/VirtualBookshelf';
import VirtualBookshelfService from '@/services/VirtualBookshelfService';

interface ShelfConfigEditorProps {
  shelves: VirtualShelf[];
  onUpdate: () => void;
  onError: (error: string) => void;
}

/**
 * Componente para edição de configuração de prateleiras
 * Permite definir códigos iniciais e finais, e marcar últimas prateleiras
 */
const ShelfConfigEditor: React.FC<ShelfConfigEditorProps> = ({ shelves, onUpdate, onError }) => {
  const [editingShelf, setEditingShelf] = useState<{ shelf: VirtualShelf; mode: EditingMode } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Organiza prateleiras por estante
  const shelfsByBookcase = shelves.reduce((acc, shelf) => {
    if (!acc[shelf.shelf_number]) {
      acc[shelf.shelf_number] = [];
    }
    acc[shelf.shelf_number].push(shelf);
    return acc;
  }, {} as Record<number, VirtualShelf[]>);

  // Ordena prateleiras por linha
  Object.keys(shelfsByBookcase).forEach(bookcaseKey => {
    shelfsByBookcase[Number(bookcaseKey)].sort((a, b) => a.shelf_row - b.shelf_row);
  });

  const handleStartEdit = (shelf: VirtualShelf, mode: EditingMode) => {
    if (mode === 'start') {
      setEditingValue(shelf.book_code_start || '');
    } else if (mode === 'end') {
      setEditingValue(shelf.book_code_end || '');
    }
    setEditingShelf({ shelf, mode });
  };

  const handleSaveEdit = async () => {
    if (!editingShelf) return;
    
    setLoading(true);
    try {
      const { shelf, mode } = editingShelf;
      
      if (mode === 'start') {
        await VirtualBookshelfService.updateShelfStartCode(
          shelf.shelf_number,
          shelf.shelf_row,
          editingValue
        );
      } else if (mode === 'end') {
        await VirtualBookshelfService.updateShelfEndCode(
          shelf.shelf_number,
          shelf.shelf_row,
          editingValue
        );
      }
      
      setEditingShelf(null);
      onUpdate();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLastShelf = async (shelf: VirtualShelf) => {
    setLoading(true);
    try {
      await VirtualBookshelfService.setLastShelf(
        shelf.shelf_number,
        shelf.shelf_row,
        !shelf.is_last_shelf
      );
      onUpdate();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao alterar configuração');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingShelf(null);
    setEditingValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-bold text-lg mb-4">Configuração das Prateleiras</h3>
      <div className="space-y-6">
        {Object.entries(shelfsByBookcase).map(([bookcaseNumber, bookcaseShelves]) => (
          <div key={bookcaseNumber} className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-md mb-3 text-blue-600">
              Estante {bookcaseNumber}
            </h4>
            <div className="space-y-2">
              {bookcaseShelves.map((shelf) => (
                <div
                  key={`${shelf.shelf_number}-${shelf.shelf_row}`}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded border text-sm"
                >
                  <span className="w-20 font-medium">
                    Prateleira {shelf.shelf_row}
                  </span>

                  {/* Código Inicial */}
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-xs">Início:</span>
                    {editingShelf?.shelf.id === shelf.id && editingShelf.mode === 'start' ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border px-2 py-1 rounded text-xs w-24"
                        placeholder="Ex: FIS-01.01"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {shelf.book_code_start || 'Auto'}
                      </span>
                    )}
                    <button
                      onClick={() => handleStartEdit(shelf, 'start')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                      disabled={loading}
                    >
                      ✏️
                    </button>
                  </div>

                  {/* Código Final */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-xs">Fim:</span>
                    {editingShelf?.shelf.id === shelf.id && editingShelf.mode === 'end' ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border px-2 py-1 rounded text-xs w-24"
                        placeholder="Ex: FIS-01.05"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {shelf.calculated_book_code_end || shelf.book_code_end || 'Auto'}
                      </span>
                    )}
                    {shelf.is_last_shelf && (
                      <button
                        onClick={() => handleStartEdit(shelf, 'end')}
                        className="text-gray-600 hover:text-gray-800 text-xs"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                    )}
                  </div>

                  {/* Toggle Última Prateleira */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={shelf.is_last_shelf}
                        onChange={() => handleToggleLastShelf(shelf)}
                        disabled={loading}
                        className="text-xs"
                      />
                      Última
                    </label>
                  </div>

                  {/* Status */}
                  {shelf.is_last_shelf && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      🔚 Final
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botões de ação para edição ativa */}
      {editingShelf && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleSaveEdit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            onClick={handleCancelEdit}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>• <strong>Início:</strong> Define onde a prateleira começa. Códigos anteriores ficam na prateleira anterior.</p>
        <p>• <strong>Fim:</strong> Calculado automaticamente, exceto para últimas prateleiras.</p>
        <p>• <strong>Última:</strong> Prateleiras finais de cada estante precisam ter código final definido manualmente.</p>
      </div>
    </div>
  );
};

export default ShelfConfigEditor;
