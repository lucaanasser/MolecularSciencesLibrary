import { getResolvedSubarea } from "@/utils/bookUtils";
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
    status,
    setStatus,
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

  // Detecta se algo foi modificado em relação aos padrões (Todos/sem busca)
  // ...existing code...
  const isPristine = !search && !category && !subcategory && status === "";

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
            <Select value={status} onValueChange={v => {
              console.log("🟢 [BookSearchPanel] Filtro de status alterado:", v);
              setStatus(v);
            }}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="reserved">Reservado</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
                <SelectItem value="borrowed">Emprestado</SelectItem>
                <SelectItem value="extended">Estendido</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={category || "__ALL__"} onValueChange={value => {
              console.log("🟢 [BookSearchPanel] Área selecionada:", value);
              if (value === "__ALL__") {
                setCategory("");
                setSubcategory("");
              } else {
                setCategory(value);
                setSubcategory("");
              }
            }}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Todos</SelectItem>
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
              value={subcategory || "__ALL__"}
              onValueChange={value => {
                console.log("🟢 [BookSearchPanel] Subcategoria selecionada:", value);
                if (value === "__ALL__") setSubcategory(""); else setSubcategory(value);
              }}
              disabled={!category}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Subárea" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Todos</SelectItem>
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
            {!isPristine && (
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl text-sm flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => resetFilters()}
              >
                <XCircle size={16} /> Limpar
              </Button>
            )}
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
                <div key={book.code} className="relative group">
                  {/* Aba lateral de status na esquerda */}
                  {(() => {
                    // Prioridade: atrasado > reservado > estendido > janela final > emprestado > disponível
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
                    } else if (book.due_in_window && book.exemplaresDisponiveis === 0) {
                      color = "bg-yellow-500";
                      text = "Últimos dias";
                      textColor = "text-black";
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
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-300 hover:shadow-xl transition-shadow duration-200 min-h-64 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg text-black line-clamp-2 tracking-wider">{book.title}</h4>
                        <p className="text-gray-600 line-clamp-2">{book.authors}</p>
                        <div className="flex space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            {book.area && areaCodes && areaCodes[book.area] ? areaCodes[book.area] : (book.area || "Área desconhecida")}
                            {book.subarea ? ` / ${getResolvedSubarea(book.area, book.subarea, subareaCodes)}` : ""}
                          </span>
                        </div>
                      </div>
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
                      {/* Botão de nudge para livros atrasados ou na janela final ou estendidos */}
                      {(book.overdue || book.due_in_window || book.is_extended) && (
                        <NudgeButton book={book} />
                      )}
                    </div>
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
