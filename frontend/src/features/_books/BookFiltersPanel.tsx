import React from "react";
import FilterPanel, { FilterGroup } from "@/components/filters/Filter";

interface BookFiltersPanelProps {
  status: string[];
  setStatus: (value: string[]) => void;
  area: string[];
  setArea: (value: string[]) => void;
  language: string[];
  setLanguage: (value: string[]) => void;
  availableStatus: string[];
  availableAreas: string[];
  availableLanguages: string[];
  onClear: () => void;
}

/**
 * Painel de filtros para busca de livros, usando estrutura genérica FilterPanel
 */
export const BookFiltersPanel: React.FC<BookFiltersPanelProps> = ({
  status,
  setStatus,
  area,
  setArea,
  language,
  setLanguage,
  availableStatus,
  availableAreas,
  availableLanguages,
}) => {
  const groups: FilterGroup[] = [
    {
      key: "status",
      label: "Status",
      options: availableStatus.map((s) => ({ label: s, value: s })),
      selected: status,
      setSelected: setStatus,
    },
    {
      key: "area",
      label: "Área",
      options: availableAreas.map((a) => ({ label: a, value: a })),
      selected: area,
      setSelected: setArea,
    },
    {
      key: "language",
      label: "Idioma",
      options: availableLanguages.map((l) => ({ label: l, value: l })),
      selected: language,
      setSelected: setLanguage,
    },
  ];

  return (
    <aside>
      <FilterPanel groups={groups} />
    </aside>
  );
};

export default BookFiltersPanel;
