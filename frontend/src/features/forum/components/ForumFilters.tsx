import React from "react";
import { Clock, TrendingUp, MessageSquare, CheckCircle, Filter } from "lucide-react";

export type SortOption = "recente" | "votos" | "atividade" | "sem-resposta";

interface ForumFiltersProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  questionCount: number;
}

const ForumFilters: React.FC<ForumFiltersProps> = ({
  currentSort,
  onSortChange,
  questionCount,
}) => {
  const filters: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    {
      value: "recente",
      label: "Recente",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      value: "votos",
      label: "Mais Votadas",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      value: "atividade",
      label: "Atividade",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      value: "sem-resposta",
      label: "Sem Resposta",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">
            Todas as Perguntas
          </h2>
          <div className="text-sm text-gray-600">
            {questionCount.toLocaleString()} perguntas
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onSortChange(filter.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all whitespace-nowrap
                ${
                  currentSort === filter.value
                    ? "bg-cm-academic text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumFilters;
