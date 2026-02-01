import React from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";

interface MobileBookFiltersDrawerProps {
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
 * Drawer mobile para filtros de livros
 * Mesma estética do MobileFiltersDrawer de disciplinas
 */
export const MobileBookFiltersDrawer: React.FC<MobileBookFiltersDrawerProps> = ({
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
  const hasActiveFilters =
    status.length > 0 ||
    area.length > 0 ||
    language.length > 0;

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

  const activeFiltersCount = status.length + area.length + language.length;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="mb-4 w-full md:hidden rounded-2xl">
          Filtrar
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4">Filtros</h3>

          <div className="space-y-4">
            {/* Status */}
            {availableStatus.length > 0 && (
              <div>
                <div className="font-semibold mb-2">Status</div>
                <div className="flex flex-col gap-2">
                  {availableStatus.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={status.includes(s)}
                        onCheckedChange={() =>
                          handleCheckboxChange(s, status, setStatus)
                        }
                        className="h-4 w-4 border-gray-400"
                      />
                      <span className="text-gray-700 capitalize">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Área */}
            {availableAreas.length > 0 && (
              <div>
                <div className="font-semibold mb-2">Área</div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {availableAreas.map((a) => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={area.includes(a)}
                        onCheckedChange={() =>
                          handleCheckboxChange(a, area, setArea)
                        }
                        className="h-4 w-4 border-gray-400"
                      />
                      <span className="text-gray-700">{a}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Idioma */}
            {availableLanguages.length > 0 && (
              <div>
                <div className="font-semibold mb-2">Idioma</div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {availableLanguages.map((l) => (
                    <label key={l} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={language.includes(l)}
                        onCheckedChange={() =>
                          handleCheckboxChange(l, language, setLanguage)
                        }
                        className="h-4 w-4 border-gray-400"
                      />
                      <span className="text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2 pt-4 border-t">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={onClear}
                  className="flex-1 rounded-2xl text-sm flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle size={16} />
                  Limpar filtros
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="default" className="flex-1 rounded-2xl">
                  Aplicar
                </Button>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileBookFiltersDrawer;
