import { Plus, Trash2, Globe, MapPin, Building2, Calendar, Clock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InternationalExperience } from "@/types/publicProfile";
import { useState } from "react";
import { InternationalExperienceModal } from "../modals";

interface InternationalTabProps {
  experiencias: InternationalExperience[];
  isEditing: boolean;
  onAdd: () => string; // Returns temp ID
  onSave: (data: Partial<InternationalExperience>) => Promise<any>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof InternationalExperience, value: any) => void;
}

const EXPERIENCE_TYPES = [
  { value: "intercambio", label: "Intercâmbio acadêmico", color: "bg-blue-500" },
  { value: "estagio", label: "Estágio", color: "bg-green-500" },
  { value: "pesquisa", label: "Pesquisa", color: "bg-purple-500" },
  { value: "curso", label: "Curso/Workshop", color: "bg-orange-500" },
  { value: "outro", label: "Outro", color: "bg-gray-500" },
];

export const InternationalTab = ({
  experiencias,
  isEditing,
  onAdd,
  onSave,
  onRemove,
  onUpdate,
}: InternationalTabProps) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    data?: Partial<InternationalExperience>;
  }>({ isOpen: false, mode: "create" });

  const handleAddClick = () => {
    setModalState({ isOpen: true, mode: "create" });
  };

  const handleEditClick = (experience: InternationalExperience) => {
    setModalState({ isOpen: true, mode: "edit", data: experience });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: "create", data: undefined });
  };

  const handleModalSave = async (data: Partial<InternationalExperience>) => {
    // Both create and edit use the same save function
    // For edit, we pass the ID in the data
    if (modalState.mode === "edit" && modalState.data?.id) {
      await onSave({ ...data, id: modalState.data.id });
    } else {
      await onSave(data);
    }
    // Modal will close itself after save
  };

  const getTypeConfig = (tipo: string) => {
    return EXPERIENCE_TYPES.find((t) => t.value === tipo) || EXPERIENCE_TYPES[4];
  };

  const formatDuration = (numero?: number, unidade?: string) => {
    if (!numero || !unidade) return null;
    return `${numero} ${unidade}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-cm-blue rounded-full" />
          <h2 className="text-2xl font-bebas text-gray-900">Experiências Internacionais</h2>
        </div>
        {isEditing && (
          <Button onClick={handleAddClick} className="rounded-full bg-cm-blue hover:bg-cm-blue/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Experiência
          </Button>
        )}
      </div>

      {experiencias.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Globe className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma experiência internacional adicionada.</p>
          {isEditing && (
            <Button onClick={handleAddClick} variant="outline" className="mt-6 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeira experiência
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {experiencias.map((exp) => {
            const typeConfig = getTypeConfig(exp.tipo);
            return (
              <div 
                key={exp.id} 
                className="relative p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                {isEditing && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEditClick(exp)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemove(exp.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {typeConfig.label}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {exp.instituicao}
                      </h3>
                      {exp.programa && (
                        <p className="text-sm text-cm-blue font-medium">{exp.programa}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cm-orange" />
                      {exp.pais}
                    </span>
                    {exp.orientador && (
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cm-blue" />
                        {exp.orientador}
                      </span>
                    )}
                    {formatDuration(exp.duracaoNumero, exp.duracaoUnidade) && (
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-library-purple" />
                        {formatDuration(exp.duracaoNumero, exp.duracaoUnidade)}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cm-green" />
                      {exp.anoInicio} – {exp.anoFim || "em andamento"}
                    </span>
                  </div>

                  {exp.descricao && (
                    <p className="text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      {exp.descricao}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <InternationalExperienceModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
};
