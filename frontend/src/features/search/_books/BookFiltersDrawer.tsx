import React from "react";
import { FiltersDrawer } from "@/features/search/filters/FiltersDrawer";
import { FilterGroup } from "@/features/search/filters/Filter";

export interface BookFiltersDrawerProps {
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
 * Drawer mobile para filtros de livros, usando estrutura genérica FiltersDrawer
 */
export const BookFiltersDrawer: React.FC<BookFiltersDrawerProps> = ({
  status,
  setStatus,
  area,
  setArea,
  language,
  setLanguage,
  availableStatus,
  availableAreas,
  availableLanguages,
  onClear,
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
    <FiltersDrawer
      title="Filtros"
      groups={groups}
      onClear={onClear}
      triggerLabel="Filtrar"
    />
  );
};

export default BookFiltersDrawer;
