import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminListContainer, { Column } from "@/features/admin/components/ListRenderer";
import { useExportCSV } from "@/features/admin/hooks/useExportCSV";
import { Book } from "@/types/book";
import { getBooks, countBooks, getBookOptions, type BookFilters } from "@/services/SearchService";

interface CategoryMappings {
  areas: Record<string, string>;
  subareas: Record<string, Record<string, string>>;
}

interface BooksListProps {
  onClose?: () => void;
}

export default function BooksList({ onClose }: BooksListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedSubarea, setSelectedSubarea] = useState<string>("all");
  const [categoryMappings, setCategoryMappings] = useState<CategoryMappings>({ areas: {}, subareas: {} });
  
  // Debounce para busca
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca mapeamentos de categorias na montagem
  useEffect(() => {
    getBookOptions()
      .then((data) => {
        setCategoryMappings({
          areas: data.areas || {},
          subareas: data.subareas || {}
        });
      })
      .catch((err) => console.error("🔴 [BooksList] Erro ao buscar categorias:", err));
  }, []);

  // Busca livros via BooksService (backend)
  const fetchBooks = useCallback(async (filters: BookFilters = {}) => {
    try {
      setLoading(true);
      const [booksData, count] = await Promise.all([
        getBooks(filters),
        countBooks(filters)
      ]);
      setBooks(booksData);
      setTotalBooks(count);
    } catch (error) {
      console.error("🔴 [BooksList] Erro ao buscar livros:", error);
      setBooks([]);
      setTotalBooks(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Monta filtros e busca
  const applyFilters = useCallback(() => {
    const filters: BookFilters = {};
    
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    if (selectedArea !== "all") {
      filters.category = selectedArea;
    }
    if (selectedSubarea !== "all") {
      filters.subcategory = selectedSubarea;
    }
    
    fetchBooks(filters);
  }, [searchTerm, selectedArea, selectedSubarea, fetchBooks]);

  // Busca inicial e quando filtros de categoria mudam
  useEffect(() => {
    applyFilters();
  }, [selectedArea, selectedSubarea]);

  // Debounce para o campo de busca
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const { exportCSV } = useExportCSV({
    endpoint: "/api/books/export/csv",
    filename: "catalogo_livros.csv"
  });

  const columns: Column<Book>[] = [
    { label: "ID", accessor: "id", className: "font-mono" },
    { label: "Código", accessor: "code" },
    { label: "Título", accessor: "title" },
    { label: "Autor(es)", accessor: "authors" },
  ];

  // Obtém áreas disponíveis do categoryMappings
  const areaOptions = Object.entries(categoryMappings.areas || {});

  // Obtém subáreas disponíveis para a área selecionada
  const subareaOptions = selectedArea !== "all" 
    ? Object.entries(categoryMappings.subareas?.[selectedArea] || {})
    : [];

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-col gap-2 mb-4">
        <Input
          placeholder="Buscar por ID, código, título ou autor..."
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
              {areaOptions.map(([code, name]) => (
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
              <SelectItem value="all">Todas as subáreas</SelectItem>
              {subareaOptions.map(([name, _]) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de livros */}
      <AdminListContainer
        data={books}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum livro encontrado"
        footer={
          <span>{books.length} de {totalBooks} livros</span>
        }
        exportCSV={exportCSV}
        onBack={onClose}
      />
    </div>
  );
}
