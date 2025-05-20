import { useState } from "react";
import useStep from "@/features/books/hooks/useStep";
import useAreaSelection from "@/features/books/hooks/useAreaSelection";
import useBookSearch from "@/features/books/hooks/useFetchSearch";
import useRemoveBook from "@/features/books/hooks/useRemoveBook";
import AreaSelection from "@/features/books/components/AreaSelection";
import BookSearchList from "@/features/books/components/BookListForm";
import { BookOption } from "@/features/books/types/book";

interface RemoveBookFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  onError?: (error: Error) => void;
}

export default function RemoveBookForm({ onCancel, onSuccess, onError }: RemoveBookFormProps) {
  const { step, setStep } = useStep(1);

  const {
    category,
    setCategory,
    subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes
  } = useAreaSelection(onError);

  const [selectedBook, setSelectedBook] = useState<BookOption | null>(null);

  const { filteredBooks, isLoading, search, setSearch } = useBookSearch(
    category,
    subcategory,
    step === 2,
    onError
  );
  const { removeBook, isSubmitting } = useRemoveBook();

  const handleSelectBook = (book: BookOption) => {
    setSelectedBook(book);
    setStep(3);
  };

  const handleRemoveBook = async () => {
    if (selectedBook) {
      const result = await removeBook(selectedBook.id);
      if (result.success) {
        onSuccess();
      } else if (onError && result.error) {
        onError(new Error(result.error)); 
      }
    }
  };

  switch (step) {
    case 1:
      return (
        <AreaSelection
          areaCodes={areaCodes}
          subareaCodes={subareaCodes}
          category={category}
          subcategory={subcategory}
          onCategoryChange={setCategory}
          onSubcategoryChange={setSubcategory}
          onNext={() => setStep(2)}
          onCancel={onCancel}
        />
      );

    case 2:
      return (
        <BookSearchList
          books={filteredBooks}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onSelectBook={handleSelectBook}
          onPrevious={() => setStep(1)}
          onCancel={onCancel}
          mode="remove"
        />
      );

    case 3:
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Confirmar Remoção</h2>
          {selectedBook && (
            <div>
              <p><strong>Título:</strong> {selectedBook.title}</p>
              <p><strong>Autores:</strong> {selectedBook.authors}</p>
              <p><strong>Edição:</strong> {selectedBook.edition}</p>
              <p><strong>Volume:</strong> {selectedBook.volume}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded" 
              onClick={handleRemoveBook} 
              disabled={isSubmitting}
            >
              Remover Livro
            </button>
            <button 
              className="bg-gray-300 px-4 py-2 rounded" 
              onClick={() => setStep(2)}
            >
              Voltar
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}