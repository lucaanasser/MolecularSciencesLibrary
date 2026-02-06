import BookCard from "../cards/BookCard";
import BookResults from "./BookResults";
import useBookOptions from "@/hooks/useBookOptions";
import useBookList from "../../../../hooks/useBookList";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import BookDetailsModal from "../modals/BookDetailsModal";
import BookFiltersPanel from "../filters/BookFiltersPanel";

/**
 * Painel de busca de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const BookSearch: React.FC = () => {
  // Log de início de renderização
  console.log("🔵 [BookSearchPanel] Renderizando painel de busca de livros");
  // Estados dos filtros (agora arrays para múltipla seleção)
  const [category, setCategory] = useState<string[]>([]);
  const [subcategory, setSubcategory] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [language, setLanguage] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  // Opções
  const { areaCodes, subareaCodes } = useBookOptions();
  const languageOptions = [
    { value: "1", label: "Português" },
    { value: "2", label: "Inglês" },
    { value: "3", label: "Espanhol" },
    { value: "4", label: "Outros Idiomas" },
  ];
  // Filtros para a busca principal (envia apenas o primeiro valor de cada filtro múltiplo)
  const filters = {
    category: category.length > 0 ? category[0] : "",
    subcategory: subcategory.length > 0 ? subcategory[0] : "",
    status: status.length > 0 ? status[0] : "",
    language: language.length > 0 ? language[0] : "",
    search,
  };
  const { books: rawBooks, isLoading } = useBookList(filters, true);

  // União dos filtros múltiplos
  const books = useMemo(() => {
    if (!rawBooks) return [];
    return rawBooks.filter(book => {
      // Área
      if (category.length > 0 && !category.includes(book.area)) return false;
      // Subárea
      if (subcategory.length > 0 && !subcategory.includes(String(book.subarea))) return false;
      // Idioma
      if (language.length > 0 && !language.includes(String(book.language))) return false;
      // Status (status é calculado no frontend/backend, pode ser string)
      if (status.length > 0 && !status.includes(book.status)) return false;
      return true;
    });
  }, [rawBooks, category, subcategory, language, status]);

  // State para detalhes do livro selecionado
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [loadingBookDetails, setLoadingBookDetails] = useState(false);

  // Função para buscar detalhes completos do livro
  const handleBookClick = async (book: any) => {
    setLoadingBookDetails(true);
    try {
      const response = await fetch(`/api/books/${book.id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes do livro');
      }
      const bookDetails = await response.json();
      setSelectedBook({ ...book, ...bookDetails });
    } catch (error) {
      console.error('🔴 [BookSearchPanel] Erro ao buscar detalhes:', error);
      setSelectedBook(book); // Fallback para o livro sem detalhes completos
    } finally {
      setLoadingBookDetails(false);
    }
  };

  // Responsividade: detectar se é mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const isPristine = !search && category.length === 0 && subcategory.length === 0 && status.length === 0 && language.length === 0;

  // Agrupa livros por código E idioma para exibir apenas um card por grupo
  const groupedBooks = useMemo(() => {
    const groups: Record<string, any[]> = {};
    books.forEach(book => {
      const groupKey = `${book.code}__${book.language}`;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(book);
    });
    return Object.values(groups).map(exemplares => {
      const total = exemplares.length;
      const disponiveis = exemplares.filter(b => b.available).length;
      return {
        ...exemplares[0],
        exemplares,
        totalExemplares: total,
        exemplaresDisponiveis: disponiveis
      };
    });
  }, [books]);

  // Props para o painel de filtros
  const filterPanelProps = {
    category, setCategory,
    subcategory, setSubcategory,
    status, setStatus,
    language, setLanguage,
    areaCodes, subareaCodes,
    languageOptions,
    isPristine,
    setSearch
  };

  // Props para o resultado das buscas
  const bookResultsProps = {
    groupedBooks,
    isLoading,
    areaCodes,
    subareaCodes,
    loadingBookDetails,
    handleBookClick
  };

  return (
    <div className="w-full flex flex-col">
      {/* Barra de pesquisa no topo */}
      <div className="relative w-full max-w-4xl mx-auto mt-4 mb-8">
        <Input
          type="text"
          placeholder="Digite título ou autor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-2xl w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>
      <div className="w-full flex">
        {isMobile 
        ? (
          <div className="w-full flex flex-col">
          {/* Mobile: Filtros em drawer e resultados embaixo */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="default" className="mb-4 ml-2 w-full">Filtrar</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="p-4">
                  <BookFiltersPanel {...filterPanelProps} />
                  <DrawerClose asChild>
                    <Button variant="primary" className="mt-4 w-full">Fechar</Button>
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
            <BookResults {...bookResultsProps} />
          </div>
        ) 
        : (
          <>
            { /* Desktop: Filtros na esquerda e resultados ao lado */}
            <aside className="w-40 min-w-[100px] max-w-xs p-4 mr-6 h-fit top-4 self-start">
              <BookFiltersPanel {...filterPanelProps} />
            </aside>
            <BookResults {...bookResultsProps} />
          </>
        )}
        
        {/* Modal de detalhes do livro*/}
        {selectedBook && (
          <BookDetailsModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            showAvailabilityText={true}
            showVirtualShelfButton={true}
            subareaCodes={subareaCodes}
          />
        )}
      </div>
    </div>
  );
};

export default BookSearch;