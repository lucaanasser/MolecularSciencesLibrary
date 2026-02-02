import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Settings, Save } from 'lucide-react';
import VirtualBookshelfService from '@/features/bookshelf/services/VirtualBookshelfService';
import { VirtualShelf } from '@/features/bookshelf/types/virtualbookshelf';

interface ShelfRowData {
  startCode: string;
  endCode: string;
  originalStartCode?: string;
  originalEndCode?: string;
}

interface ShelfRowEditorProps {
  shelfRow: number;
  data: ShelfRowData;
  onChange: (data: ShelfRowData) => void;
}

const ShelfRowEditor: React.FC<ShelfRowEditorProps> = ({
  shelfRow,
  data,
  onChange
}) => {
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">Prateleira {shelfRow}</span>
        {data.originalStartCode && (
          <span className="text-xs text-gray-600">
            {data.originalStartCode} {data.originalEndCode && `→ ${data.originalEndCode}`}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Código inicial"
          value={data.startCode}
          onChange={(e) => onChange({ ...data, startCode: e.target.value })}
          className="h-8 text-sm flex-1"
        />
        <Input
          placeholder="Código final"
          value={data.endCode}
          onChange={(e) => onChange({ ...data, endCode: e.target.value })}
          className="h-8 text-sm flex-1"
        />
      </div>
    </div>
  );
};

interface ShelfConfigProps {
  shelfNumber: number;
  shelvesConfig: VirtualShelf[];
  onUpdate: () => void;
}

const ShelfConfig: React.FC<ShelfConfigProps> = ({
  shelfNumber,
  shelvesConfig,
  onUpdate
}) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getInitialData = (): Record<number, ShelfRowData> => {
    const data: Record<number, ShelfRowData> = {};
    for (let row = 1; row <= 6; row++) {
      const config = shelvesConfig.find(s => s.shelf_number === shelfNumber && s.shelf_row === row);
      data[row] = {
        startCode: config?.book_code_start || '',
        endCode: config?.book_code_end || config?.calculated_book_code_end || '',
        originalStartCode: config?.book_code_start,
        originalEndCode: config?.book_code_end || config?.calculated_book_code_end,
      };
    }
    return data;
  };

  const [rowsData, setRowsData] = useState<Record<number, ShelfRowData>>(getInitialData);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setRowsData(getInitialData());
      setError(null);
    }
  };

  const handleRowChange = (row: number, data: ShelfRowData) => {
    setRowsData(prev => ({ ...prev, [row]: data }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      for (let row = 1; row <= 6; row++) {
        const data = rowsData[row];
        // Sempre envia, mesmo se vazio, se mudou
        if (data.startCode !== data.originalStartCode) {
          await VirtualBookshelfService.updateShelfStartCode(shelfNumber, row, data.startCode ?? "");
        }
        if (data.endCode !== data.originalEndCode) {
          await VirtualBookshelfService.updateShelfEndCode(shelfNumber, row, data.endCode ?? "");
        }
      }
      setOpen(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Prateleiras - Estante {shelfNumber}</DialogTitle>
          <DialogDescription>
            Preencha o código do primeiro e do último livro de cada prateleira.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {[1, 2, 3, 4, 5, 6].map(row => (
            <ShelfRowEditor
              key={`${shelfNumber}-${row}`}
              shelfRow={row}
              data={rowsData[row]}
              onChange={(data) => handleRowChange(row, data)}
            />
          ))}
        </div>
        {error && <span className="text-xs text-red-500">{error}</span>}
        <DialogFooter>
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            variant='wide'
            className='bg-cm-green'
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShelfConfig;
