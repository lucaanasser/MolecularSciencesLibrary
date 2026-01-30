import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
import { InternationalExperience } from "@/types/publicProfile";

interface InternationalExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<InternationalExperience>) => Promise<void>;
  initialData?: Partial<InternationalExperience>;
  mode: "create" | "edit";
}

const EXPERIENCE_TYPES = [
  { value: "intercambio", label: "Intercâmbio acadêmico" },
  { value: "estagio", label: "Estágio" },
  { value: "pesquisa", label: "Pesquisa" },
  { value: "curso", label: "Curso/Workshop" },
  { value: "outro", label: "Outro" },
];

const DURATION_UNITS = [
  { value: "dias", label: "Dias" },
  { value: "semanas", label: "Semanas" },
  { value: "meses", label: "Meses" },
  { value: "anos", label: "Anos" },
];

export const InternationalExperienceModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: InternationalExperienceModalProps) => {
  const [formData, setFormData] = useState<Partial<InternationalExperience>>({
    tipo: "intercambio",
    pais: "",
    instituicao: "",
    programa: "",
    orientador: "",
    descricao: "",
    anoInicio: new Date().getFullYear(),
    anoFim: undefined,
    duracaoNumero: undefined,
    duracaoUnidade: "meses",
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
          tipo: "intercambio",
          pais: "",
          instituicao: "",
          programa: "",
          orientador: "",
          descricao: "",
          anoInicio: new Date().getFullYear(),
          anoFim: undefined,
          duracaoNumero: undefined,
          duracaoUnidade: "meses",
        });
      }
      setErrors({});
      setErrorMessage("");
    }
  }, [isOpen, initialData, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.tipo) newErrors.tipo = true;
    if (!formData.pais?.trim()) newErrors.pais = true;
    if (!formData.instituicao?.trim()) newErrors.instituicao = true;
    if (!formData.anoInicio || formData.anoInicio < 1900 || formData.anoInicio > 2100) newErrors.anoInicio = true;
    
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
      console.error("Erro ao salvar experiência internacional:", error);
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
            {mode === "create" ? "Nova Experiência Internacional" : "Editar Experiência Internacional"}
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
            {/* Tipo */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Tipo de Experiência <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
              >
                <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
            </div>

            {/* País */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                País <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Estados Unidos"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                className={errors.pais ? "border-red-500" : ""}
              />
              {errors.pais && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
            </div>

            {/* Instituição */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Instituição <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Massachusetts Institute of Technology"
                value={formData.instituicao}
                onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                className={errors.instituicao ? "border-red-500" : ""}
              />
              {errors.instituicao && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
            </div>

            {/* Programa */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Programa</Label>
              <Input
                placeholder="Ex: Ciência sem Fronteiras, Erasmus+ (opcional)"
                value={formData.programa || ""}
                onChange={(e) => setFormData({ ...formData, programa: e.target.value })}
              />
            </div>

            {/* Orientador */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Orientador</Label>
              <Input
                placeholder="Nome do orientador (opcional)"
                value={formData.orientador || ""}
                onChange={(e) => setFormData({ ...formData, orientador: e.target.value })}
              />
            </div>

            {/* Anos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Ano de Início <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 2023"
                  value={formData.anoInicio || ""}
                  onChange={(e) => setFormData({ ...formData, anoInicio: parseInt(e.target.value) || new Date().getFullYear() })}
                  className={errors.anoInicio ? "border-red-500" : ""}
                />
                {errors.anoInicio && <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Ano de Fim</Label>
                <Input
                  type="number"
                  placeholder="Se vazio, em andamento"
                  value={formData.anoFim || ""}
                  onChange={(e) => setFormData({ ...formData, anoFim: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>

            {/* Duração */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Duração</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Quantidade"
                  value={formData.duracaoNumero || ""}
                  onChange={(e) => setFormData({ ...formData, duracaoNumero: parseInt(e.target.value) || undefined })}
                />
                <Select
                  value={formData.duracaoUnidade || ""}
                  onValueChange={(v) => setFormData({ ...formData, duracaoUnidade: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Descrição</Label>
              <Textarea
                placeholder="Descreva sua experiência internacional..."
                value={formData.descricao || ""}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button onClick={onClose} variant="default" disabled={saving}>
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
