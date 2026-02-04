import React, { useEffect, useState } from "react";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import { Input } from "@/components/ui/input";

interface Book {
  id: number;
  code: string;
  title: string;
  authors: string;
  area: string;
  subarea: string;
  edition?: string;
  is_reserved: number;
}

import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const columns: Column<Book>[] = [
  { label: "Código", accessor: "code", className: "font-mono" },
  { label: "Título", accessor: "title" },
  { label: "Autores", accessor: "authors" },
  { label: "Área", accessor: "area" },
];

const ListReserve: React.FC<TabComponentProps> = ({ onBack }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservedBooks();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchTerm, books]);

  const fetchReservedBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/books/reserved');
      if (!response.ok) throw new Error('Erro ao buscar livros reservados');
      const data = await response.json();
      setBooks(data);
      setFilteredBooks(data);
    } catch (error: any) {
      setError(error.message || 'Erro ao buscar livros reservados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p>Esses são todos os livros atualmente na reserva didática.</p>
      <div className="my-4">
        <Input
          placeholder="Buscar por título, autor, código ou área..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ListRenderer
        data={filteredBooks}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="Nenhum livro reservado encontrado."
        onBack={onBack}
        footer={`${filteredBooks.length} livros reservados no total`}
      />
    </>
  );
};

export default ListReserve;
