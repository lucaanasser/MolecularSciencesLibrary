import React from "react";
import { ChevronRight } from "lucide-react";
import { MolecoooogleLogo } from "@/features/search/components/MolecoooogleLogo";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Componente de paginação estilo Google
 * Logo com o's variáveis + números de página
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 10;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 6) {
        for (let i = 1; i <= 10; i++) pages.push(i);
      } else if (currentPage >= totalPages - 5) {
        for (let i = totalPages - 9; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 4; i <= currentPage + 5; i++) pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Quantidade de o's baseada no total de páginas (como no Google)
  const oCount = Math.min(Math.max(totalPages, 2), 10);

  return (
    <div className="flex flex-col items-center gap-1 pt-4 md:pt-8">
      
      {/* Logo Molecoooogle com setas */}
      <div className="flex items-center gap-0">

        {currentPage > 1 && (
          <Button
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            className="mr-0.5 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight size={24} className="rotate-180" />
          </Button>
        )}
 
        <MolecoooogleLogo oCount={oCount} textSize="text-2xl md:text-4xl" />
 
        {currentPage < totalPages && (
          <Button
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            className="ml-0.5 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight size={24} />
          </Button>
        )}
      </div>

      {/* Números das páginas */}
      <div className="flex items-center gap-0">
        {pageNumbers.map((pageNum, idx) => {
          const isActive = pageNum === currentPage;

          return (
            <Button
              size="sm"
              key={idx}
              onClick={() => onPageChange(pageNum)}
              className={`px-1.5 md:px-2 prose-sm font-medium hover:transform-none ${
                isActive
                  ? "text-google-red font-bold"
                  : "text-google-blue hover:underline"
              }`}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Mais */}
        {totalPages > 10 && currentPage <= totalPages - 6 && (
          <Button
            size="sm"
            onClick={() => onPageChange(Math.min(currentPage + 10, totalPages))}
            className="font-medium text-cm-blue hover:transform-none"
          >
            Mais
          </Button>
        )}
      </div>
    </div>
  );
};
