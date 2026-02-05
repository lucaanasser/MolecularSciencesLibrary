import { useNavigate } from "react-router-dom";
import { Search, Users, BookOpen } from "lucide-react";
import { searchDisciplines, searchUsers, searchBooks, type DisciplineSearchResult, type UserSearchResult, type BookSearchResult } from "@/services/SearchService";
import { useHighlightMatch } from "./useHighlightMatch";

export function useMolecoogleSearchConfig() {
  const navigate = useNavigate();
  const { highlightMatch } = useHighlightMatch();

  return [
    {
      key: "disciplinas",
      label: "Disciplinas",
      icon: <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />,
      placeholder: "Buscar disciplinas...",
      getSuggestions: (query: string) => searchDisciplines(query, 8),
      onSelect: (disc: DisciplineSearchResult) => {
        navigate(`/academico/disciplina/${disc.codigo}`);
      },
      renderSuggestion: (disc: DisciplineSearchResult, query: string, selected: boolean) => (
        <>
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-gray-800">{highlightMatch(disc.nome, query)}</span>
            <span className="text-gray-400 text-sm ml-2">— {disc.codigo}{disc.unidade ? ` • ${disc.unidade}` : ""}</span>
          </div>
        </>
      ),
    },
    {
      key: "usuarios",
      label: "Usuários",
      icon: <Users className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />,
      placeholder: "Buscar usuários...",
      getSuggestions: (query: string) => searchUsers(query, 8),
      onSelect: (user: UserSearchResult) => {
        navigate(`/perfil/${user.id}`);
      },
      renderSuggestion: (user: UserSearchResult, query: string, selected: boolean) => (
        <>
          <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-gray-800">{highlightMatch(user.name, query)}</span>
            {user.class && <span className="text-gray-400 text-xs ml-2">{user.class}</span>}
          </div>
        </>
      ),
    },
    {
      key: "livros",
      label: "Livros",
      icon: <BookOpen className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />,
      placeholder: "Buscar livros...",
      getSuggestions: (query: string) => searchBooks(query, 8),
      onSelect: (book: BookSearchResult) => {
        navigate(`/biblioteca/livro/${book.id}`);
      },
      renderSuggestion: (book: BookSearchResult, query: string, selected: boolean) => (
        <>
          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-gray-800">{highlightMatch(book.title, query)}</span>
            <div className="text-gray-400 text-sm mt-0.5">{book.authors}{book.code && <span className="ml-2">— {book.code}</span>}</div>
          </div>
        </>
      ),
    },
  ];
}
