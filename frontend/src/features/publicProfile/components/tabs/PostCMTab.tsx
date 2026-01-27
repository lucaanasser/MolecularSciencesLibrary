import { GraduationCap, Briefcase, Building2, Calendar, Plus, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCMInfo } from "@/types/publicProfile";
import { useState } from "react";
import { PostCMModal } from "../modals";

interface PostCMTabProps {
  posCM: PostCMInfo[];
  isEditing: boolean;
  onAdd: () => string; // Returns temp ID
  onSave: (data: Partial<PostCMInfo>) => Promise<any>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof PostCMInfo, value: any) => void;
}

export const PostCMTab = ({ posCM, isEditing, onAdd, onSave, onRemove, onUpdate }: PostCMTabProps) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    data?: Partial<PostCMInfo>;
  }>({ isOpen: false, mode: "create" });

  const handleAddClick = () => {
    setModalState({ isOpen: true, mode: "create" });
  };

  const handleEditClick = (entry: PostCMInfo) => {
    setModalState({ isOpen: true, mode: "edit", data: entry });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: "create", data: undefined });
  };

  const handleModalSave = async (data: Partial<PostCMInfo>) => {
    // Both create and edit use the same save function
    // For edit, we pass the ID in the data
    if (modalState.mode === "edit" && modalState.data?.id) {
      await onSave({ ...data, id: modalState.data.id });
    } else {
      await onSave(data);
    }
    // Modal will close itself after save
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-cm-orange rounded-full" />
          <h2 className="text-2xl font-bebas text-gray-900">Pós-CM</h2>
        </div>
        {isEditing && (
          <Button onClick={handleAddClick} className="rounded-full bg-cm-orange hover:bg-cm-orange/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Pós-CM
          </Button>
        )}
      </div>

      {posCM.length === 0 && !isEditing && (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma informação pós-CM adicionada.</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Editar perfil" para adicionar.</p>
        </div>
      )}

      {posCM.length === 0 && isEditing && (
        <div className="py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma informação pós-CM adicionada.</p>
          <Button onClick={handleAddClick} variant="outline" className="mt-6 rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar primeira informação
          </Button>
        </div>
      )}

      {posCM.length > 0 && (
        <div className="space-y-6 max-w-3xl">
          {posCM.map((item) => (
            <div key={item.id} className="p-8 rounded-2xl bg-cm-orange/5 border border-cm-orange/20 relative group">
              {isEditing && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemove(item.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-cm-orange/10 flex items-center justify-center flex-shrink-0">
                  {item.tipo === "pos-graduacao" ? (
                    <GraduationCap className="w-8 h-8 text-cm-orange" />
                  ) : (
                    <Briefcase className="w-8 h-8 text-cm-orange" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-semibold text-gray-900">{item.cargo || "Sem cargo definido"}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    {item.instituicao && (
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cm-orange" />
                        {item.instituicao}
                      </span>
                    )}
                    {item.anoInicio && (
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cm-orange" />
                        {item.anoInicio} – {item.anoFim || "em andamento"}
                      </span>
                    )}
                  </div>
                  {item.orientador && item.tipo === "pos-graduacao" && (
                    <div className="mt-2 text-sm text-cm-orange">
                      <span className="font-medium">Orientador:</span> {item.orientador}
                    </div>
                  )}
                  {(item.areas && item.areas.length > 0) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.areas.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.descricao && (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-6 pt-6 border-t border-cm-orange/10">
                      {item.descricao}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PostCMModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
};
