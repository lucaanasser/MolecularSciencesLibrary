import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabId = "sobre" | "avancados" | "disciplinas" | "internacional" | "pos-cm";

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const getTabColor = (tabId: TabId) => {
  switch (tabId) {
    case "avancados": return "cm-red";
    case "disciplinas": return "cm-blue";
    case "internacional": return "cm-green";
    case "pos-cm": return "cm-orange";
    default: return "library-purple";
  }
};

export const ProfileTabs = ({ tabs, activeTab, onTabChange }: ProfileTabsProps) => {
  return (
    <div className="flex flex-row bg-white rounded-t-2xl overflow-hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const color = getTabColor(tab.id);
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 rounded-t-2xl flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm sm:text-base transition-colors",
              isActive
                ? `text-white border-b-4 border-${color} bg-${color}`
                : `text-gray-500 border-b-4 border-${color} hover:text-${color} bg-white`
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
