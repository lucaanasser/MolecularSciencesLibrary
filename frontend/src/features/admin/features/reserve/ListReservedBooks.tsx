import { useEffect, useState } from "react";
import ListRenderer, { Column } from "@/features/admin/components/ListRenderer";
import { BooksService } from "@/services/BooksService";
import { Book } from "@/types/new_book";

const columns: Column<Book>[] = [
  { label: "Código", accessor: "code", className: "font-mono" },
  { label: "Título", accessor: "title" },
  { label: "Autores", accessor: "authors" },
  { label: "Área", accessor: "area" },
];

export default function ListReservedBooks({ onBack, onError }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservedBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReservedBooks = async () => {
    try {
      setLoading(true);
      const data = await BooksService.getReservedBooks();
      setBooks(data);
    } catch (error: any) {
      onError(error || 'Erro ao buscar livros reservados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p>Esses são todos os livros atualmente na reserva didática:</p>
      <ListRenderer
        data={books}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum livro reservado encontrado."
        onBack={onBack}
        footer={`${books.length} livro(s) reservado(s) no total`}
      />
    </>
  );
};