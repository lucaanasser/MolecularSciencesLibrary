import { FieldConfig } from "../search";
import { searchProps } from ".";
import { getDisciplines } from "@/services/DisciplinesService";

// Campos do resultado de disciplina
const resultsFields: FieldConfig[] = [
  { key: "nome", type: "main", linkTo: (result) => `/academico/disciplina/${result.codigo}` },
  { key: "codigo", type: "secondary" },
  { key: "unidade", type: "secondary", className: "text-gray-600" },
  { key: "campus", type: "secondary", className: "text-gray-500" },
];

const searchResultsProps = {
  resultsService: async (query: string, filters: any) => {
    const disciplines = await getDisciplines({ search: query, ...filters });
    return { results: disciplines, total: disciplines.length };
  },
  resultsFields,
  searchProps,
};

export default searchResultsProps;
