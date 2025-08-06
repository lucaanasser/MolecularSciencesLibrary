import useBookSearchPage from "../hooks/useBookSearch";
import { Search } from "lucide-react";
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
        <h2 className="text-3xl font-bebas mb-6">Buscar Livros</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
        </div>

        {/* Resultados */}
        <div className="mt-8">
          <h3 className="text-xl font-bebas mb-4">Resultados da Busca</h3>
          {isLoading ? (
            <div className="text-center py-8">Carregando livros...</div>
          ) : groupedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {groupedBooks.map(book => (
                <div
                  key={book.code}
                  className="bg-cyan-50/10 rounded-2xl p-4 shadow-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{book.title}</h4>
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
                    {/* Status: bolinha colorida com texto ao hover */}
                    {(() => {
                      // Prioridade: atrasado > reservado > emprestado > disponível
                      let color = "bg-cm-green";
                      let text = "Disponível";
                      let textColor = "text-white";
                      if (book.overdue) {
                        color = "bg-cm-red";
                        text = "Atrasado";
                        textColor = "text-white";
                      } else if (book.is_reserved) {
                        color = "bg-purple-700";
                        text = "Reservado";
                        textColor = "text-white";
                      } else if (book.exemplaresDisponiveis === 0) {
                        color = "bg-yellow-400";
                        text = "Emprestado";
                        textColor = "text-white";
                      }
                      return (
                        <span
                          className={`group inline-flex items-center cursor-default select-none`}
                        >
                          <span
                            className={`transition-all duration-200 w-4 h-4 rounded-full ${color} group-hover:w-auto group-hover:px-3 group-hover:py-1 group-hover:rounded-full group-hover:shadow-sm flex items-center justify-center ${textColor} text-xs font-semibold overflow-hidden`}
                            style={{ minWidth: '1rem' }}
                          >
                            <span className="opacity-0 group-hover:opacity-100 ml-2 whitespace-nowrap transition-opacity duration-200">{text}</span>
                          </span>
                        </span>
                      );
                    })()}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {book.totalExemplares > 1 && (
                      <span>{book.exemplaresDisponiveis}/{book.totalExemplares} exemplares disponíveis</span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
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
                    {/* Botão de nudge para livros atrasados */}
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
          />
        )}
      </div>
    </div>
  );
};

export default BookSearch;
