
import { Heart, Sparkles, Calendar } from "lucide-react";
import { StatsSidebar } from "@/features/profile/StatsSidebar";

export const PublicStats = ({ userStats }) => {
  const stats = [
    {
      value: userStats.turma,
      label: "Turma",
      shortLabel: "Turma",
      icon: Calendar,
      bgColor: "bg-cm-blue/20",
      textColor: "text-cm-blue",
      iconBg: "bg-cm-blue",
    },
    {
      value: userStats.cursoOrigem,
      label: "Curso de origem",
      shortLabel: "Curso",
      icon: Heart,
      bgColor: "bg-cm-red/20",
      textColor: "text-cm-red",
      iconBg: "bg-cm-red",
    },
    {
      value: userStats.areaInteresse,
      label: "Área de interesse",
      shortLabel: "Área",
      icon: Sparkles,
      bgColor: "bg-cm-green/20",
      textColor: "text-cm-green",
      iconBg: "bg-cm-green",
    },
  ];

  return (
    <StatsSidebar stats={stats} />
  );
};
 