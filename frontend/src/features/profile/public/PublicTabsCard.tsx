import { GraduationCap, BookMarked, Globe, Briefcase } from "lucide-react";
import { TabsCard } from "@/lib/TabsCard";
import { User } from "@/types/user";
import { accentColor } from "@/constants/styles";
import { AdvancedCyclesTab } from "@/features/profile/public/tabs/AdvancedCyclesTab";
import { DisciplinesTab } from "@/features/profile/public/tabs/DisciplinesTab";
import { InternationalTab } from "@/features/profile/public/tabs/InternationalTab";
import { PostCMTab } from "@/features/profile/public/tabs/PostCMTab";

interface PublicTabsCardProps {
  user: User;
  profile: any; // Substitua por um tipo mais específico se possível
  isEditing: boolean;
  initialTabId?: string;
}

export function PublicTabsCard({ user, profile, isEditing, initialTabId = "ativos" }: PublicTabsCardProps) {
  
  const tabs = [
    { id: "avancado" as const, label: "Ciclo Avançado", shortlabel: "Avançado", icon: GraduationCap },
    { id: "disciplinas" as const, label: "Disciplinas Cursadas", shortlabel: "Disciplinas", icon: BookMarked },
    { id: "internacional" as const, label: "Internacional", icon: Globe },
    { id: "pos-cm" as const, label: "Pós-CM", icon: Briefcase },
  ];

  const tabColor = accentColor(user.profile_image);

  return (
    <TabsCard
      tabs={tabs}
      initialTabId={initialTabId}
      getTabColor={() => tabColor}
    >
    
    <AdvancedCyclesTab
      ciclosAvancados={profile.ciclosAvancados}
      isEditing={isEditing}
      onAdd={profile.addAvancado}
      onSave={profile.saveAvancado}
      onRemove={profile.removeAvancado}
      onUpdate={profile.updateAvancado}
    />

    <DisciplinesTab
      disciplinas={profile.disciplinas}
      ciclosAvancados={profile.ciclosAvancados}
      isEditing={isEditing}
      onAdd={profile.addDisciplina}
      onSave={profile.saveDisciplina}
      onRemove={profile.removeDisciplina}
      onUpdate={profile.updateDisciplina}
    />

    <InternationalTab
      experiencias={profile.experienciasInternacionais}
      isEditing={isEditing}
      onAdd={profile.addInternacional}
      onSave={profile.saveInternacional}
      onRemove={profile.removeInternacional}
      onUpdate={profile.updateInternacional}
    />

    <PostCMTab
      posCM={profile.posCm}
      isEditing={isEditing}
      onAdd={profile.addPosCm}
      onSave={profile.savePosCm}
      onRemove={profile.removePosCm}
      onUpdate={profile.updatePosCm}
    />

    </TabsCard>
  );
}
