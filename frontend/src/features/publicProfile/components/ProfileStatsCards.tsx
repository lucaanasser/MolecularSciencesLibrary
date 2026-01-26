import { Heart, Smile, Sparkles, Calendar } from "lucide-react";


interface ProfileStatsCardsProps {
  turma: string;
  cursoOrigem: string;
  areaInteresse: string;
}

export const ProfileStatsCards = ({
  turma,
  cursoOrigem,
  areaInteresse,
}: ProfileStatsCardsProps) => {
  const stats = [
    {
      value: turma,
      label: "Turma",
      icon: Calendar,
      bgColor: "bg-cm-blue/20",
      iconBg: "bg-cm-blue/50",
      iconColor: "text-white",
      textColor: "text-cm-blue",
    },
    {
      value: cursoOrigem,
      label: "Curso de origem",
      icon: Heart,
      bgColor: "bg-cm-red/20",
      iconBg: "bg-cm-red/50",
      iconColor: "text-white",
      textColor: "text-cm-red",
    },
    {
      value: areaInteresse,
      label: "Área de interesse",
      icon: Sparkles,
      bgColor: "bg-cm-green/20",
      iconBg: "bg-cm-green/50",
      iconColor: "text-white",
      textColor: "text-cm-green",
    },
  ];

  return (
    <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:sticky lg:top-24">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-4 shadow-md text-center lg:text-left`}
          >
            <div className="flex flex-col lg:flex-row items-center lg:gap-3">
              <div className={`w-10 h-10 rounded-full ${stat.iconBg} flex items-center justify-center mb-2 lg:mb-0`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-lg font-bold ${stat.textColor} truncate`}>{stat.value}</p>
                <p className={`text-sm ${stat.textColor} hidden md:block`}>{stat.label}</p>
                <p className={`text-xs ${stat.textColor} md:hidden`}>{stat.label.split(' ')[0]}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
