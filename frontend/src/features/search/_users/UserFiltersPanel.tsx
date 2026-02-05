import React, { useMemo } from "react";
import { FilterPanel } from "@/features/search/filters/FilterPanel";
import { Input } from "@/components/ui/input";

/**
 * Painel de filtros laterais para busca de usuários
 */

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
  const groups = useMemo(() => [
    {
      key: "turmas",
      label: "Turma",
      options: availableTurmas.map((t) => ({ label: t, value: t })),
      selected: turmas,
      setSelected: setTurmas,
    },
    {
      key: "cursos",
      label: "Curso",
      options: availableCursos.map((c) => ({ label: c, value: c })),
      selected: cursos,
      setSelected: setCursos,
    },
    {
      key: "tags",
      label: "Área de Interesse",
      options: availableTags.slice(0, 20).map((tag) => ({ label: tag, value: tag })),
      selected: tags,
      setSelected: setTags,
    },
  ], [turmas, setTurmas, cursos, setCursos, tags, setTags, availableTurmas, availableCursos, availableTags]);

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
        <FilterPanel
          groups={groups}
          showClearButton={true}
          onClearAll={onClear}
        />
      </div>
    </aside>
  );
};
