import { SearchPage } from "@/features/search/SearchPage";
import { logger } from "@/utils/logger";
import { Search, Users } from "lucide-react";
import 
  { searchDisciplines, 
    DisciplineSearchResult,
    searchUsers,
    UserSearchResult,
  } from "@/services/SearchService";
import { useHighlightMatch } from "@/features/search/useHighlightMatch";

/**
 * Página de busca da biblioteca - Reutiliza o componente SearchPage
 * com modo fixado em "livros" e sem botões de troca de modo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const AcademicSearchPage = () => {
  logger.info("🔵 [AcademicSearchPage] Renderizando página de busca de disciplinas e usuários");
  
  const { renderSuggestionWithHighlight } = useHighlightMatch();
  
  return <SearchPage 
    modes={[{
      key: "disciplinas",
      label: "Disciplinas",
      icon: <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />,
      placeholder: "Buscar disciplinas...",
      getSuggestions: (query: string) => searchDisciplines(query, 8),
      renderSuggestion: renderSuggestionWithHighlight<DisciplineSearchResult>(
        "nome",
        (discipline) => (
          <div className="text-gray-400 text-sm mt-0.5">
            {discipline.codigo} - {discipline.nome} {discipline.unidade ? ` • ${discipline.unidade}` : ""}
          </div>
        )
      ),
      searchPath: "/academico/disciplina/",
      searchFallback: "/academico/buscar/resultados?q="
    },
    {
      key: "usuarios",
      label: "Usuários",
      icon: <Users className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />,
      placeholder: "Buscar usuários...",
      getSuggestions: (query: string) => searchUsers(query, 8),
      renderSuggestion: renderSuggestionWithHighlight<UserSearchResult>(
        "name",
        (user) => (
          <div className="text-gray-400 text-sm mt-0.5">
            {user.name}
          </div>
        )
      ),
      searchPath: "/perfil/",
      searchFallback: "/academico/buscar/usuarios?q="
    }]}
    hideModeSwitcher={false}
  />;
}

export default AcademicSearchPage;
