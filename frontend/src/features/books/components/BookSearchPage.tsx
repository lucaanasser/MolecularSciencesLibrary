import useBookSearchPage from "../hooks/useBookSearchPage";
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

const BookSearch: React.FC = () => {
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

  // Gera opções de categoria e subcategoria
  const categoryOptions = Object.keys(areaCodes);
  const subcategoryOptions = category ? Object.keys(subareaCodes[category] || {}) : [];

  return (
    <div className="w-full p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bebas mb-6">Buscar Livros</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="col-span-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Digite título, autor ou palavra-chave..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 rounded-2xl"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <Select value={category || undefined} onValueChange={setCategory}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Selecione a categoria" />
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
              onValueChange={setSubcategory}
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

          <div>
            <Select value={filterAvailable} onValueChange={v => setFilterAvailable(v as any)}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Disponibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponíveis</SelectItem>
                <SelectItem value="borrowed">Emprestados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-8">
          <h3 className="text-xl font-bebas mb-4">Resultados da Busca</h3>
          {isLoading ? (
            <div className="text-center py-8">Carregando livros...</div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map(book => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{book.title}</h4>
                      <p className="text-gray-600">{book.authors}</p>
                      <div className="flex space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {areaCodes[book.area] || book.area}
                          {book.subarea && ` / ${subareaCodes[book.area]?.[book.subarea] || book.subarea}`}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        book.available
                          ? "bg-cm-green/10 text-cm-green"
                          : "bg-cm-red/10 text-cm-red"
                      }`}
                    >
                      {book.available ? "Disponível" : "Emprestado"}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-cm-blue border-cm-blue hover:bg-cm-blue/10"
                    >
                      Detalhes
                    </Button>
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
      </div>
    </div>
  );
};

export default BookSearch;
