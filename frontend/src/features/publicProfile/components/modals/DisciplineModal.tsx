import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DisciplinaAvancado } from "@/types/publicProfile";

interface DisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DisciplinaAvancado>) => Promise<void>;
  initialData?: Partial<DisciplinaAvancado>;
  mode: "create" | "edit";
}

export const DisciplineModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: DisciplineModalProps) => {
  const [formData, setFormData] = useState<Partial<DisciplinaAvancado>>({
    codigo: "",
    nome: "",
    professor: "",
    ano: new Date().getFullYear(),
    semestre: 1,
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          codigo: "",
          nome: "",
          professor: "",
          ano: new Date().getFullYear(),
          semestre: 1,
        });
      }
      setErrors({});
      setErrorMessage("");
    }
  }, [isOpen, initialData, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.codigo?.trim()) newErrors.codigo = true;
    if (!formData.nome?.trim()) newErrors.nome = true;
    if (!formData.ano || formData.ano < 2000 || formData.ano > 2100) newErrors.ano = true;
    if (!formData.semestre || ![1, 2].includes(formData.semestre)) newErrors.semestre = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setErrorMessage(""); // Clear error message when validation fails
      return;
    }

    setSaving(true);
    setErrorMessage("");
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar disciplina:", error);
      setErrorMessage("Erro ao salvar. Por favor, tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bebas text-gray-900">
            {mode === "create" ? "Nova Disciplina" : "Editar Disciplina"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}
          <div className="space-y-4">
            {/* Código */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: MAT0234"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className={errors.codigo ? "border-red-500" : ""}
              />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
            </div>

            {/* Nome */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Nome da Disciplina <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Cálculo Diferencial e Integral I"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
            </div>

            {/* Professor */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Professor</Label>
              <Input
                placeholder="Nome do professor (opcional)"
                value={formData.professor || ""}
                onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
              />
            </div>

            {/* Ano e Semestre */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Ano <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 2024"
                  value={formData.ano || ""}
                  onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) || 0 })}
                  className={errors.ano ? "border-red-500" : ""}
                  min={2000}
                  max={2100}
                />
                {errors.ano && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Semestre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.semestre ? String(formData.semestre) : ""}
                  onValueChange={(v) => setFormData({ ...formData, semestre: parseInt(v) as 1 | 2 })}
                >
                  <SelectTrigger className={errors.semestre ? "border-red-500" : ""}>
                    <SelectValue placeholder="Semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Semestre</SelectItem>
                    <SelectItem value="2">2º Semestre</SelectItem>
                  </SelectContent>
                </Select>
                {errors.semestre && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button onClick={onClose} variant="default" disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-academic-blue hover:bg-academic-blue/90">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
