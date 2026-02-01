import React from "react";
import { XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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
 * Painel de filtros laterais para busca de livros
 * Mesma estética do DisciplineFiltersPanel
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

  return (
    <aside className="w-40 min-w-[100px] max-w-xs p-4 mr-6 h-fit sticky top-4 self-start hidden md:block">
      <div className="space-y-4">
        {/* Status */}
        {availableStatus.length > 0 && (
          <div>
            <div className="font-semibold mb-1 text-sm">Status</div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableStatus.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
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
            <div className="font-semibold mb-1 text-sm">Área</div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableAreas.map((a) => (
                <label key={a} className="flex items-center gap-2 cursor-pointer text-sm">
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
            <div className="font-semibold mb-1 text-sm">Idioma</div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableLanguages.map((l) => (
                <label key={l} className="flex items-center gap-2 cursor-pointer text-sm">
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

export default BookFiltersPanel;
