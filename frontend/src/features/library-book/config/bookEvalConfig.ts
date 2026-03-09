import { Award, FileText, Target, CheckCircle } from "lucide-react";
import type { RatingCriterio } from "@/features/rating";

export const BOOK_INITIAL_RATINGS = {
  geral: null as number | null,
  qualidade: null as number | null,
  legibilidade: null as number | null,
  utilidade: null as number | null,
  precisao: null as number | null,
};

export const BOOK_CRITERIOS_FORM = [
  { key: "geral", label: "Avaliação Geral" },
  { key: "qualidade", label: "Qualidade do Conteúdo" },
  { key: "legibilidade", label: "Legibilidade" },
  { key: "utilidade", label: "Utilidade" },
  { key: "precisao", label: "Precisão" },
];

export const BOOK_CRITERIOS_CARD: RatingCriterio[] = [
  { key: "qualidade", label: "Qualidade do Conteúdo", icon: Award, color: "library-purple" },
  { key: "legibilidade", label: "Legibilidade", icon: FileText, color: "cm-blue" },
  { key: "utilidade", label: "Utilidade", icon: Target, color: "cm-green" },
  { key: "precisao", label: "Precisão", icon: CheckCircle, color: "cm-orange" },
];
