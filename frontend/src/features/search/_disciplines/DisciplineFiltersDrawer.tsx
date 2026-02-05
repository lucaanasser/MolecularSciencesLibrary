import React, { useMemo } from "react";
import { FiltersDrawer } from "@/features/search/filters/FiltersDrawer";

interface DisciplineFiltersDrawerProps {
  campus: string[];
  setCampus: (value: string[]) => void;
  unidade: string[];
  setUnidade: (value: string[]) => void;
  hasClasses: boolean | null;
  setHasClasses: (value: boolean | null) => void;
  isPostgrad: boolean | null;
  setIsPostgrad: (value: boolean | null) => void;
  availableCampi: string[];
  availableUnidades: string[];
  onClear: () => void;
}

export const DisciplineFiltersDrawer: React.FC<DisciplineFiltersDrawerProps> = ({
  campus,
  setCampus,
  unidade,
  setUnidade,
  hasClasses,
  setHasClasses,
  isPostgrad,
  setIsPostgrad,
  availableCampi,
  availableUnidades,
  onClear,
}) => {
  const groups = useMemo(() => [
    {
      key: "campus",
      label: "Campus",
      options: availableCampi.map((c) => ({ label: c, value: c })),
      selected: campus,
      setSelected: setCampus,
    },
    {
      key: "unidade",
      label: "Unidade",
      options: availableUnidades.map((u) => ({ label: u, value: u })),
      selected: unidade,
      setSelected: setUnidade,
    },
    {
      key: "hasClasses",
      label: "Disponibilidade",
      options: [{ label: "Tem turmas válidas", value: "true" }],
      selected: hasClasses === true ? ["true"] : [],
      setSelected: (vals: string[]) => setHasClasses(vals.includes("true") ? true : null),
    },
    {
      key: "isPostgrad",
      label: "Tipo",
      options: [{ label: "Pós-graduação", value: "true" }],
      selected: isPostgrad === true ? ["true"] : [],
      setSelected: (vals: string[]) => setIsPostgrad(vals.includes("true") ? true : null),
    },
  ], [campus, setCampus, unidade, setUnidade, hasClasses, setHasClasses, isPostgrad, setIsPostgrad, availableCampi, availableUnidades]);

  return (
    <FiltersDrawer
      groups={groups}
      showClearButton={true}
      onClearAll={onClear}
    />
  );
};
