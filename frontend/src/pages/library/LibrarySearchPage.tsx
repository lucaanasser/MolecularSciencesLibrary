import { SearchModeConfig, SearchPage } from "@/features/search/SearchPage";
import { logger } from "@/utils/logger";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { searchBooks, BookSearchResult } from "@/services/SearchService";
import { useHighlightMatch } from "@/features/search/hooks/useHighlightMatch";

/**
 * Página de busca da biblioteca - Reutiliza o componente SearchPage
 * com modo fixado em "livros" e sem botões de troca de modo.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const LibrarySearchPage = () => {
  logger.info("🔵 [SearchPage] Renderizando página de busca de livros");
  
  const navigate = useNavigate();
  const { renderSuggestionWithHighlight } = useHighlightMatch();
  
  const libraryMode: SearchModeConfig = {
    key: "livros",
    label: "Livros",
    icon: <BookOpen className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />,
    placeholder: "Buscar livros...",
    getSuggestions: (query: string) => searchBooks(query, 8),
    renderSuggestion: renderSuggestionWithHighlight<BookSearchResult>(
      "title",
      (book) => (
        <div className="text-gray-400 text-sm mt-0.5">
          {book.authors}
          {book.code && <span className="ml-2">— {book.code}</span>}
        </div>
      )
    ),
    searchPath: "/biblioteca/livro/",
    searchFallback: "/biblioteca/buscar/resultados?q="
  };
  
  return <SearchPage 
    modes={[libraryMode]}
    hideModeSwitcher={true}
  />;
}

export default LibrarySearchPage;
