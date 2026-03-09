import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import StarRating from "./StarRating";

export interface Criterio {
  key: string;
  label: string;
}

interface EvaluationFormProps {
  criterios: Criterio[];
  formRatings: Record<string, number | null>;
  formComentario: string;
  formIsAnonymous: boolean;
  isEditMode: boolean;
  isSubmitting: boolean;
  accentColor?: string;
  placeholder?: string;
  onRatingChange: (key: string, value: number) => void;
  onComentarioChange: (text: string) => void;
  onAnonymousChange: (val: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  criterios,
  formRatings,
  formComentario,
  formIsAnonymous,
  isEditMode,
  isSubmitting,
  accentColor = "library-purple",
  placeholder = "Compartilhe sua opinião...",
  onRatingChange,
  onComentarioChange,
  onAnonymousChange,
  onSubmit,
  onCancel,
}) => {
  const otherCrits = criterios.filter((c) => c.key !== "geral");

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`p-4 sm:p-6 bg-${accentColor}/5 rounded-xl border border-${accentColor}/20`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {isEditMode ? "Editar Avaliação" : "Sua Avaliação"}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Avalie com estrelas (anônimo) e/ou deixe um comentário
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-white rounded-lg border border-gray-200 sm:col-span-2">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Avaliação Geral</Label>
          <StarRating
            rating={formRatings.geral ?? null}
            size="lg"
            interactive
            onChange={(v) => onRatingChange("geral", v)}
          />
        </div>
        {otherCrits.map((criterio) => (
          <div key={criterio.key} className="p-3 bg-white rounded-lg border border-gray-200">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{criterio.label}</Label>
            <StarRating
              rating={formRatings[criterio.key] ?? null}
              size="md"
              interactive
              onChange={(v) => onRatingChange(criterio.key, v)}
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Comentário (opcional)
        </Label>
        <Textarea
          value={formComentario}
          onChange={(e) => onComentarioChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="resize-none"
        />
      </div>

      {formComentario.trim() && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <Switch
            id="anonymous"
            checked={formIsAnonymous}
            onCheckedChange={onAnonymousChange}
          />
          <Label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
            Publicar comentário como anônimo
          </Label>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`bg-${accentColor} hover:bg-${accentColor}/90`}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditMode ? "Salvar Alterações" : "Publicar Avaliação"}
        </Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </div>
    </motion.div>
  );
};
