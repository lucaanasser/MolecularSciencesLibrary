/**
 * Lista de grupos de filtros.
 *
 * Props:
 * - groups: Grupos de filtros (veja FilterGroup e FilterConfig).
 * - onFilterChange: Callback ao alterar qualquer filtro.
 * - loading (opcional): Exibe estado de carregamento.
 */

import { FiltersPanelProps } from ".";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function FiltersList(props: Omit<FiltersPanelProps, "drawerOpen" | "setDrawerOpen">) {
  
  const { 
    filterGroups, 
    handleCheckboxChange,
    handleInputChange, 
    handleClearAll, 
    getOptions 
  } = props;

  const hasActiveFilters = filterGroups.some((group) =>
    group.type === "checkbox"
      ? group.selected.length > 0
      : group.type === "input"
      ? !!group.value
      : false
  );

  return (
    <div className={`space-y-4`}>
      
      {filterGroups.map((group) => {
        const options = getOptions(group);
        return (
          <div key={group.key}>

          {/* Renderização dos grupos de filtro tipo checkbox */}
          {group.type === "checkbox" && options && options.length > 0 && (
            <>
              <div className="font-semibold mb-2">{group.label}</div>
              <div className="flex flex-col">
                {options.map((opt) => (
                  <Label 
                    key={opt}
                    className="flex items-start gap-2 my-0 cursor-pointer"
                  >
                    <Checkbox
                      checked={group.selected.includes(opt)}
                      onCheckedChange={() => handleCheckboxChange(group.key, opt)}
                      className="h-4 w-4 rounded-sm mt-1.5"
                    />
                    <span className="leading-snug">{opt}</span>
                  </Label>
                ))}
              </div>
            </>
          )}

          {/* Renderização dos grupos de filtro tipo input */}
          {group.type === "input" && (
            <Input
              value={group.value}
              onChange={(e) => handleInputChange(group.key, e.target.value)}
              placeholder={group.placeholder || ""}
              className="max-w-xs"
            />
          )}
        </div>
      )})}

      {/* Botão para limpar todos os filtros */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="xs" 
          onClick={handleClearAll}
        >
          Limpar filtros
        </Button>
      )}
      
    </div>
  );
}