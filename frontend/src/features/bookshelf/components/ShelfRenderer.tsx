import React, { useRef, useState, useLayoutEffect } from "react";
import BookRenderer from "@/features/bookshelf/components/BookRenderer";
import { Book } from "@/types/book";

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

  // Ocupar 95% da largura disponível
  const targetWidth = availableWidth * 0.95;
  
  // Define limites absolutos para parecer com livros reais
  const absoluteMinWidth = 12;
  const absoluteMaxWidth = 35;

  // Gera fatores de variação aleatórios para cada livro (entre 0.8 e 1.2)
  const variationFactors = books.map(() => 0.8 + Math.random() * 0.4);
  
  // Calcula a largura base necessária para atingir targetWidth
  const totalVariation = variationFactors.reduce((sum, f) => sum + f, 0);
  const baseWidth = targetWidth / totalVariation;
  
  // Aplica os fatores de variação, respeitando os limites absolutos
  const widths = variationFactors.map((factor) => {
    const width = baseWidth * factor;
    return Math.max(absoluteMinWidth, Math.min(absoluteMaxWidth, width));
  });

  // Gera larguras e alturas finais
  return books.map((book, i) => {
    const width = Math.round(widths[i]);
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
          height: `${height + 8}px`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: isEmpty ? 'center' : 'flex-start',
          padding: '8px 8px 2px 20px',
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
