import { BooksService } from "@/services/BooksService";
import { BookOpen } from "lucide-react"

// Props para o painel de buscas (usado na SearchPage e na SearchResultsPage)
const searchProps = {
  icon: <BookOpen/>,
  placeholder: "Busque um livro...",
  autocompleteService: (query: string) => BooksService.autocompleteSearchBooks(query),
  onLogoClick: () => window.location.href = "/biblioteca/buscar", // redireciona para a página de busca
  resultRoute: "/biblioteca/buscar/resultados",                   // do arquivo routes/index.tsx
  suggestionRoute: (item) => `/biblioteca/livro/${item.id}`,                           // do arquivo routes/index.tsx
  renderSuggestion: (item) => {
    return (
      <div>
        <span className="text-gray-500">{item.code}: </span> {item.title}
        <span className="text-gray-500"> ({item.authors})</span>
      </div>
    );
  },
};

export default searchProps;