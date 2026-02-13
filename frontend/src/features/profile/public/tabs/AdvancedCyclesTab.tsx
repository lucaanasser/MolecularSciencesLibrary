import { Plus, Trash2, Award, Calendar, Clock, Building2, Users, Tag, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedCycleInfo } from "@/types/publicProfile";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { AdvancedCycleModal } from "../../../publicProfile/components/modals";

interface AdvancedCyclesTabProps {
  ciclosAvancados: (AdvancedCycleInfo & { cor?: string })[];
  isEditing: boolean;
  onAdd: () => string; // Returns temp ID
  onSave: (data: Partial<AdvancedCycleInfo>) => Promise<any>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof AdvancedCycleInfo | "cor", value: any) => void;
}

const CYCLE_COLORS = [
  { bg: "bg-gradient-to-br from-purple-50 to-purple-100", border: "border-purple-500", accent: "text-purple-600", badge: "bg-purple-500" },
  { bg: "bg-gradient-to-br from-blue-50 to-blue-100", border: "border-blue-500", accent: "text-blue-600", badge: "bg-blue-500" },
  { bg: "bg-gradient-to-br from-green-50 to-green-100", border: "border-green-500", accent: "text-green-600", badge: "bg-green-500" },
  { bg: "bg-gradient-to-br from-orange-50 to-orange-100", border: "border-orange-500", accent: "text-orange-600", badge: "bg-orange-500" },
];

export const AdvancedCyclesTab = ({
  ciclosAvancados,
  isEditing,
  onAdd,
  onSave,
  onRemove,
  onUpdate,
}: AdvancedCyclesTabProps) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    data?: Partial<AdvancedCycleInfo>;
  }>({ isOpen: false, mode: "create" });

  const handleAddClick = () => {
    setModalState({ isOpen: true, mode: "create" });
  };

  const handleEditClick = (cycle: AdvancedCycleInfo) => {
    setModalState({ isOpen: true, mode: "edit", data: cycle });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: "create", data: undefined });
  };

  const handleModalSave = async (data: Partial<AdvancedCycleInfo>) => {
    await onSave(data);
    // Modal will close itself after save
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-cm-blue rounded-full" />
          <h2 className="text-2xl font-bebas text-gray-900">Ciclos Avançados</h2>
        </div>
        {isEditing && (
          <Button onClick={handleAddClick} className="rounded-full bg-cm-blue hover:bg-cm-blue/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Avançado
          </Button>
        )}
      </div>

      {ciclosAvancados.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhum ciclo avançado adicionado.</p>
          {isEditing && (
            <Button onClick={handleAddClick} variant="default" className="mt-6 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeiro avançado
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {ciclosAvancados.map((av, idx) => {
            const colorScheme = CYCLE_COLORS[idx % CYCLE_COLORS.length];
            const tags = av.tags || [];
            const areaTags = tags.filter((t) => t.category === "area");
            const subareaTags = tags.filter((t) => t.category === "subarea");
            
            return (
              <div 
                key={av.id} 
                className={`relative ${colorScheme.bg} rounded-2xl border-2 ${colorScheme.border} shadow-lg overflow-hidden`}
              >
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b-2 border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className={`w-6 h-6 ${colorScheme.accent}`} />
                    <Badge className={`${colorScheme.badge} text-white`}>Avançado {idx + 1}</Badge>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(av)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemove(av.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">{av.tema || "Sem título"}</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {av.orientador && (
                        <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                          <Award className="w-5 h-5 text-library-purple mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Orientador</p>
                            <p className="text-sm font-semibold text-gray-900">{av.orientador}</p>
                          </div>
                        </div>
                      )}
                      {av.instituto && (
                        <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                          <Building2 className="w-5 h-5 text-cm-blue mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Instituto</p>
                            <p className="text-sm font-semibold text-gray-900">{av.instituto}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {av.universidade && (
                      <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                        <Building2 className="w-5 h-5 text-cm-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Universidade</p>
                          <p className="text-sm font-semibold text-gray-900">{av.universidade}</p>
                        </div>
                      </div>
                    )}

                    {av.coorientadores && av.coorientadores.length > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                        <Users className="w-5 h-5 text-cm-green mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 mb-1">Coorientadores</p>
                          <div className="flex flex-wrap gap-2">
                            {av.coorientadores.map((co, coIdx) => (
                              <Badge key={coIdx} className="text-xs">
                                {co}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm">
                      {av.semestres && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full">
                          <Clock className="w-4 h-4 text-cm-blue" />
                          {av.semestres} semestres
                        </span>
                      )}
                      {(av.anoInicio || av.anoConclusao) && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full">
                          <Calendar className="w-4 h-4 text-cm-green" />
                          {av.anoInicio || "?"} – {av.anoConclusao || "em andamento"}
                        </span>
                      )}
                    </div>

                    {tags.length > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                        <Tag className="w-5 h-5 text-cm-orange mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {areaTags.map((tag) => (
                              <Badge key={tag.id} >
                                {tag.label}
                              </Badge>
                            ))}
                            {subareaTags.map((tag) => (
                              <Badge key={tag.id} variant="default">
                                {tag.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {av.descricao && (
                      <div className="p-4 bg-white/70 rounded-lg">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {av.descricao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdvancedCycleModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
};
