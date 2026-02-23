import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

const ReservedBooksList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
      const response = await fetch('/api/books/reserved');
      if (!response.ok) throw new Error('Erro ao buscar livros reservados');
      const data = await response.json();
      setBooks(data);
      setFilteredBooks(data);
    } catch (error) {
      console.error('Erro ao buscar livros reservados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Input
          placeholder="Buscar por título, autor, código ou área..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="text-sm text-gray-600">
        Total: {filteredBooks.length} livro{filteredBooks.length !== 1 ? 's' : ''} reservado{filteredBooks.length !== 1 ? 's' : ''}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-100 z-10">
              <TableRow>
                <TableHead className="font-semibold">Código</TableHead>
                <TableHead className="font-semibold">Título</TableHead>
                <TableHead className="font-semibold">Autores</TableHead>
                <TableHead className="font-semibold">Área</TableHead>
                <TableHead className="font-semibold">Subárea</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhum livro reservado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => (
                  <TableRow key={book.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{book.code}</TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.authors}</TableCell>
                    <TableCell>{book.area}</TableCell>
                    <TableCell>{book.subarea}</TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                        Reservado
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ReservedBooksList;
