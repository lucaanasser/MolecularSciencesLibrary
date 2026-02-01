import React from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface MobileUserFiltersDrawerProps {
  turmas: string[];
  setTurmas: (value: string[]) => void;
  tags: string[];
  setTags: (value: string[]) => void;
  cursos: string[];
  setCursos: (value: string[]) => void;
  disciplinaFilter: string;
  setDisciplinaFilter: (value: string) => void;
  availableTurmas: string[];
  availableTags: string[];
  availableCursos: string[];
  onClear: () => void;
}

/**
 * Drawer mobile para filtros de usuários
 */
export const MobileUserFiltersDrawer: React.FC<MobileUserFiltersDrawerProps> = ({
  turmas,
  setTurmas,
  tags,
  setTags,
  cursos,
  setCursos,
  disciplinaFilter,
  setDisciplinaFilter,
  availableTurmas,
  availableTags,
  availableCursos,
  onClear,
}) => {
  const totalFilters = turmas.length + tags.length + cursos.length + (disciplinaFilter ? 1 : 0);
  const hasActiveFilters = totalFilters > 0;

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
              {totalFilters}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4">Filtros</h3>

          <div className="space-y-4">
            {/* Busca por disciplina */}
            <div>
              <div className="font-semibold mb-2">Disciplina</div>
              <Input
                type="text"
                placeholder="Ex: MAC0110"
                value={disciplinaFilter}
                onChange={(e) => setDisciplinaFilter(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Buscar quem cursou
              </p>
            </div>

            {/* Turmas */}
            {availableTurmas.length > 0 && (
              <div>
                <div className="font-semibold mb-2">Turma</div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {availableTurmas.map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={turmas.includes(t)}
                        onCheckedChange={() =>
                          handleCheckboxChange(t, turmas, setTurmas)
                        }
                        className="h-4 w-4 border-gray-400"
                      />
                      <span className="text-gray-700">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Curso de origem */}
            {availableCursos.length > 0 && (
              <div>
                <div className="font-semibold mb-2">Curso</div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {availableCursos.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={cursos.includes(c)}
                        onCheckedChange={() =>
                          handleCheckboxChange(c, cursos, setCursos)
                        }
                        className="h-4 w-4 border-gray-400"
                      />
                      <span className="text-gray-700">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tags (áreas de interesse) */}
            {availableTags.length > 0 && (
              <div>
                <div className="font-semibold mb-2">Área de Interesse</div>
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <label key={tag} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox
                        checked={tags.includes(tag)}
                        onCheckedChange={() =>
                          handleCheckboxChange(tag, tags, setTags)
                        }
                        className="h-4 w-4 border-gray-400"
                      />
                      <span className="text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Botão limpar */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  onClear();
                }}
                className="rounded-2xl w-full flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle size={16} />
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Botão fechar */}
          <DrawerClose asChild>
            <Button variant="secondary" className="w-full mt-4 rounded-2xl">
              Aplicar filtros
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
