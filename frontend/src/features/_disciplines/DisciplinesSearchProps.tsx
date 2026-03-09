import { GraduationCap } from "lucide-react";
import { searchDisciplines } from "@/services/DisciplinesService";

// Props para o painel de buscas de disciplinas (usado na AcademicSearchPage e AcademicSearchResultsPage)
const searchProps = {
  icon: <GraduationCap />,
  placeholder: "Busque uma disciplina...",
  autocompleteService: (query: string) => searchDisciplines(query),
  onLogoClick: () => window.location.href = "/academico/buscar",
  resultRoute: "/academico/buscar/resultados",
  suggestionRoute: (item) => `/academico/disciplina/${item.codigo}`,
  renderSuggestion: (item) => {
    return (
      <div>
        <span className="text-gray-500">{item.codigo}: </span> {item.nome}
        {item.unidade && <span className="text-gray-500"> ({item.unidade})</span>}
      </div>
    );
  },
};

export default searchProps;
