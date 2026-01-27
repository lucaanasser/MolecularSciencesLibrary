import React, { useState } from "react";
import { Gift, BookOpen, History } from "lucide-react";

export type TabType = "ativos" | "historico" | "doacoes";

export interface ProfileTabsCardProps {
  tabs?: { id: TabType; label: string; shortLabel: string; icon: React.ElementType }[];
  initialTab?: TabType;
  getTabColor: () => string;
  children: React.ReactNode[];
}

const defaultTabs = [
  { id: "ativos", label: "Empréstimos Ativos", shortLabel: "Ativos", icon: BookOpen },
  { id: "historico", label: "Empréstimos Passados", shortLabel: "Histórico", icon: History },
  { id: "doacoes", label: "Minhas Doações", shortLabel: "Doações", icon: Gift },
];

export const ProfileTabsCard: React.FC<ProfileTabsCardProps> = ({
  tabs = defaultTabs,
  initialTab = "ativos",
  getTabColor,
  children,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  return (
    <div className={`rounded-2xl border-b border-${getTabColor()} bg-white shadow-lg p-0 flex flex-col`}>
      {/* Botões no topo */}
      <div className={`flex flex-row bg-white rounded-t-2xl overflow-hidden`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const color = ["ativos", "historico", "doacoes"].includes(tab.id) ? getTabColor() : "library-purple";
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-t-2xl flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm sm:text-base transition-colors
                ${isActive
                  ? `text-white border-b-4 border-${color} bg-${color} `
                  : `text-gray-500 border-b-4 border-${color} hover:text-${color} bg-white`
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{isActive ? tab.shortLabel : ""}</span>
            </button>
          );
        })}
      </div>
      {/* Conteúdo do card */}
      <div className="p-4 sm:p-6">
        {children[ tabs.findIndex(t => t.id === activeTab) ]}
      </div>
    </div>
  );
};
