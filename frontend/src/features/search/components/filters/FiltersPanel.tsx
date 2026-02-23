/**
 * Painel principal de filtros (decide automaticamente entre sidebar ou drawer).
 *
 * Props:
 * - groups: Grupos de filtros (veja FilterGroup e FilterConfig).
 * - onFilterChange: Callback ao alterar qualquer filtro.
 * - loading (opcional): Exibe estado de carregamento.
 */

import { FiltersList, FiltersDrawer, FiltersPanelProps } from ".";
import { useIsMobile } from "@/hooks/useMobile";

export default function FiltersPanel(props: FiltersPanelProps) {
  
  const isMobile = useIsMobile();

  // Mobile (drawer)
  if (isMobile) {
    return (
      <FiltersDrawer title={"Filtros"} props={props} />
    );
  }

  // Desktop (sidebar)
  return (
    <aside className="w-[220px] p-4 mr-6">
      <h4>Filtros</h4>
      <FiltersList {...props} />
    </aside>
  );
}