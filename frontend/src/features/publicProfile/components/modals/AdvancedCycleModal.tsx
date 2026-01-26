import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdvancedCycleInfo, ProfileTag, SUGGESTED_TAGS } from "@/types/publicProfile";
import { Badge } from "@/components/ui/badge";

interface AdvancedCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AdvancedCycleInfo>) => Promise<void>;
  initialData?: Partial<AdvancedCycleInfo>;
  mode: "create" | "edit";
}

export const AdvancedCycleModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: AdvancedCycleModalProps) => {
  const [formData, setFormData] = useState<Partial<AdvancedCycleInfo>>({
    tema: "",
    orientador: "",
    coorientadores: [],
    descricao: "",
    instituto: "",
    universidade: "",
    semestres: 4,
    anoInicio: undefined,
    anoConclusao: undefined,
    disciplinas: [],
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tagInput, setTagInput] = useState({ area: "", subarea: "" });
  const [coorientadorInput, setCoorientadorInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          tema: "",
          orientador: "",
          coorientadores: [],
          descricao: "",
          instituto: "",
          universidade: "",
          semestres: 4,
          anoInicio: undefined,
          anoConclusao: undefined,
          disciplinas: [],
          tags: [],
        });
      }
      setErrors({});
      setErrorMessage("");
    }
  }, [isOpen, initialData, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.tema?.trim()) newErrors.tema = true;
    if (!formData.orientador?.trim()) newErrors.orientador = true;
    if (!formData.semestres || formData.semestres < 1) newErrors.semestres = true;
    
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
      console.error("Erro ao salvar ciclo avançado:", error);
      setErrorMessage("Erro ao salvar. Por favor, tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const addTag = (label: string, category: "area" | "subarea") => {
    const tags = formData.tags || [];
    const areaTags = tags.filter((t) => t.category === "area");
    const subareaTags = tags.filter((t) => t.category === "subarea");

    if (category === "area" && areaTags.length >= 2) {
      alert("Máximo de 2 tags de área");
      return;
    }
    if (category === "subarea" && subareaTags.length >= 3) {
      alert("Máximo de 3 tags de subárea");
      return;
    }

    const newTag: ProfileTag = {
      id: `temp-${Date.now()}`,
      label,
      category,
    };

    setFormData({ ...formData, tags: [...tags, newTag] });
    setTagInput({ ...tagInput, [category]: "" });
  };

  const removeTag = (tagId: string) => {
    const tags = (formData.tags || []).filter((t) => t.id !== tagId);
    setFormData({ ...formData, tags });
  };

  const addCoorientador = (nome: string) => {
    if (!nome.trim()) return;
    const coorientadores = formData.coorientadores || [];
    setFormData({ ...formData, coorientadores: [...coorientadores, nome] });
    setCoorientadorInput("");
  };

  const removeCoorientador = (index: number) => {
    const coorientadores = [...(formData.coorientadores || [])];
    coorientadores.splice(index, 1);
    setFormData({ ...formData, coorientadores });
  };

  if (!isOpen) return null;

  const areaTags = (formData.tags || []).filter((t) => t.category === "area");
  const subareaTags = (formData.tags || []).filter((t) => t.category === "subarea");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bebas text-gray-900">
            {mode === "create" ? "Novo Ciclo Avançado" : "Editar Ciclo Avançado"}
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
          <div className="space-y-4">\n            {/* Tema */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Tema <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Aprendizado de Máquina Aplicado à Saúde"
                value={formData.tema}
                onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                className={errors.tema ? "border-red-500" : ""}
              />
              {errors.tema && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
            </div>

            {/* Orientador */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Orientador <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nome do orientador"
                value={formData.orientador}
                onChange={(e) => setFormData({ ...formData, orientador: e.target.value })}
                className={errors.orientador ? "border-red-500" : ""}
              />
              {errors.orientador && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
            </div>

            {/* Coorientadores */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Coorientadores</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do coorientador"
                  value={coorientadorInput}
                  onChange={(e) => setCoorientadorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCoorientador(coorientadorInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addCoorientador(coorientadorInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.coorientadores && formData.coorientadores.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.coorientadores.map((coorientador, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {coorientador}
                      <button
                        onClick={() => removeCoorientador(idx)}
                        className="ml-1 text-gray-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Instituto e Universidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Instituto</Label>
                <Input
                  placeholder="Ex: IME"
                  value={formData.instituto || ""}
                  onChange={(e) => setFormData({ ...formData, instituto: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Universidade</Label>
                <Input
                  placeholder="Ex: USP"
                  value={formData.universidade || ""}
                  onChange={(e) => setFormData({ ...formData, universidade: e.target.value })}
                />
              </div>
            </div>

            {/* Semestres, Ano Início e Conclusão */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Semestres <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="4"
                  value={formData.semestres}
                  onChange={(e) => setFormData({ ...formData, semestres: parseInt(e.target.value) || 0 })}
                  className={errors.semestres ? "border-red-500" : ""}
                  min={1}
                />
                {errors.semestres && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Ano Início</Label>
                <Input
                  type="number"
                  placeholder="2023"
                  value={formData.anoInicio || ""}
                  onChange={(e) => setFormData({ ...formData, anoInicio: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Ano Conclusão</Label>
                <Input
                  type="number"
                  placeholder="2025"
                  value={formData.anoConclusao || ""}
                  onChange={(e) => setFormData({ ...formData, anoConclusao: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Descrição</Label>
              <Textarea
                placeholder="Descreva seu ciclo avançado..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={4}
              />
            </div>

            {/* Tags de Área */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Tags de Área (máx. 2)
              </Label>
              <div className="flex gap-2 mb-2">
                <Select
                  value={tagInput.area}
                  onValueChange={(v) => setTagInput({ ...tagInput, area: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUGGESTED_TAGS.area.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => {
                    if (tagInput.area) addTag(tagInput.area, "area");
                  }}
                  variant="outline"
                  size="sm"
                  disabled={areaTags.length >= 2}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {areaTags.map((tag) => (
                  <Badge key={tag.id} className="bg-purple-500 text-white flex items-center gap-1">
                    {tag.label}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:text-red-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags de Subárea */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Tags de Subárea (máx. 3)
              </Label>
              <div className="flex gap-2 mb-2">
                <Select
                  value={tagInput.subarea}
                  onValueChange={(v) => setTagInput({ ...tagInput, subarea: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione uma subárea" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUGGESTED_TAGS.subarea.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => {
                    if (tagInput.subarea) addTag(tagInput.subarea, "subarea");
                  }}
                  variant="outline"
                  size="sm"
                  disabled={subareaTags.length >= 3}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {subareaTags.map((tag) => (
                  <Badge key={tag.id} className="bg-blue-500 text-white flex items-center gap-1">
                    {tag.label}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:text-red-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-cm-blue hover:bg-cm-blue/90">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
