import React from "react";
import { ShelfRenderer } from "..";
import { Book } from "@/types/book";

interface BookshelfRendererProps {
  width?: number;
  height?: number;
  booksByShelf: Book[][];
}

export default function BookshelfRenderer({ width, height = 86, booksByShelf }: BookshelfRendererProps) {
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