import { TrendingUp, BookMarked, Gift } from "lucide-react";
import { StatsSidebar } from "@/features/profile/StatsSidebar";

export function PrivateStats({ userStats }) {
  const stats = [
    {
      icon: TrendingUp,
      value: userStats.currentLoans,
      label: "Empréstimos ativos",
      shortLabel: "Ativos",
      bgColor: "bg-cm-red/20",
      textColor: "text-cm-red",
      iconBg: "bg-cm-red",
    },
    {
      icon: BookMarked,
      value: userStats.totalLoans,
      label: "Empréstimos totais",
      shortLabel: "Passados",
      bgColor: "bg-cm-blue/20",
      textColor: "text-cm-blue",
      iconBg: "bg-cm-blue",
    },
    {
      icon: Gift,
      value: userStats.donations,
      label: "Doações feitas",
      shortLabel: "Doações",
      bgColor: "bg-cm-green/20",
      textColor: "text-cm-green",
      iconBg: "bg-cm-green",
    }
  ]
  return (
    <StatsSidebar stats={stats} />
  );
}
