import React from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";

interface MobileFiltersDrawerProps {
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
 * Drawer mobile para filtros de disciplinas
 */
export const MobileFiltersDrawer: React.FC<MobileFiltersDrawerProps> = (props) => {
  const {
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
  } = props;

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
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="mb-4 w-full md:hidden rounded-2xl">
          Filtrar
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {campus.length + unidade.length + (hasClasses ? 1 : 0) + (isPostgrad ? 1 : 0)}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4">Filtros</h3>

          <div className="space-y-4">
            {/* Campus */}
            {availableCampi.length > 0 && (
              <div>
                <div className="font-semibold mb-2">Campus</div>
                <div className="flex flex-col gap-2">
                  {availableCampi.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
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
                <div className="font-semibold mb-2">Unidade</div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {availableUnidades.map((u) => (
                    <label key={u} className="flex items-center gap-2 cursor-pointer">
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
              <div className="font-semibold mb-2">Disponibilidade</div>
              <label className="flex items-center gap-2 cursor-pointer">
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

            {/* Pós-graduação */}
            <div>
              <div className="font-semibold mb-2">Tipo</div>
              <label className="flex items-center gap-2 cursor-pointer">
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

            {/* Botão limpar */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  onClear();
                }}
                className="rounded-2xl text-sm flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 w-full justify-center"
              >
                <XCircle size={16} />
                Limpar filtros
              </Button>
            )}
          </div>

          <DrawerClose asChild>
            <Button variant="secondary" className="mt-6 w-full rounded-2xl">
              Fechar
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
