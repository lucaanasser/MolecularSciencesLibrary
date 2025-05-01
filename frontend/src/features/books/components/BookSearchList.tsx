import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOption, AddBookType } from "../types/book";

interface BookSearchListProps {
  books: BookOption[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectBook: (book: BookOption, type: AddBookType) => void;
  onAddNewBook: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
}

export default function BookSearchList({
  books,
  isLoading,
  search,
  onSearchChange,
  onSelectBook,
  onAddNewBook,
  onPrevious,
  onCancel
}: BookSearchListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">Verifique se o livro já existe no acervo</h2>
      <Input
        type="text"
        placeholder="Buscar por nome do livro"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
      
      {/* "Não encontrei o livro" section */}
      <div className="bg-gray-100 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          {books.length > 0 
            ? `Encontramos ${books.length} livro(s). Se nenhum desses for o que procura:`
            : "Nenhum livro encontrado nesta subárea."}
        </p>
        <Button 
          onClick={onAddNewBook} 
          className="w-full mt-2 bg-cm-green hover:bg-cm-green/90"
        >
          Não encontrei o livro
        </Button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center p-6">
          <p>Carregando livros...</p>
        </div>
      )}
      
      {/* Book list */}
      {!isLoading && books.length > 0 && (
        <div className="space-y-3 mt-4">
          <h3 className="font-medium">Livros disponíveis:</h3>
          {books.map(book => (
            <div key={book.id} className="border rounded p-2 flex flex-col gap-2">
              <div>
                <b>{book.title}</b>
                {book.authors && <> – {book.authors}</>}
                {book.edition && <> (Edição: {book.edition})</>}
                {book.volume && <> Vol. {book.volume}</>}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onSelectBook(book, "exemplar")}
                >
                  Adicionar Novo Exemplar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectBook(book, "volume")}
                >
                  Adicionar Novo Volume
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Navigation buttons */}
      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={onPrevious}>Voltar</Button>
        {onCancel && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
      </div>
    </div>
  );
}