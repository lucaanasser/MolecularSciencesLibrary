import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Pencil, Copy, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  /** Quando false, esconde renomear/duplicar/excluir (ex.: convidado não logado). */
  allowManage?: boolean;
}

const BRAND = '#01aad0'; // academic-blue
const TAB_BORDER = `4px solid ${BRAND}`;

/**
 * Abas de planos no mesmo padrão das "abas pasta" do site (Ajude a Biblioteca / @/lib/TabsCard):
 * abas de largura igual (flex-1), aba ativa preenchida com a cor da marca (texto branco)
 * e conectada ao card da grade por uma linha grossa contínua de 4px na base; inativas em cinza.
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
  disabled = false,
  allowManage = true,
}: PlanTabsProps) {
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingScheduleName !== null && inputRef.current) {
      const schedule = schedules.find(s => s.id === editingScheduleName);
      setNewName(schedule?.name || '');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editingScheduleName, schedules]);

  const handleSaveName = () => {
    if (editingScheduleName !== null && newName.trim()) {
      onRenameSchedule(editingScheduleName, newName.trim());
    }
    setEditingScheduleName(null);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('button')) return;
    handleSaveName();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    else if (e.key === 'Escape') setEditingScheduleName(null);
  };

  return (
    <div className="flex flex-row rounded-t-2xl overflow-x-auto">
      <AnimatePresence mode="popLayout" initial={false}>
        {schedules.map((schedule) => {
          const isActive = schedule.id === activeScheduleId;
          const isEditing = editingScheduleName === schedule.id;

          return (
            <motion.div
              key={schedule.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="group relative flex-1 min-w-[6rem]"
            >
              {isEditing ? (
                <div
                  className="flex items-center justify-center gap-1 rounded-t-2xl px-3 py-3"
                  style={{ backgroundColor: BRAND, borderBottom: TAB_BORDER }}
                >
                  <Input
                    ref={inputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="h-7 w-full max-w-[10rem] text-sm px-2 rounded-lg bg-white"
                  />
                  <button onClick={handleSaveName} className="p-1 rounded hover:bg-white/20 flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => setEditingScheduleName(null)} className="p-1 rounded hover:bg-white/20 flex-shrink-0">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onSelectSchedule(schedule.id)}
                    disabled={disabled}
                    className="w-full rounded-t-2xl flex items-center justify-center gap-2 px-4 py-3 transition-transform duration-200"
                    style={{
                      color: isActive ? '#ffffff' : '#6b7280',
                      backgroundColor: isActive ? BRAND : undefined,
                      borderBottom: TAB_BORDER,
                    }}
                  >
                    <span className="text-md font-semibold truncate max-w-[12rem]">
                      {schedule.name}
                    </span>
                  </button>

                  {/* Menu de opções (oculto para convidados) */}
                  {allowManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity",
                            isActive
                              ? "opacity-90 text-white hover:bg-white/20"
                              : "opacity-0 group-hover:opacity-100 text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                          )}
                          disabled={disabled}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setEditingScheduleName(schedule.id)} className="cursor-pointer">
                          <Pencil className="w-4 h-4 mr-2" /> Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicateSchedule(schedule.id)} className="cursor-pointer">
                          <Copy className="w-4 h-4 mr-2" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteSchedule(schedule.id)}
                          className="cursor-pointer text-red-600 dark:text-red-400"
                          disabled={schedules.length <= 1}
                        >
                          <X className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Novo plano */}
      <button
        onClick={onCreateSchedule}
        disabled={disabled}
        className="flex-shrink-0 flex items-center justify-center gap-1.5 px-5 py-3 rounded-t-2xl text-gray-400 hover:text-academic-blue hover:bg-academic-blue/5 transition-colors disabled:opacity-50"
        style={{ borderBottom: TAB_BORDER }}
        title="Criar novo plano"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-semibold">Novo plano</span>
      </button>
    </div>
  );
}

export default PlanTabs;
