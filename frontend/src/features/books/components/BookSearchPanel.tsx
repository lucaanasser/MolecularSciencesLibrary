import useBookSearchPage from "../hooks/useBookSearch";
import { Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import BookDetailsModal from "./BookDetailsModal";
import NudgeButton from "./NudgeButton";

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
  const {
    category,
    setCategory,
    subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes,
    filterAvailable,
    setFilterAvailable,
    search,
    setSearch,
    books,
    isLoading,
    resetFilters,
  } = useBookSearchPage();

  // State para detalhes do livro selecionado
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  // Gera opções de categoria e subcategoria
  const categoryOptions = Object.keys(areaCodes);
  const subcategoryOptions = category ? Object.keys(subareaCodes[category] || {}) : [];

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
    <div className="w-full">
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="col-span-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Digite título ou autor..."
                value={search}
                onChange={e => {
                  console.log("🟢 [BookSearchPanel] Termo de busca alterado:", e.target.value);
                  setSearch(e.target.value);
                }}
                className="pl-10 rounded-2xl"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div>
            <Select value={filterAvailable === "all" ? undefined : filterAvailable} onValueChange={v => {
              console.log("🟢 [BookSearchPanel] Filtro de disponibilidade alterado:", v);
              setFilterAvailable(v as any);
            }}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponíveis</SelectItem>
                <SelectItem value="borrowed">Emprestados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={category || undefined} onValueChange={value => {
              console.log("🟢 [BookSearchPanel] Área selecionada:", value);
              setCategory(value);
              setSubcategory("");
            }}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions
                  .filter(cat => cat !== "" && cat !== undefined && cat !== null)
                  .map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {areaCodes[cat]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={subcategory || undefined}
              onValueChange={value => {
                console.log("🟢 [BookSearchPanel] Subcategoria selecionada:", value);
                setSubcategory(value);
              }}
              disabled={!category}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Subárea" />
              </SelectTrigger>
              <SelectContent>
                {subcategoryOptions
                  .filter(sub => sub !== "" && sub !== undefined && sub !== null)
                  .map(sub => (
                    <SelectItem
                      key={sub}
                      value={String(subareaCodes[category]?.[sub])}
                    >
                      {sub}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-start md:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl text-sm flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => resetFilters()}
              disabled={
                !search &&
                !category &&
                !subcategory &&
                filterAvailable === "all"
              }
            >
              <XCircle size={16} /> Limpar
            </Button>
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-8">
          <h3 className="text-xl font-bebas mb-4">Resultados da Busca</h3>
          {isLoading ? (
            <div className="text-center py-8">Carregando livros...</div>
          ) : groupedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
              {groupedBooks.map(book => (
                <div
                  key={book.code}
                  className="relative group bg-white rounded-2xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200 overflow-visible"
                >
                  {(() => {
                    let statusText = "Disponível";
                    let bgColor = "bg-cm-green";
                    if (book.overdue) {
                      statusText = "Atrasado";
                      bgColor = "bg-cm-red";
                    } else if (book.is_reserved) {
                      statusText = "Reservado";
                      bgColor = "bg-purple-700";
                    } else if (book.exemplaresDisponiveis === 0) {
                      statusText = "Emprestado";
                      bgColor = "bg-yellow-400";
                    }
                    return (
                      <div
                        className={`absolute top-2 bottom-2 left-0 -ml-2 group-hover:-ml-4 w-4 group-hover:w-14 ${bgColor} text-white font-semibold text-[10px] tracking-widest transition-all duration-300 rounded-r flex items-center justify-center shadow-md`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 origin-center -rotate-90 whitespace-nowrap select-none">
                          {statusText.toUpperCase()}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="flex justify-between items-start ml-3">
                    <div>
                      <h4 className="font-semibold text-lg text-cm-purple">{book.title}</h4>
                      <p className="text-gray-600">{book.authors}</p>
                      <div className="flex space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {book.area && areaCodes && areaCodes[book.area] ? areaCodes[book.area] : (book.area || "Área desconhecida")}
                          {book.subarea && subareaCodes && subareaCodes[book.area] && subareaCodes[book.area][book.subarea]
                            ? ` / ${subareaCodes[book.area][book.subarea]}`
                            : (book.subarea ? ` / ${book.subarea}` : "")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 ml-3">
                    {book.totalExemplares > 1 && (
                      <span>{book.exemplaresDisponiveis}/{book.totalExemplares} exemplares disponíveis</span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end gap-2 ml-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl bg-white text-cm-purple border-cm-purple hover:bg-cm-purple/80 hover:text-white"
                      onClick={() => {
                        setSelectedBook(book);
                      }}
                    >
                      Detalhes
                    </Button>
                    {book.overdue && (
                      <NudgeButton book={book} />
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
      </div>
    </div>
  );
};

export default BookSearch;
