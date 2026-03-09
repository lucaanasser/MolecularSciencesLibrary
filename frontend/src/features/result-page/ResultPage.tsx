import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { TabsCard, TabDefinition } from "@/lib/TabsCard";
import { RatingCard } from "@/features/rating";

interface ResultPageProps {
  icon: React.ReactNode;
  headerInfo: React.ReactNode;
  highlightColor: string;
  iconBgColor?: string;
  sidebar?: React.ReactNode;
  tabs: TabDefinition[];
  tabContents: React.ReactNode[];
  onBack?: () => void;
  ratingCardProps?: any;
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

const ResultPage: React.FC<ResultPageProps> = ({
  icon,
  headerInfo,
  highlightColor,
  iconBgColor,
  tabs,
  tabContents,
  onBack,
  ratingCardProps,
  sidebar,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="content-container">
      
      {/* Botão Voltar */}
      <Button variant="ghost" onClick={onBack}>
        <ChevronLeft className="mr-1" />
        Voltar
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 my-4 sm:my-6">
        <div className={`w-20 sm:w-24 aspect-square rounded-2xl flex items-center justify-center bg-${iconBgColor ?? highlightColor}`}>
          <div className="w-10 sm:w-12 aspect-square text-white">
            {icon}
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          {headerInfo}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full max-w-72 flex-shrink-0">
          {sidebar ?? (ratingCardProps && <RatingCard {...ratingCardProps} />)}
        </aside>

        {/* TabsCard como Card principal */}
        <div className="flex-1 min-w-0">
          <TabsCard
            tabs={tabs}
            getTabColor={() => highlightColor}
            activeTab={activeTab}
            onTabChange={onTabChange}
          >
            {tabContents}
          </TabsCard>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;