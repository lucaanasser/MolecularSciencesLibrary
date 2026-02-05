import React from "react";
import { Link } from "react-router-dom";
import type { Book } from "@/types/book";

interface BookResultsListProps {
  results: Book[];
  searchQuery: string;
}

/**
 * Lista de resultados de livros estilo Google
 * Links azuis com título, código, autor e status
 * Mesma estética do DisciplineResultsList
 */
export const BookResultsList: React.FC<BookResultsListProps> = ({
  results,
  searchQuery,
}) => {
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    // Escapa caracteres especiais de regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={i} className="font-bold">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  // Helper para badge de status com cores
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      'disponível': { bg: 'bg-green-100', text: 'text-green-700' },
      'emprestado': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'atrasado': { bg: 'bg-red-100', text: 'text-red-700' },
      'reservado': { bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    const config = statusConfig[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`text-xs px-2 py-0.5 ${config.bg} ${config.text} rounded-full`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {results.map((book) => (
        <div key={book.id} className="pb-4 border-b border-gray-200 last:border-0">
          {/* Link principal estilo Google */}
          <Link
            to={`/biblioteca/livro/${book.id}`}
            className="text-xl text-[#1a0dab] hover:underline visited:text-[#681da8] font-normal"
          >
            {highlightMatch(book.title, searchQuery)}
            {book.subtitle && (
              <span className="text-gray-600"> - {book.subtitle}</span>
            )}
          </Link>

          {/* Informações secundárias */}
          <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
            {/* Código - estilo URL verde do Google */}
            <span className="text-[#006621]">{book.code}</span>

            {/* Autor */}
            {book.authors && (
              <span className="text-gray-600">{book.authors}</span>
            )}

            {/* Status com badge colorido */}
            {book.status && getStatusBadge(book.status)}

            {/* Área */}
            {book.area && (
              <span className="text-xs px-2 py-0.5 bg-academic-blue/10 text-academic-blue rounded-full">
                {book.area}
              </span>
            )}

            {/* Idioma */}
            {book.language && (
              <span className="text-gray-500">{book.language}</span>
            )}
          </div>

          {/* Metadados adicionais (edição, volume) */}
          {(book.edition || book.volume) && (
            <div className="text-sm text-gray-500 mt-1">
              {book.edition && <span>{book.edition}</span>}
              {book.edition && book.volume && <span> • </span>}
              {book.volume && <span>Volume {book.volume}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookResultsList;
