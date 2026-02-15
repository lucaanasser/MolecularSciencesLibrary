import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminListContainer, { Column } from "@/features/admin/components/ListRenderer";
import { Book, Area, Subarea } from "@/types/new_book";
import { AREAS, SUBAREAS } from "@/constants/books";
import { BooksService } from "@/services/BooksService";


export default function ListBooks({onBack}) {
  // Estados
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<Area>(null);
  const [selectedSubarea, setSelectedSubarea] = useState<Subarea>(null);
  
  // Controla  a busca por query e filtros
  useEffect(() => {
    setLoading(true);
    BooksService.searchBooks({
      q: query.trim(),
      area: selectedArea || undefined,
      subarea: selectedSubarea || undefined
    })
      .then(data => {
        setBooks(data);
        setTotalBooks(data.length);
      })
      .catch(() => {
        setBooks([]);
        setTotalBooks(0);
      })
      .finally(() => setLoading(false));
  }, [query, selectedArea, selectedSubarea]);

  // Colunas a serem exibidas na tabela (podem ser modificadas para incluir mais informações)
  const columns: Column<Book>[] = [
    { label: "ID", accessor: "id", className: "font-mono" },
    { label: "Título", accessor: "title" },
    { label: "Autor(es)", accessor: "authors" },
    { label: "Código", accessor: "code" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">

        {/* Barra de buscas */}
        <Input
          placeholder="Buscar por título, código ou autor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />

        {/* Filtro de área*/}
        <div className="flex gap-2">
          <Select
            value={selectedArea}
            onValueChange={(value: Area) => {
              setSelectedArea(value);
              setSelectedSubarea(null);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todas as áreas</SelectItem>
              {AREAS.map((area, idx) => (
                <SelectItem key={idx} value={area}> {area} </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de subárea */}
          <Select
            value={selectedSubarea}
            onValueChange={setSelectedSubarea}
            disabled={!selectedArea}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Subárea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todas as subáreas</SelectItem>
              {selectedArea && SUBAREAS[selectedArea].map((name, idx) => (
                <SelectItem key={idx} value={name}> {name} </SelectItem>
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
        onBack={onBack}
      />
    </div>
  );
}