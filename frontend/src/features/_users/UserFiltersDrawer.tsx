import React, { useMemo } from "react";
import { FiltersDrawer } from "@/components/filters/FiltersDrawer";
import { Input } from "@/components/ui/input";

interface UserFiltersDrawerProps {
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
 * Drawer mobile para filtros de usuários, usando estrutura genérica FiltersDrawer
 */
export const UserFiltersDrawer: React.FC<UserFiltersDrawerProps> = ({
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
    <FiltersDrawer
      groups={groups}
      showClearButton={true}
      onClearAll={onClear}
      disciplineInput={
        <div>
          <div className="font-semibold mb-2">Disciplina</div>
          <Input
            type="text"
            placeholder="Ex: MAC0110"
            value={disciplinaFilter}
            onChange={(e) => setDisciplinaFilter(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Buscar quem cursou</p>
        </div>
      }
    />
  );
};
