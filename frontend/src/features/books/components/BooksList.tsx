import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Book {
  id: number;
  code: string;
  title: string;
  authors: string;
  area: string;
  sub_area: string;
  available?: boolean;
  is_reserved?: number;
}

interface CategoryMapping {
  areas: { [key: string]: string };
  subareas: { [key: string]: { [key: string]: string } };
}

interface BooksListProps {
  onClose?: () => void;
}

export default function BooksList({ onClose }: BooksListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedSubarea, setSelectedSubarea] = useState<string>("all");
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping>({ areas: {}, subareas: {} });

  useEffect(() => {
    fetchCategoryMappings();
    fetchBooks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [books, searchTerm, selectedArea, selectedSubarea]);

  const fetchCategoryMappings = async () => {
    try {
      const res = await fetch("/api/books/options");
      if (res.ok) {
        const data = await res.json();
        setCategoryMappings({
          areas: data?.areas || {},
          subareas: data?.subareas || {}
        });
      }
    } catch (err) {
      console.error("Erro ao buscar mapeamentos:", err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Erro ao buscar livros");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("Erro ao buscar livros:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...books];

    // Filtro de texto (busca por título, autor ou código)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(term) ||
          book.authors?.toLowerCase().includes(term) ||
          book.code?.toLowerCase().includes(term)
      );
    }

    // Filtro de área
    if (selectedArea !== "all") {
      filtered = filtered.filter((book) => book.area === selectedArea);
    }

    // Filtro de subárea
    if (selectedSubarea !== "all") {
      filtered = filtered.filter((book) => book.sub_area === selectedSubarea);
    }

    setFilteredBooks(filtered);
  };

  const getAvailableSubareas = () => {
    if (selectedArea === "all" || !categoryMappings.subareas[selectedArea]) {
      return {};
    }
    return categoryMappings.subareas[selectedArea];
  };

  const getStatusBadge = (book: Book) => {
    if (book.is_reserved === 1) {
      return <Badge className="bg-purple-500">Reservado</Badge>;
    }
    if (book.available === false) {
      return <Badge className="bg-red-500">Emprestado</Badge>;
    }
    return <Badge className="bg-green-500">Disponível</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando livros...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com botão fechar */}
      {onClose && (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Filtros */}
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Buscar por título, autor ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2">
          <Select 
            value={selectedArea} 
            onValueChange={(value) => {
              setSelectedArea(value);
              setSelectedSubarea("all");
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as áreas</SelectItem>
              {Object.entries(categoryMappings.areas || {}).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={selectedSubarea} 
            onValueChange={setSelectedSubarea}
            disabled={selectedArea === "all"}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Subárea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(getAvailableSubareas() || {}).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela com scroll */}
      <div className="rounded-md border max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="text-sm">ID</TableHead>
              <TableHead className="text-sm">Código</TableHead>
              <TableHead className="text-sm">Título</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  Nenhum livro encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-mono text-sm">{book.id}</TableCell>
                  <TableCell className="font-mono text-sm">{book.code}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{book.title}</div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Contador */}
      <div className="text-xs text-gray-600">
        {filteredBooks.length} de {books.length} livros
      </div>
    </div>
  );
}
