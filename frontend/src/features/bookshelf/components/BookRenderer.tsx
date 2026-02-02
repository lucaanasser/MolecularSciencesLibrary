import React, { useState, useRef } from 'react';
import BookInfoCard from '@/features/bookshelf/components/BookInfoCard';
import { Book } from '@/types/book';

export interface BookRendererProps {
  book: Book;
  height: number;
  width: number;
}

const AREA_CLASSES: Record<string, string> = {
  BIO: 'bg-cm-green',
  QUI: 'bg-cm-yellow',
  FIS: 'bg-cm-orange',
  MAT: 'bg-cm-red',
  CMP: 'bg-cm-blue',
  VAR: 'bg-library-purple',
};

const BookRenderer: React.FC<BookRendererProps> = ({
  book,
  height,
  width,
}) => {
  const [hover, setHover] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const [cardPos, setCardPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const { area, available, is_reserved } = book;

  const handleMouseEnter = (e: React.MouseEvent) => {
    setHover(true);
    const rect = bookRef.current?.getBoundingClientRect();
    if (rect) {
      setCardPos({
        left: rect.left + window.scrollX + rect.width + 8,
        top: rect.top + window.scrollY - 12,
      });
    }
  };
  const handleMouseLeave = () => setHover(false);

  const areaClass = area && AREA_CLASSES[area] ? AREA_CLASSES[area] : 'bg-gray-400';
  const unavailableClass = (!available || is_reserved) ? 'opacity-50 grayscale' : '';

  return (
    <>
      <div
        ref={bookRef}
        className={`rounded-[3px] shadow-md mx-0.5 mb-0.5 inline-block cursor-pointer transition-transform duration-150 ${areaClass} ${unavailableClass}`}
        style={{
          height: `${height}px`,
          width: `${width}px`,
          transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {hover && (
         <div
           style={{
             position: 'absolute',
             left: cardPos.left,
             top: cardPos.top,
             pointerEvents: 'none',
           }}
         >
           <BookInfoCard book={book} />
         </div>
       )}
     </>
   );
};

export default BookRenderer;
