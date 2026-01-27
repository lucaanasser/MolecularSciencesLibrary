import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Pencil, Copy, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Schedule } from '@/services/UserSchedulesService';

interface PlanTabsProps {
  schedules: Schedule[];
  activeScheduleId: number | null;
  editingScheduleName: number | null;
  onSelectSchedule: (id: number) => void;
  onCreateSchedule: () => void;
  onRenameSchedule: (id: number, name: string) => void;
  onDeleteSchedule: (id: number) => void;
  onDuplicateSchedule: (id: number) => void;
  setEditingScheduleName: (id: number | null) => void;
  disabled?: boolean;
}

/**
 * Componente de abas para alternar entre planos
 * Permite criar, renomear, duplicar e deletar planos
 */
export function PlanTabs({
  schedules,
  activeScheduleId,
  editingScheduleName,
  onSelectSchedule,
  onCreateSchedule,
  onRenameSchedule,
  onDeleteSchedule,
  onDuplicateSchedule,
  setEditingScheduleName,
  disabled = false
}: PlanTabsProps) {
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca no input quando começa a editar
  useEffect(() => {
    if (editingScheduleName !== null && inputRef.current) {
      const schedule = schedules.find(s => s.id === editingScheduleName);
      setNewName(schedule?.name || '');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editingScheduleName, schedules]);

  // Salva o nome ao pressionar Enter ou clicar fora
  const handleSaveName = () => {
    if (editingScheduleName !== null && newName.trim()) {
      console.log(`🔵 [PlanTabs] Renomeando plano ${editingScheduleName} para: ${newName.trim()}`);
      onRenameSchedule(editingScheduleName, newName.trim());
    }
    setEditingScheduleName(null);
  };

  // Evita que o blur interfira com o click
  const handleBlur = (e: React.FocusEvent) => {
    // Se o click foi em um botão dentro do container, não salva no blur
    if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('button')) {
      return;
    }
    handleSaveName();
  };

  // Cancela edição ao pressionar Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditingScheduleName(null);
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      <AnimatePresence mode="popLayout">
        {schedules.map((schedule) => (
          <motion.div
            key={schedule.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex-shrink-0"
          >
            {editingScheduleName === schedule.id ? (
              /* Modo de edição */
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border border-academic-blue">
                <Input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="h-6 w-28 text-sm px-2"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Check className="w-3.5 h-3.5 text-green-600" />
                </button>
                <button
                  onClick={() => setEditingScheduleName(null)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ) : (
              /* Modo de visualização */
              <div
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-all",
                  schedule.id === activeScheduleId
                    ? "bg-academic-blue text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <button
                  onClick={() => onSelectSchedule(schedule.id)}
                  className="text-sm font-medium max-w-32 truncate"
                  disabled={disabled}
                >
                  {schedule.name}
                </button>
                
                {/* Menu de opções */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "p-0.5 rounded transition-colors",
                        schedule.id === activeScheduleId
                          ? "hover:bg-white/20"
                          : "hover:bg-gray-300 dark:hover:bg-gray-600"
                      )}
                      disabled={disabled}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem 
                      onClick={() => setEditingScheduleName(schedule.id)}
                      className="cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Renomear
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDuplicateSchedule(schedule.id)}
                      className="cursor-pointer"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteSchedule(schedule.id)}
                      className="cursor-pointer text-red-600 dark:text-red-400"
                      disabled={schedules.length <= 1}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Botão de novo plano */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCreateSchedule}
        disabled={disabled}
        className="flex-shrink-0 h-8 px-2"
      >
        <Plus className="w-4 h-4 mr-1" />
        Novo Plano
      </Button>
    </div>
  );
}

export default PlanTabs;
