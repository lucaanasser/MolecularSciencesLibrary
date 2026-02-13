import { BookOpen, History, Gift } from "lucide-react";
import LoanList from "@/features/profile/private/LoanList";
import { TabsCard } from "@/lib/TabsCard";
import { Donations } from "@/features/profile/private/Donations";
import { User } from "@/types/user";
import { accentColor } from "@/constants/styles";

interface ProfileTabsCardProps {
  user: User;
  donations: Array<{ id: number; title: string; author: string; date: string; status: string }>;
  initialTabId?: string;
}

export function ProfileTabsCard({ user, donations, initialTabId = "ativos" }: ProfileTabsCardProps) {
  
  const tabs = [
    { id: "ativos", label: "Empréstimos Ativos", shortLabel: "Ativos", icon: BookOpen },
    { id: "historico", label: "Empréstimos Passados", shortLabel: "Histórico", icon: History },
    { id: "doacoes", label: "Minhas Doações", shortLabel: "Doações", icon: Gift },
  ];

  const tabColor = accentColor(user.profile_image);

  return (
    <TabsCard
      tabs={tabs}
      initialTabId={initialTabId}
      getTabColor={() => tabColor}
    >
      {/* Ativos */}
      <div>
        <LoanList 
          user={user}
          showActive={true} />
      </div>
      
      {/* Histórico */}
      <div>
        <LoanList 
          user={user}
          showActive={false} />
      </div>
      
      {/* Doações */}
      <div>
        <Donations donations={donations} />
      </div>

    </TabsCard>
  );
}
