import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilterGroup } from "@/components/filters/Filter";

interface FilterRendererProps {
  groups: FilterGroup[];
  onCheckboxChange?: (
    value: string,
    current: string[],
    setter: (v: string[]) => void
  ) => void;
  className?: string;
  showClearButton?: boolean;
  onClearAll?: () => void;
}

/**
 * Renderiza os grupos de filtros (checkboxes) de forma reutilizável
 */
export const FilterPanel: React.FC<FilterRendererProps> = ({
  groups,
  className = "min-w-[100px] max-w-xs p-4 mr-6 sticky top-60",
  showClearButton = true,
  onClearAll,
}) => {

  const handleCheckboxChange =
    ((value: string, current: string[], setter: (v: string[]) => void) => {
      if (current.includes(value)) {
        setter(current.filter((v) => v !== value));
      } else {
        setter([...current, value]);
      }
    });

  const hasActiveFilters = groups.some((g) => g.selected.length > 0);
  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      groups.forEach((group) => {
        group.setSelected([]);
      });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {groups.map((group) =>
        group.options.length > 0 ? (
          <div key={group.key}>
            <div className="font-semibold mb-2">{group.label}</div>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {group.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={group.selected.includes(opt.value)}
                    onCheckedChange={() =>
                      handleCheckboxChange(opt.value, group.selected, group.setSelected)
                    }
                    className="h-4 w-4 rounded-sm"
                  />
                  <div className="prose-xs capitalize truncate" title={opt.label}>
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : null
      )}
      {/* Botão de limpar filtros */}
      {showClearButton && hasActiveFilters && (
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
};
