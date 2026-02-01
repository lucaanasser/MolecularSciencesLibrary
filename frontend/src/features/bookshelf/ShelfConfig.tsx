import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Save } from 'lucide-react';
import VirtualBookshelfServiceNew from '@/services/VirtualBookshelfServiceNew';

interface ShelfConfigProps {
  shelfNumber: number;
  shelfRow: number;
  currentStartCode?: string;
  currentEndCode?: string;
  onUpdate: () => void;
}

const ShelfConfig: React.FC<ShelfConfigProps> = ({
  shelfNumber,
  shelfRow,
  currentStartCode,
  currentEndCode,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [startCode, setStartCode] = useState(currentStartCode || '');
  const [endCode, setEndCode] = useState(currentEndCode || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (startCode && startCode !== currentStartCode) {
        await VirtualBookshelfServiceNew.updateShelfStartCode(shelfNumber, shelfRow, startCode);
      }
      if (endCode && endCode !== currentEndCode) {
        await VirtualBookshelfServiceNew.updateShelfEndCode(shelfNumber, shelfRow, endCode);
      }
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <span className="font-medium">Estante {shelfNumber} - Prateleira {shelfRow}</span>
        {currentStartCode && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {currentStartCode} {currentEndCode && `→ ${currentEndCode}`}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-7 w-7 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
      <span className="text-sm font-medium min-w-[120px]">E{shelfNumber}-P{shelfRow}:</span>
      <Input
        placeholder="Código inicial (ex: BIO-01.01)"
        value={startCode}
        onChange={(e) => setStartCode(e.target.value)}
        className="h-8 text-sm"
      />
      <Input
        placeholder="Código final (opcional)"
        value={endCode}
        onChange={(e) => setEndCode(e.target.value)}
        className="h-8 text-sm"
      />
      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving || !startCode}
        className="h-8"
      >
        <Save className="h-4 w-4 mr-1" />
        Salvar
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          setIsEditing(false);
          setStartCode(currentStartCode || '');
          setEndCode(currentEndCode || '');
          setError(null);
        }}
        className="h-8"
      >
        Cancelar
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default ShelfConfig;
