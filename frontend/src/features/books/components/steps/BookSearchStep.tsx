import { BookOption, AddBookType } from "@/features/books/types/book";
import BookList from "@/features/books/components/BookSearchList";

export interface BookSearchStepProps {
  books: BookOption[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectBook: (book: BookOption, type?: AddBookType) => void;
  onAddNewBook?: () => void;
  onAddNewVolume?: (book: BookOption) => void;
  onPrevious: () => void;
  onCancel?: () => void;
  mode?: "add" | "remove";
}

export default function BookSearchStep({
  books,
  isLoading,
  search,
  onSearchChange,
  onSelectBook,
  onAddNewBook,
  onAddNewVolume, 
  onPrevious,
  onCancel,
  mode = "add"
}: BookSearchStepProps) {
  return (
    <BookList
      books={books}
      isLoading={isLoading}
      search={search}
      onSearchChange={onSearchChange}
      onSelectBook={onSelectBook}
      onAddNewBook={onAddNewBook}
      onAddNewVolume={onAddNewVolume}
      onPrevious={onPrevious}
      onCancel={onCancel}
      mode={mode}
    />
  );
}