import React from "react";
import { XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserFiltersPanelProps {
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
 * Painel de filtros laterais para busca de usuários
 * Inspirado no design da biblioteca e disciplinas
 */
export const UserFiltersPanel: React.FC<UserFiltersPanelProps> = ({
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
  const hasActiveFilters = 
    turmas.length > 0 || 
    tags.length > 0 || 
    cursos.length > 0 || 
    disciplinaFilter.length > 0;

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
    <aside className="w-48 min-w-[150px] max-w-xs p-4 mr-6 h-fit sticky top-20 self-start hidden md:block">
      <div className="space-y-4">
        {/* Busca por disciplina */}
        <div>
          <div className="font-semibold mb-1 text-sm">Disciplina</div>
          <Input
            type="text"
            placeholder="Ex: MAC0110"
            value={disciplinaFilter}
            onChange={(e) => setDisciplinaFilter(e.target.value)}
            className="text-sm h-8"
          />
          <p className="text-xs text-gray-500 mt-1">
            Buscar quem cursou
          </p>
        </div>

        {/* Turmas */}
        {availableTurmas.length > 0 && (
          <div>
            <div className="font-semibold mb-1 text-sm">Turma</div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableTurmas.map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
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
            <div className="font-semibold mb-1 text-sm">Curso</div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableCursos.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
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
            <div className="font-semibold mb-1 text-sm">Área de Interesse</div>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {availableTags.slice(0, 20).map((tag) => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer text-xs">
                  <Checkbox
                    checked={tags.includes(tag)}
                    onCheckedChange={() =>
                      handleCheckboxChange(tag, tags, setTags)
                    }
                    className="h-3.5 w-3.5 border-gray-400"
                  />
                  <span className="text-gray-700">{tag}</span>
                </label>
              ))}
              {availableTags.length > 20 && (
                <p className="text-xs text-gray-500 mt-1">
                  +{availableTags.length - 20} tags
                </p>
              )}
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
