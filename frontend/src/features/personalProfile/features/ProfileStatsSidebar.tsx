import { TrendingUp, BookMarked, Gift } from "lucide-react";

export interface ProfileStatsSidebarProps {
  userStats: {
    totalLoans: number;
    currentLoans: number;
    donations: number;
  };
}

const StatCard = ({ icon: Icon, value, label, shortLabel, bgColor, textColor, iconBg }: { 
  icon: any; 
  value: number; 
  label: string; 
  shortLabel: string;
  bgColor: string;
  textColor: string;
  iconBg: string;
}) => (
  <div className={`${bgColor} rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col items-center md:items-start justify-center">
        <p className={`prose-md mb-0 font-bold ${textColor}`}>{value}</p>
        <p className={`prose-sm mb-0 ${textColor} md:hidden`}>
          {shortLabel}
        </p>
        <p className={`prose-sm mb-0 ${textColor} hidden md:block`}>
          {label}
        </p>
      </div>
    </div>
  </div>
);

export function ProfileStatsSidebar({ userStats }: ProfileStatsSidebarProps) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
        
        <StatCard 
          icon={TrendingUp} 
          value={userStats.currentLoans} 
          label="Empréstimos ativos" 
          shortLabel="Ativos"
          bgColor="bg-cm-red/20" 
          textColor="text-cm-red" 
          iconBg="bg-cm-red" />

        <StatCard 
          icon={BookMarked} 
          value={userStats.totalLoans} 
          label="Empréstimos totais" 
          shortLabel="Passados"
          bgColor="bg-cm-blue/20" 
          textColor="text-cm-blue" 
          iconBg="bg-cm-blue" />
        
        <StatCard 
          icon={Gift} 
          value={userStats.donations} 
          label="Doações feitas" 
          shortLabel="Doações"
          bgColor="bg-cm-green/20" 
          textColor="text-cm-green" 
          iconBg="bg-cm-green" />
      
      </div>
    </aside>
  );
}
