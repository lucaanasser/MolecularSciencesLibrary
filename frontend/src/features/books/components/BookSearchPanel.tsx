import { getResolvedSubarea } from "@/utils/bookUtils";
import useBookOptions from "../hooks/useBookOptions";
import useBookList from "../hooks/useBookList";
import { useEffect } from "react";
import { BookOption } from "../types/book";
import { Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import BookDetailsModal from "./BookDetailsModal";
import NudgeButton from "./NudgeButton";
import CategoryFilter from "./BookFilters/CategoryFilter";
import SubareaFilter from "./BookFilters/SubareaFilter";
import StatusFilter from "./BookFilters/StatusFilter";
import LanguageFilter from "./BookFilters/LanguageFilter";

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

  // Filtragem manual para simular OU (união dos filtros múltiplos)
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



  // Detecta se algo foi modificado em relação aos padrões (Todos/sem busca)
  // ...existing code...
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

  return (
    <div className="w-full flex">
      {/* Painel lateral de filtros */}
      <aside className="w-72 min-w-[220px] max-w-xs p-4 bg-gray-50 border-r border-gray-200 rounded-2xl mr-6 h-fit sticky top-4 self-start">
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Digite título ou autor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-2xl"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <CategoryFilter category={category} setCategory={setCategory} areaCodes={areaCodes} />
          <SubareaFilter category={category} subcategory={subcategory} setSubcategory={setSubcategory} subareaCodes={subareaCodes} />
          <LanguageFilter language={language} setLanguage={setLanguage} languageOptions={languageOptions} />
          <StatusFilter status={status} setStatus={setStatus} />
          {!isPristine && (
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl text-sm flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                setCategory([]);
                setSubcategory([]);
                setStatus([]);
                setLanguage([]);
                setSearch("");
              }}
            >
              <XCircle size={16} /> Limpar
            </Button>
          )}
        </div>
      </aside>
      {/* Resultados */}
      <main className="flex-1">
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-8">Carregando livros...</div>
          ) : groupedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
              {groupedBooks.map(book => (
                <div key={book.code} className="relative group">
                  {/* Aba lateral de status na esquerda */}
                  {(() => {
                    // Prioridade: atrasado > reservado > estendido > emprestado > disponível
                    let color = "bg-cm-green";
                    let text = "Disponível";
                    let textColor = "text-white";
                    if (book.overdue) {
                      color = "bg-cm-red";
                      text = "Atrasado";
                    } else if (book.is_reserved) {
                      color = "bg-purple-700";
                      text = "Reservado";
                    } else if (book.is_extended) {
                      color = "bg-cm-orange";
                      text = "Estendido";
                    } else if (book.exemplaresDisponiveis === 0) {
                      color = "bg-yellow-400";
                      text = "Emprestado";
                      textColor = "text-black";
                    }
                    return (
                      <div className={`absolute left-0 top-0 h-full w-4 ${color} rounded-l-lg transition-all duration-300 ease-in-out group-hover:w-8 group-hover:-translate-x-4 translate-x-0 overflow-visible z-10 origin-left`}>
                        {/* Texto na vertical que aparece no hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 h-full flex items-center justify-center">
                          <span className={`${textColor} text-xs font-semibold transform -rotate-90 whitespace-nowrap`}>
                            {text}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card do livro */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-300 hover:shadow-xl transition-shadow duration-200 min-h-72 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4>
                          {book.title}
                          {book.volume && (
                            <span className="ml-2 text-base text-gray-500">Vol. {book.volume}</span>
                          )}
                        </h4>
                        <p className="mb-2">
                          {book.authors}
                        </p>
                        <p className="smalltext">
                          <span>
                            {book.area && areaCodes && areaCodes[book.area] ? areaCodes[book.area] : (book.area || "Área desconhecida")}
                            {book.subarea ? ` / ${getResolvedSubarea(book.area, book.subarea, subareaCodes)}` : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">
                        {book.totalExemplares > 0 && (
                          <>{book.exemplaresDisponiveis}/{book.totalExemplares} exemplares disponíveis</>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl bg-white text-library-purple border-library-purple hover:bg-library-purple/80 hover:text-white"
                          onClick={() => handleBookClick(book)}
                          disabled={loadingBookDetails}
                        >
                          {loadingBookDetails ? 'Carregando...' : 'Detalhes'}
                        </Button>
                      </div>
                    </div>
                    {/* Botão de nudge para livros atrasados ou na janela final ou estendidos*/}
                    {(book.overdue || book.due_in_window || book.is_extended) ? (
                      <div className="flex justify-end mt-2">
                        <NudgeButton book={book} />
                      </div>
                    ) : (
                      <div className="flex justify-end mt-2" style={{ visibility: 'hidden', height: '40px' }}>
                        {/* Placeholder invisível para alinhar o conteúdo */}
                        <div style={{ width: '40px', height: '40px' }} />
                      </div>
                    )}
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum livro encontrado com esses critérios.</p>
            </div>
          )}

        </div>
        {/* Modal de detalhes do livro usando o componente reutilizável */}
        {selectedBook && (
          <BookDetailsModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            showAvailabilityText={true}
            showVirtualShelfButton={true}
            subareaCodes={subareaCodes}
          />
        )}
      </main>
    </div>
  );
};

export default BookSearch;
