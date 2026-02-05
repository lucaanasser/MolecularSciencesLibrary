import React from "react";
import { FilterPanel } from "@/features/search/filters/FilterPanel";
import FiltersDrawer from "@/features/search/filters/FiltersDrawer";

export interface FilterProps {
  groups: FilterGroup[];
  onClear?: () => void;
  triggerLabel?: string;
  title?: string;
  /**
   * Se true, renderiza o drawer (mobile). Se false, renderiza o painel (desktop).
   */
  useDrawer?: boolean;
  /**
   * Props extras para o painel/drawer
   */
  [key: string]: any;
}

interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  selected: string[];
  setSelected: (value: string[]) => void;
}

/**
 * Componente unificado de filtros: renderiza FilterPanel (desktop) ou FiltersDrawer (mobile)
 */
const Filter: React.FC<FilterProps> = ({
  groups,
  onClear,
  triggerLabel = "Filtrar",
  title = "Filtros",
  useDrawer = false,
  ...rest
}) => {
  if (useDrawer) {
    return (
      <FiltersDrawer
        groups={groups}
        title={title}
        {...rest}
      />
    );
  }
  return (
    <FilterPanel
      groups={groups}
      {...rest}
    />
  );
};

export default Filter;
