
import { useState } from "react";
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

interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  category: string;
  subcategory?: string;
  available: boolean;
}

// Mock data for demonstration
const mockBooks: Book[] = [
  {
    id: "1",
    title: "Princípios de Bioquímica",
    author: "Albert L. Lehninger",
    year: 2014,
    category: "Biologia",
    subcategory: "Bioquímica",
    available: true,
  },
  {
    id: "2",
    title: "Cálculo: Volume 1",
    author: "James Stewart",
    year: 2016,
    category: "Matemática",
    subcategory: "Cálculo",
    available: false,
  },
  {
    id: "3",
    title: "Física para Cientistas e Engenheiros",
    author: "Paul A. Tipler",
    year: 2009,
    category: "Física",
    subcategory: "Física Geral",
    available: true,
  },
  {
    id: "4",
    title: "Química Orgânica",
    author: "John McMurry",
    year: 2011,
    category: "Química",
    subcategory: "Orgânica",
    available: true,
  },
  {
    id: "5",
    title: "Introdução à Teoria da Computação",
    author: "Michael Sipser",
    year: 2012,
    category: "Computação",
    subcategory: "Algoritmos",
    available: false,
  },
];

const BookSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [filterAvailable, setFilterAvailable] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = ["Física", "Química", "Biologia", "Matemática", "Computação", "Variados"];

  const handleSearch = () => {
    // Filter books based on search criteria
    const results = mockBooks.filter((book) => {
      const matchesQuery =
        query === "" ||
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase());

      const matchesCategory = category === "all" || book.category === category;

      const matchesAvailability =
        filterAvailable === "all" ||
        (filterAvailable === "available" && book.available) ||
        (filterAvailable === "borrowed" && !book.available);

      return matchesQuery && matchesCategory && matchesAvailability;
    });

    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="w-full p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bebas mb-6">Buscar Livros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1 md:col-span-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Digite título, autor ou palavra-chave..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 rounded-2xl"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={filterAvailable} onValueChange={setFilterAvailable}>
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
          
          <div>
            <Button 
              onClick={handleSearch} 
              className="w-full bg-cm-blue hover:bg-cm-blue/90 text-white rounded-2xl"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="mt-8">
            <h3 className="text-xl font-bebas mb-4">Resultados da Busca</h3>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{book.title}</h4>
                        <p className="text-gray-600">{book.author}</p>
                        <div className="flex space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            {book.year}
                          </span>
                          <span className="text-sm text-gray-500">
                            {book.category}
                            {book.subcategory && ` / ${book.subcategory}`}
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
        )}
      </div>
    </div>
  );
};

export default BookSearch;
