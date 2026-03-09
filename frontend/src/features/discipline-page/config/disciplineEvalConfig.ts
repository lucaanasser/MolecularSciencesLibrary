import { TrendingUp, BarChart3, Users, Lightbulb, Target, Award } from "lucide-react";
import type { RatingCriterio } from "@/features/rating";

export const DISC_INITIAL_RATINGS = {
  geral: null as number | null,
  dificuldade: null as number | null,
  carga_trabalho: null as number | null,
  professores: null as number | null,
  clareza: null as number | null,
  utilidade: null as number | null,
  organizacao: null as number | null,
};

export const DISC_CRITERIOS_FORM = [
  { key: "geral", label: "Avaliação Geral" },
  { key: "dificuldade", label: "Dificuldade" },
  { key: "carga_trabalho", label: "Carga de Trabalho" },
  { key: "professores", label: "Professores" },
  { key: "clareza", label: "Clareza" },
  { key: "utilidade", label: "Utilidade" },
  { key: "organizacao", label: "Organização" },
];

export const DISC_CRITERIOS_CARD: RatingCriterio[] = [
  { key: "dificuldade", label: "Dificuldade", icon: TrendingUp, color: "cm-red" },
  { key: "carga_trabalho", label: "Carga de Trabalho", icon: BarChart3, color: "cm-orange" },
  { key: "professores", label: "Professores", icon: Users, color: "cm-blue" },
  { key: "clareza", label: "Clareza", icon: Lightbulb, color: "cm-yellow" },
  { key: "utilidade", label: "Utilidade", icon: Target, color: "cm-green" },
  { key: "organizacao", label: "Organização", icon: Award, color: "library-purple" },
];
