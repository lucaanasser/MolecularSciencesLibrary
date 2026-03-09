import React from "react";
import { Users, Layers, Globe, BookOpen, Hash, Gift } from "lucide-react";
import { Book } from "@/types/book";
import ExemplarsList, { formatDonator } from "./ExemplarsList";

interface BookInfoSectionProps {
  book: Book;
  books: Book[];
  loanByBook: { [id: number]: any };
}

const BookInfoSection: React.FC<BookInfoSectionProps> = ({ book, books, loanByBook }) => {
  const donatorDisplay = (() => {
    const found = books.find((b) => b.donator_name);
    return found ? formatDonator(found.donator_name, found.donator_tag) : "";
  })();

  return (
    <div>
      <ul className="flex flex-col gap-1 text-gray-700">
        <li className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{color: book?.area}}/>
          <span className="font-medium">Autores:</span>
          <span className="truncate">{book.authors}</span>
        </li>
        {!!book.volume && (
          <li className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-library-purple" />
            <span className="font-medium">Volume:</span>
            <span>{book.volume}</span>
          </li>
        )}
        <li className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-library-purple" />
          <span className="font-medium">Idioma:</span>
          <span>{book.language}</span>
        </li>
        <li className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-library-purple" />
          <span className="font-medium">Área:</span>
          <span>{book.area}</span>
        </li>
        <li className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-library-purple" />
          <span className="font-medium">Subárea:</span>
          <span>{book.subarea}</span>
        </li>
        {donatorDisplay && (
          <li className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-library-purple" />
            <span className="font-medium">Doador:</span>
            <span className="font-semibold text-library-purple">{donatorDisplay}</span>
          </li>
        )}
      </ul>
      <ExemplarsList books={books} loanByBook={loanByBook} />
    </div>
  );
};

export default BookInfoSection;
