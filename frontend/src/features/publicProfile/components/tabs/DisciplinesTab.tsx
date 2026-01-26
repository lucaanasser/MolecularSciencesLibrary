import { Plus, Trash2, BookMarked, User, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DisciplinaAvancado, AdvancedCycleInfo } from "@/types/publicProfile";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DisciplineModal } from "../modals";

interface DisciplinesTabProps {
  disciplinas: DisciplinaAvancado[];
  ciclosAvancados: (AdvancedCycleInfo & { cor?: string })[];
  isEditing: boolean;
  onAdd: () => string; // Returns temp ID
  onSave: (data: Partial<DisciplinaAvancado>) => Promise<any>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof DisciplinaAvancado, value: any) => void;
}

const BADGE_COLORS = [
  "bg-cm-purple/10 text-cm-purple border-cm-purple/20",
  "bg-cm-blue/10 text-cm-blue border-cm-blue/20",
  "bg-cm-green/10 text-cm-green border-cm-green/20",
  "bg-cm-orange/10 text-cm-orange border-cm-orange/20",
];

export const DisciplinesTab = ({
  disciplinas,
  ciclosAvancados,
  isEditing,
  onAdd,
  onSave,
  onRemove,
  onUpdate,
}: DisciplinesTabProps) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    data?: Partial<DisciplinaAvancado>;
  }>({ isOpen: false, mode: "create" });

  const handleAddClick = () => {
    setModalState({ isOpen: true, mode: "create" });
  };

  const handleEditClick = (discipline: DisciplinaAvancado) => {
    setModalState({ isOpen: true, mode: "edit", data: discipline });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: "create", data: undefined });
  };

  const handleModalSave = async (data: Partial<DisciplinaAvancado>) => {
    // Both create and edit use the same save function
    // For edit, we pass the ID in the data
    if (modalState.mode === "edit" && modalState.data?.id) {
      await onSave({ ...data, id: modalState.data.id });
    } else {
      await onSave(data);
    }
    // Modal will close itself after save
  };

  // Agrupar por ano e semestre
  const groupedDisciplinas = disciplinas.reduce((acc, disc) => {
    const key = disc.ano && disc.semestre ? `${disc.ano}.${disc.semestre}` : "Sem semestre";
    if (!acc[key]) acc[key] = [];
    acc[key].push(disc);
    return acc;
  }, {} as Record<string, DisciplinaAvancado[]>);

  // Ordenar por ano e semestre decrescente
  const sortedSemesters = Object.keys(groupedDisciplinas)
    .sort((a, b) => {
      if (a === "Sem semestre") return 1;
      if (b === "Sem semestre") return -1;
      const [aAno, aSem] = a.split(".").map(Number);
      const [bAno, bSem] = b.split(".").map(Number);
      if (aAno !== bAno) return bAno - aAno;
      return bSem - aSem;
    });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-cm-academic rounded-full" />
          <h2 className="text-2xl font-bebas text-gray-900">Disciplinas Cursadas</h2>
          <span className="text-sm text-gray-500">({disciplinas.length} disciplinas)</span>
        </div>
        {isEditing && (
          <Button onClick={handleAddClick} className="rounded-full bg-cm-academic hover:bg-cm-academic/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Disciplina
          </Button>
        )}
      </div>

      {disciplinas.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <BookMarked className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma disciplina adicionada.</p>
          {isEditing && (
            <Button onClick={handleAddClick} variant="outline" className="mt-6 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeira disciplina
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedSemesters.map((semester) => (
            <div 
              key={semester}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Header do Semestre */}
              <div className="bg-cm-purple/5 px-6 py-4 border-b-2 border-gray-200 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cm-purple" />
                <h3 className="text-xl font-bold text-gray-900">{semester}</h3>
                <span className="ml-auto text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full">
                  {groupedDisciplinas[semester].length} {groupedDisciplinas[semester].length === 1 ? 'disciplina' : 'disciplinas'}
                </span>
              </div>

              {/* Grade de Disciplinas */}
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                {groupedDisciplinas[semester].map((disc) => {
                  const avancadoIndex = ciclosAvancados.findIndex((a) => a.id === disc.avancadoId);
                  return (
                    <div 
                      key={disc.id} 
                      className={cn(
                        "p-4 rounded-xl border-l-4 bg-white shadow-sm hover:shadow-md transition-all relative group",
                        !disc.avancadoId && "border-l-gray-300",
                        disc.avancadoId && avancadoIndex === 0 && "border-l-cm-purple",
                        disc.avancadoId && avancadoIndex === 1 && "border-l-cm-blue",
                        disc.avancadoId && avancadoIndex === 2 && "border-l-cm-green",
                        disc.avancadoId && avancadoIndex >= 3 && "border-l-cm-orange"
                      )}
                    >
                      {isEditing && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(disc)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemove(disc.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-cm-purple bg-cm-purple/10 px-2 py-1 rounded">
                          {disc.codigo}
                        </span>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {disc.ano}.{disc.semestre}
                        </span>
                        {disc.avancadoId && (
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] border", BADGE_COLORS[avancadoIndex % BADGE_COLORS.length])}
                          >
                            Av. {avancadoIndex + 1}
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-2">
                        {disc.nome}
                      </h4>
                      {disc.professor && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{disc.professor}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <DisciplineModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
};
