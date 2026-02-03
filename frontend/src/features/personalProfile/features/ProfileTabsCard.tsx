import { BookOpen, History, Gift } from "lucide-react";
import LoanList from "@/features/personalProfile/components/LoanList";
import { TabsCard } from "@/lib/TabsCard";
import { Donations } from "@/features/personalProfile/components/Donations";

interface ProfileTabsCardProps {
  userId: number;
  donations: Array<{ id: number; title: string; author: string; date: string; status: string }>;
  getTabColor: () => string;
  initialTabId?: string;
}

export function ProfileTabsCard({ userId, donations, getTabColor, initialTabId = "ativos" }: ProfileTabsCardProps) {
  const tabs = [
    { id: "ativos", label: "Empréstimos Ativos", shortLabel: "Ativos", icon: BookOpen },
    { id: "historico", label: "Empréstimos Passados", shortLabel: "Histórico", icon: History },
    { id: "doacoes", label: "Minhas Doações", shortLabel: "Doações", icon: Gift },
  ];

  return (
    <TabsCard
      tabs={tabs}
      initialTabId={initialTabId}
      getTabColor={getTabColor}
    >
      {/* Ativos */}
      <div>
        <LoanList 
          userId={userId} 
          color={getTabColor()} 
          showActive={true} />
      </div>
      
      {/* Histórico */}
      <div>
        <LoanList 
          userId={userId} 
          color={getTabColor()} 
          showActive={false} />
      </div>
      
      {/* Doações */}
      <div>
        <Donations donations={donations} />
      </div>

    </TabsCard>
  );
}
