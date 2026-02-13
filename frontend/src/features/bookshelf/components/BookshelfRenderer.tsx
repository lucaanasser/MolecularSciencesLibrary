import React from "react";
import ShelfRenderer from "@/features/bookshelf/components/ShelfRenderer";
import { Book } from "@/types/book";

interface BookshelfRendererProps {
  width?: number;
  height?: number;
  booksByShelf: Book[][];
}

const BookshelfRenderer: React.FC<BookshelfRendererProps> = ({
  width,
  height = 86,
  booksByShelf,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      borderRadius: '16px',
      width: '100%',
    }}>
      {booksByShelf.map((books, idx) => (
        <ShelfRenderer
          key={idx}
          books={books}
          width={width}
          height={height}
        />
      ))}
    </div>
  );
};

export default BookshelfRenderer;
