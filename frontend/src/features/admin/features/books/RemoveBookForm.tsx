import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";
import { BooksService } from "@/services/BooksService";
import type { Book } from "@/types/new_book";


export default function RemoveBookForm({ onSuccess, onError, onBack }) {
  // Estados
  const [query, setQuery] = useState("");
  const [foundBooks, setFoundBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Controle da busca
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFoundBooks([]);
    setSelectedBook(null);
    if (!query.trim()) {
      onError && onError("Digite algo para buscar.");
      return;
    }
    try {
      const books = await BooksService.searchBooks({q: query});
      setFoundBooks(books.results);
      if (books.total === 0) {
        onError && onError("Nenhum livro encontrado.");
      }
    } catch (err: any) {
      setFoundBooks([]);
      onError && onError(err.message || "Erro ao buscar livros.");
    }
  }, [query, onError]);


  // Controle da remoção
  const handleRemove = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook?.id) {
      onError && onError("Selecione um livro para remover.");
      return;
    }
    try {
      await BooksService.deleteBook(selectedBook.id);
      setSelectedBook(null);
      setFoundBooks([]);
      setQuery("");
      onSuccess && onSuccess("Livro removido com sucesso!");
    } catch (err: any) {
      onError && onError(err.message || "Erro ao remover livro.");
    }
  }, [selectedBook, onSuccess, onError]);

  // Renderização condicional
  const showInput = !selectedBook && foundBooks.length === 0;
  const showList = !selectedBook && foundBooks.length > 0;
  const showConfirm = !!selectedBook;

  return (
    <div>
      {showInput && (
        <div>
          <p>Busque o livro a ser removido</p>
          <form onSubmit={handleSearch}>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Digite título, autor ou código"
              required
            />
            <ActionBar
              onConfirm={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              onCancel={onBack}
              confirmLabel="Buscar"
            />
          </form>
        </div>
      )}

      {showList && (
        <div>
          <p>Selecione o livro que deseja remover:</p>
          <ul>
            {foundBooks.map(book => (
              <li key={book.id} className="py-2 flex items-center justify-between">
                <button
                  className="w-full px-4 py-2 rounded-xl hover:bg-gray-100 text-left"
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="flex flex-row gap-6 prose-sm">
                    <span>{book.id}:</span>
                    <span><b>{book.title}</b>,</span>
                    <span className="text-gray-700">{book.authors}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <ActionBar
            onCancel={ () =>{
              setFoundBooks([]);
              setQuery("");
              setSelectedBook(null);
            }}
            showConfirm={false}
          />
        </div>
      )}

      {showConfirm && (
        <div>
          <p>Confirme os dados do livro a ser removido:</p>
          <div className="flex flex-col gap-2 prose-md px-4">
            <div><b>Título: </b> 
              {selectedBook.title}
              {selectedBook.subtitle && <span>: {selectedBook.subtitle}</span>}
              {!!selectedBook.volume && <span>, vol. {selectedBook.volume}</span>}
              {selectedBook.edition && <span>, {selectedBook.edition}ª ed.</span>}
            </div>
            <span><b>Autor(es):</b> {selectedBook.authors}</span>
            
            <span><b>Código de barras:</b> {selectedBook.id}</span>
          </div>
          <form onSubmit={handleRemove}>
            <ActionBar
              onConfirm={() => handleRemove({ preventDefault: () => {} } as React.FormEvent)}
              onCancel={() => setSelectedBook(null)}
              confirmLabel="Remover"
              confirmColor="bg-cm-red"
            />
          </form>
        </div>
      )}
    </div>
  );
}