import React from "react";
import { XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface DisciplineFiltersPanelProps {
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

/**
 * Painel de filtros laterais para busca de disciplinas
 * Inspirado no design da biblioteca
 */
export const DisciplineFiltersPanel: React.FC<DisciplineFiltersPanelProps> = ({
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
  const hasActiveFilters =
    campus.length > 0 ||
    unidade.length > 0 ||
    hasClasses !== null ||
    isPostgrad !== null;

  const handleCheckboxChange = (
    value: string,
    current: string[],
    setter: (v: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  return (
    <aside className="w-40 min-w-[100px] max-w-xs p-4 mr-6 h-fit sticky top-4 self-start hidden md:block">
      <div className="space-y-4">
        {/* Campus */}
        {availableCampi.length > 0 && (
          <div>
            <div className="font-semibold mb-1 text-sm">Campus</div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableCampi.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={campus.includes(c)}
                    onCheckedChange={() =>
                      handleCheckboxChange(c, campus, setCampus)
                    }
                    className="h-4 w-4 border-gray-400"
                  />
                  <span className="text-gray-700">{c}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Unidade */}
        {availableUnidades.length > 0 && (
          <div>
            <div className="font-semibold mb-1 text-sm">Unidade</div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableUnidades.map((u) => (
                <label key={u} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={unidade.includes(u)}
                    onCheckedChange={() =>
                      handleCheckboxChange(u, unidade, setUnidade)
                    }
                    className="h-4 w-4 border-gray-400"
                  />
                  <span className="text-gray-700">{u}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tem turmas válidas */}
        <div>
          <div className="font-semibold mb-1 text-sm">Disponibilidade</div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={hasClasses === true}
                onCheckedChange={(checked) =>
                  setHasClasses(checked ? true : null)
                }
                className="h-4 w-4 border-gray-400"
              />
              <span className="text-gray-700">Tem turmas válidas</span>
            </label>
          </div>
        </div>

        {/* Pós-graduação */}
        <div>
          <div className="font-semibold mb-1 text-sm">Tipo</div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={isPostgrad === true}
                onCheckedChange={(checked) =>
                  setIsPostgrad(checked ? true : null)
                }
                className="h-4 w-4 border-gray-400"
              />
              <span className="text-gray-700">Pós-graduação</span>
            </label>
          </div>
        </div>

        {/* Botão limpar */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClear}
            className="rounded-2xl text-sm flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 w-full justify-center"
          >
            <XCircle size={16} />
            Limpar
          </Button>
        )}
      </div>
    </aside>
  );
};
