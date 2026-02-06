import React from "react";
import BookCard from "../cards/BookCard";

interface BookResultsProps {
  groupedBooks: any[];
  isLoading: boolean;
  areaCodes: any;
  subareaCodes: any;
  loadingBookDetails: boolean;
  handleBookClick: (book: any) => void;
}

const BookResults: React.FC<BookResultsProps> = ({
  groupedBooks,
  isLoading,
  areaCodes,
  subareaCodes,
  loadingBookDetails,
  handleBookClick,
}) => (
  <div className="flex-1 mt-0">
    {isLoading ? (
      <p className="text-center py-8">Carregando livros...</p>
    ) : groupedBooks.length > 0 ? (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
        {groupedBooks.map(book => (
          <BookCard
            key={book.code}
            book={book}
            areaCodes={areaCodes}
            subareaCodes={subareaCodes}
            loadingBookDetails={loadingBookDetails}
            onDetails={handleBookClick}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum livro encontrado com esses critérios.</p>
      </div>
    )}
  </div>
);

export default BookResults;
