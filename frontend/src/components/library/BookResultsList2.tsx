import React, { useEffect, useState } from "react";
import SearchResultsList, { FieldConfig } from "./SearchResultsList";
import type { Book } from "@/types/book";
import { getBooks } from "@/services/SearchService";

interface BookResultsList2Props {
  results?: Book[];
  searchQuery?: string;
}

const baseBadgeClass = "text-xs font-medium text-white px-2 py-0.5 rounded-full inline-block";

// Solução temporária, agregar estilos posteriormente
const statusStyle: Record<string, string> = {
  "disponível": "bg-blue-400",
  "emprestado": "bg-yellow-400",
  "atrasado": "bg-red-400",
  "reservado": "bg-purple-400",
};
const areaStyle: Record<string, string> = {
  "Matemática": "bg-cm-red/60",
  "Física": "bg-cm-orange/60",
  "Química": "bg-cm-yellow/60",
  "Biologia": "bg-cm-green/60",
  "Computação": "bg-cm-blue/60"
}

const fields: FieldConfig[] = [
  {
    key: "title",
    type: "main",
    linkTo: (book) => `/biblioteca/livro/${book.id}`,
    render: (value, book) => (
      <>
        {value}
        {book.subtitle && <span> - {book.subtitle}</span>}
      </>
    ),
  },
  {
    key: "code",
    type: "secondary",
  },
  {
    key: "authors",
    type: "secondary",
    className: "text-gray-600",
  },
  {
    key: "edition",
    type: "secondary",
    className: "text-gray-600",
    render: (edition) => (
      edition ? (
        <>
          <span className="mr-3">•</span>{edition}ª ed.
        </>
      ) : null
    ),
  },
  {
    key: "status",
    type: "custom",
    render: (status) => (
      status ? (
        <div className={`${baseBadgeClass} ${statusStyle[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      ) : null
    ),
  },
  {
    key: "area",
    type: "custom",
    render: (area) => (
      area ? (
        <div className={`${baseBadgeClass} ${areaStyle[area]}`}>
          {area}
        </div>
      ) : null
    ),
  },
];

export const BookResultsList2: React.FC<BookResultsList2Props> = ({ results, searchQuery }) => {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!results) {
      setLoading(true);
      getBooks({ limit: 100 })
        .then(data => setAllBooks(data))
        .catch(err => setError("Erro ao buscar livros."))
        .finally(() => setLoading(false));
    }
  }, [results]);

  if (loading) return <div className="text-gray-500 text-center py-8">Carregando livros...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  const booksToShow = results ?? allBooks;

  return (
    <SearchResultsList
      results={booksToShow}
      searchQuery={searchQuery ?? ""}
      fields={fields}
      emptyMessage="Nenhum livro encontrado."
    />
  );
};

export default BookResultsList2;