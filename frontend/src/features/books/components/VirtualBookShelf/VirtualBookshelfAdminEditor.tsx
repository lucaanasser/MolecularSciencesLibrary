import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VirtualShelf } from "@/types/VirtualBookshelf";
import VirtualBookshelfService from "@/services/VirtualBookshelfService";
import { Edit, Plus, Check, X } from "lucide-react";

interface VirtualBookshelfAdminEditorProps {
  shelf: VirtualShelf;
  loading: boolean;
  onConfigUpdate: () => void;
  onError: (error: string) => void;
  onCancel: () => void; // NOVO
}

interface EditingState {
  shelfId: number;
  field: 'start' | 'end';
}

/**
 * Componente para edição administrativa de prateleiras virtuais
 * Centraliza toda a lógica de edição de códigos e configurações de prateleiras
 */
const VirtualBookshelfAdminEditor: React.FC<VirtualBookshelfAdminEditorProps> = ({
  shelf,
  loading,
  onConfigUpdate,
  onError,
  onCancel
}) => {
  const [editingShelf, setEditingShelf] = useState<EditingState | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [addingShelf, setAddingShelf] = useState<number | null>(null);
  const [newShelfCode, setNewShelfCode] = useState("");
  const [newShelfLast, setNewShelfLast] = useState(false);
  const [newShelfEndCode, setNewShelfEndCode] = useState("");

  const handleStartEdit = (field: 'start' | 'end') => {
    setEditingShelf({ shelfId: shelf.id, field });
    setEditingValue(field === 'start' ? shelf.book_code_start || '' : shelf.book_code_end || '');
  };

  const handleSaveEdit = async () => {
    if (!editingShelf) return;
    
    try {
      if (editingShelf.field === 'start') {
        await VirtualBookshelfService.updateShelfStartCode(
          shelf.shelf_number,
          shelf.shelf_row,
          editingValue
        );
      } else {
        await VirtualBookshelfService.updateShelfEndCode(
          shelf.shelf_number,
          shelf.shelf_row,
          editingValue
        );
      }
      
      setEditingShelf(null);
      onConfigUpdate();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  };

  const handleCancelEdit = () => {
    setEditingShelf(null);
    setEditingValue('');
  };

  const handleToggleLastShelf = async () => {
    try {
      await VirtualBookshelfService.setLastShelf(
        shelf.shelf_number,
        shelf.shelf_row,
        !shelf.is_last_shelf
      );
      onConfigUpdate();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao alterar configuração');
    }
  };

  const handleAddShelfConfig = async () => {
    try {
      await VirtualBookshelfService.updateShelfStartCode(
        shelf.shelf_number,
        shelf.shelf_row,
        newShelfCode
      );
      
      if (newShelfLast !== shelf.is_last_shelf) {
        await VirtualBookshelfService.setLastShelf(
          shelf.shelf_number,
          shelf.shelf_row,
          newShelfLast
        );
      }

      // Se marcou como última e forneceu código final, atualiza
      if (newShelfLast && newShelfEndCode) {
        await VirtualBookshelfService.updateShelfEndCode(
          shelf.shelf_number,
          shelf.shelf_row,
          newShelfEndCode
        );
      }
      
      setAddingShelf(null);
      setNewShelfCode("");
      setNewShelfLast(false);
      setNewShelfEndCode("");
      onConfigUpdate();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao adicionar prateleira');
    }
  };

  const handleAddNewShelf = async () => {
    try {
      await VirtualBookshelfService.addShelf({
        shelf_number: shelf.shelf_number,
        shelf_row: shelf.shelf_row,
        book_code_start: newShelfCode,
        book_code_end: newShelfLast ? newShelfEndCode : null,
        is_last_shelf: newShelfLast,
      });
      setAddingShelf(null);
      setNewShelfCode("");
      setNewShelfLast(false);
      setNewShelfEndCode("");
      onConfigUpdate();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao adicionar prateleira');
    }
  };

  const handleCancelAdd = () => {
    setAddingShelf(null);
    setNewShelfCode("");
    setNewShelfLast(false);
    setNewShelfEndCode("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
    if (e.key === "Escape") {
      if (editingShelf) handleCancelEdit();
      if (addingShelf) handleCancelAdd();
    }
  };

  // Se shelf não tem id (não existe no banco), mostra interface para adicionar nova prateleira
  if (!("id" in shelf)) {
    return (
      <div className="mb-2 p-3 bg-white bg-opacity-95 rounded-lg border flex items-center justify-between relative z-0" style={{boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)'}}>
        <span className="font-medium text-sm">
          Prateleira {shelf.shelf_row}
        </span>
        {addingShelf === shelf.shelf_row ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newShelfCode}
              onChange={e => setNewShelfCode(e.target.value)}
              className="border px-2 py-1 rounded text-xs w-24"
              placeholder="Código inicial"
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter") handleAddNewShelf();
                if (e.key === "Escape") {
                  setAddingShelf(null);
                  setNewShelfCode("");
                  setNewShelfLast(false);
                  setNewShelfEndCode("");
                }
              }}
            />
            <label className="text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={newShelfLast}
                onChange={e => setNewShelfLast(e.target.checked)}
                className="text-xs"
              />
              Última
            </label>
            {newShelfLast && (
              <input
                type="text"
                value={newShelfEndCode}
                onChange={e => setNewShelfEndCode(e.target.value)}
                className="border px-2 py-1 rounded text-xs w-24"
                placeholder="Código final"
                onKeyDown={e => {
                  if (e.key === "Enter") handleAddNewShelf();
                  if (e.key === "Escape") {
                    setAddingShelf(null);
                    setNewShelfCode("");
                    setNewShelfLast(false);
                    setNewShelfEndCode("");
                  }
                }}
              />
            )}
            <Button
              size="sm"
              onClick={handleAddNewShelf}
              disabled={loading || !newShelfCode || (newShelfLast && !newShelfEndCode)}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAddingShelf(null);
                setNewShelfCode("");
                setNewShelfLast(false);
                setNewShelfEndCode("");
              }}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAddingShelf(shelf.shelf_row)}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Se não tem código inicial, mostra interface para adicionar
  if (!shelf.book_code_start) {
    return (
      <div className="mb-2 p-3 bg-white bg-opacity-95 rounded-lg border flex items-center justify-between relative z-0" style={{boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)'}}>
        <span className="font-medium text-sm">
          Prateleira {shelf.shelf_row}
        </span>
        {addingShelf === shelf.id ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newShelfCode}
              onChange={e => setNewShelfCode(e.target.value)}
              className="border px-2 py-1 rounded text-xs w-24"
              placeholder="Código inicial"
              autoFocus
              onKeyDown={e => handleKeyDown(e, handleAddShelfConfig)}
            />
            <label className="text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={newShelfLast}
                onChange={e => setNewShelfLast(e.target.checked)}
                className="text-xs"
              />
              Última
            </label>
            {newShelfLast && (
              <input
                type="text"
                value={newShelfEndCode}
                onChange={e => setNewShelfEndCode(e.target.value)}
                className="border px-2 py-1 rounded text-xs w-24"
                placeholder="Código final"
                onKeyDown={e => handleKeyDown(e, handleAddShelfConfig)}
              />
            )}
            <Button
              size="sm"
              onClick={handleAddShelfConfig}
              disabled={loading || !newShelfCode || (newShelfLast && !newShelfEndCode)}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelAdd}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAddingShelf(shelf.id)}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Se já tem código inicial, mostra interface de edição completa com animação slide
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={shelf.id || shelf.shelf_row}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="mb-2 p-3 bg-white bg-opacity-95 rounded-lg border relative z-0"
        style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">
            Prateleira {shelf.shelf_row}
          </span>
          <div className="flex items-center gap-4">
            {/* Código Inicial */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600">Início:</span>
              {editingShelf?.shelfId === shelf.id && editingShelf.field === 'start' ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="h-6 w-24 text-xs"
                    placeholder="Ex: FIS-01.01"
                    autoFocus
                    onKeyDown={(e) => handleKeyDown(e, handleSaveEdit)}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                    {shelf.book_code_start || 'Auto'}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit('start')}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {/* Código Final */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Fim:</span>
              {editingShelf?.shelfId === shelf.id && editingShelf.field === 'end' ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="h-6 w-24 text-xs"
                    placeholder="Ex: FIS-01.05"
                    autoFocus
                    onKeyDown={(e) => handleKeyDown(e, handleSaveEdit)}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {shelf.calculated_book_code_end || shelf.book_code_end || 'Auto'}
                  </span>
                  {shelf.is_last_shelf && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit('end')}
                      disabled={loading}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            {/* Toggle Última Prateleira */}
            <div className="flex items-center gap-2">
              <label className="text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={shelf.is_last_shelf}
                  onChange={handleToggleLastShelf}
                  disabled={loading}
                  className="text-xs"
                />
                Última
              </label>
              {shelf.is_last_shelf && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                  🔚
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VirtualBookshelfAdminEditor;
