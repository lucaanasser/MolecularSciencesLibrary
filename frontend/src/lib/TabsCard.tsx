import React, { useState, ReactNode, useRef, useEffect } from "react";

export interface TabDefinition {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: React.ElementType;
  badge?: (isActive: boolean) => React.ReactNode;
}

export interface TabsCardProps {
  tabs: TabDefinition[];
  getTabColor?: (tabId: string, idx: number) => string;
  children: ReactNode[];
  className?: string;
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export const TabsCard: React.FC<TabsCardProps> = ({
  tabs,
  getTabColor = () => `var(--primary-color)`,
  children,
  className = "",
  activeTab: externalActiveTab,
  onTabChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(tabs[0].id);
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = (id: string) => {
    setInternalActiveTab(id);
    onTabChange?.(id);
  };
  const contentRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setFade(true);
    const timeout = setTimeout(() => setFade(false), 120);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  return (
    <div
      className={`p-0 flex flex-col w-full justify-center h-full ${className}`}
      style={{ width: '100%' }}
    >
      <div className="flex flex-row rounded-t-2xl overflow-y-auto">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const color = getTabColor(tab.id, idx);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-t-2xl flex items-center justify-center gap-2 px-4 py-3 transition-transform duration-200`}
              style={{ 
                zIndex: isActive ? 1 : 0, 
                color: isActive ? "white" : "#6b7280", 
                backgroundColor: isActive ? getTabColor(tab.id, idx) : undefined, 
                borderBottom: `4px solid ${getTabColor(tab.id, idx)}`,
              }}
            >
              {Icon && (
                <span
                  className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'} `}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon />
                </span>
              )}
              {/* Em telas grandes, sempre mostra a label. Em telas pequenas, só mostra a label da aba ativa (ou shortLabel se existir) */}
              <span className="hidden sm:inline text-md font-semibold">
                {tab.label}
              </span>
              <span className="sm:hidden text-sm font-semibold">
                {isActive ? (tab.shortLabel || tab.label) : ''}
              </span>
              {tab.badge?.(isActive)}
            </button>
          );
        })}
      </div>
      <div
        className="bg-white rounded-b-2xl shadow-lg p-6 md:p-10 flex-1 tabs-content-transition"
        style={{overflow: 'auto', maxHeight: '65vh'}}
      >
        <div
          className={`card-fade${fade ? ' card-fade-active' : ''}`}
          ref={contentRef}
        >
          {children[tabs.findIndex(t => t.id === activeTab)]}
        </div>
      </div>
    </div>
  );
};
