import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  authors: string;
  code: string;
  area: string;
  available: boolean;
}

interface BookCodeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bookCode: string) => void;
  title?: string;
  placeholder?: string;
}

/**
 * Componente para seleção de códigos de livro
 * Permite buscar livros e selecionar seus códigos
 */
const BookCodeSelector: React.FC<BookCodeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Selecionar Código de Livro",
  placeholder = "Digite o título ou código do livro"
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega livros quando o modal abre
  useEffect(() => {
    if (isOpen) {
      fetchBooks();
    } else {
      setSearch('');
      setFilteredBooks([]);
    }
  }, [isOpen]);

  // Filtra livros conforme busca
  useEffect(() => {
    if (!search.trim()) {
      setFilteredBooks(books);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(searchLower) ||
      book.authors.toLowerCase().includes(searchLower) ||
      book.code.toLowerCase().includes(searchLower) ||
      book.area.toLowerCase().includes(searchLower)
    );
    
    setFilteredBooks(filtered);
  }, [search, books]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/books', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
        setFilteredBooks(data);
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (bookCode: string) => {
    onSelect(bookCode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Lista de livros */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">Carregando livros...</div>
          ) : filteredBooks.length > 0 ? (
            <div className="space-y-2">
              {filteredBooks.map(book => (
                <div 
                  key={book.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-gray-600">{book.authors}</div>
                    <div className="text-xs text-gray-500">
                      {book.area} | Código: {book.code}
                    </div>
                    <div className={`text-xs ${book.available ? 'text-green-600' : 'text-red-600'}`}>
                      {book.available ? 'Disponível' : 'Emprestado'}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelect(book.code)}
                    className="ml-4"
                  >
                    Selecionar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {search ? 'Nenhum livro encontrado para esta busca' : 'Nenhum livro disponível'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookCodeSelector;
