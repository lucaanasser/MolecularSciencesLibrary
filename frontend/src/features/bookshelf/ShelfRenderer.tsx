
import React, { useRef, useState, useLayoutEffect } from "react";
import BookRenderer from "@/features/bookshelf/BookRenderer";
import { Book } from "@/types/VirtualBookshelf";

interface BookWithDimensions extends Book {
  width: number;
  height: number;
}

interface ShelfProps {
  books: Book[];
  width?: number; // largura total da estante em px
  height?: number; // altura máxima da estante em px
}

// Função utilitária para gerar larguras e alturas harmoniosas
function calculateBookDimensions(
  books: Book[],
  shelfWidth: number,
  shelfHeight: number
): BookWithDimensions[] {
  if (books.length === 0) return [];

  // Desconta o padding do container (8px de cada lado)
  // e as margens dos livros (mx-0.5 = 2px de cada lado = 4px por livro)
  const bookMargins = books.length * 4;
  const availableWidth = shelfWidth - 16 - bookMargins;

  // Parâmetros de variação
  const minHeight = Math.round(shelfHeight * 0.7);
  const maxHeight = Math.round(shelfHeight * 0.98);

  // Ocupar ~90% da largura disponível
  const targetWidth = availableWidth * 0.9;
  
  // Calcula a largura base por livro
  const baseWidth = targetWidth / books.length;
  
  // Define limites absolutos para parecer com livros reais
  const absoluteMinWidth = 16;
  const absoluteMaxWidth = 30;
  
  // Limites dinâmicos (com variação de ±30%) respeitando os absolutos
  const minBookWidth = Math.max(absoluteMinWidth, baseWidth * 0.7);
  const maxBookWidth = Math.min(absoluteMaxWidth, baseWidth * 1.3);

  // Gera larguras iniciais com variação
  const initialWidths = books.map(() => {
    const variation = (Math.random() - 0.5) * 0.4; // ±20% de variação
    const width = baseWidth * (1 + variation);
    return Math.max(minBookWidth, Math.min(maxBookWidth, width));
  });

  // Calcula o total e ajusta proporcionalmente para atingir o targetWidth
  const totalInitialWidth = initialWidths.reduce((sum, w) => sum + w, 0);

  // Gera larguras e alturas finais
  return books.map((book, i) => {
    const width = Math.round(initialWidths[i]);
    const height = Math.round(minHeight + Math.random() * (maxHeight - minHeight));
    return { ...book, width, height };
  });
}

const ShelfRenderer: React.FC<ShelfProps> = ({ books, width, height = 160 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>(0);
  
  // Mede a largura real do container
  useLayoutEffect(() => {
    if (!width && containerRef.current) {
      const updateWidth = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setMeasuredWidth(rect.width);
        }
      };
      
      updateWidth();
      
      const resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(containerRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, [width]);

  const shelfWidth = width ?? measuredWidth;
  const booksWithDimensions = shelfWidth > 0 
    ? calculateBookDimensions(books, shelfWidth, height)
    : [];
  const isEmpty = books.length === 0;

  return (
    <div
      ref={containerRef}
      style={{
        width: width ? `${width}px` : '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Área dos livros */}
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: isEmpty ? 'center' : 'flex-start',
          padding: '0 8px',
          overflowX: 'auto',
        }}
      >
        {isEmpty ? (
          <span style={{ color: '#9ca3af', fontStyle: 'italic', marginBottom: 8 }}>
            Prateleira vazia
          </span>
        ) : (
          booksWithDimensions.map((book) => (
            <BookRenderer
              key={book.id}
              book={book}
              height={book.height}
              width={book.width}
            />
          ))
        )}
      </div>
      {/* Linha da prateleira */}
      <div
        style={{
          height: '4px',
          backgroundColor: '#8B4513',
          borderRadius: '0 0 4px 4px',
        }}
      />
    </div>
  );
};

export default ShelfRenderer;
