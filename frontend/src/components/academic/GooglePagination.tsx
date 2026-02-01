import React from "react";
import { ChevronRight } from "lucide-react";

interface GooglePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Componente de paginação estilo Google
 * Logo com o's variáveis + números de página
 */
export const GooglePagination: React.FC<GooglePaginationProps> = ({
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
    <div className="flex flex-col items-center gap-2 py-8">
      {/* Logo Molecoooogle com seta */}
      <div className="flex items-center gap-0">
        {/* M */}
        <span className="text-4xl font-bold text-[#4285F4]">M</span>
        {/* o (primeiro, do Molec) */}
        <span className="text-4xl font-bold text-[#EA4335]">o</span>
        {/* l */}
        <span className="text-4xl font-bold text-[#FBBC05]">l</span>
        {/* e */}
        <span className="text-4xl font-bold text-[#4285F4]">e</span>
        {/* c */}
        <span className="text-4xl font-bold text-[#34A853]">c</span>
        {/* o's variáveis */}
        {Array.from({ length: oCount }).map((_, i) => {
          const colors = ['#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
          return (
            <span key={i} className="text-4xl font-bold" style={{ color: colors[i % colors.length] }}>
              o
            </span>
          );
        })}
        {/* gle */}
        <span className="text-4xl font-bold text-[#4285F4]">g</span>
        <span className="text-4xl font-bold text-[#34A853]">l</span>
        <span className="text-4xl font-bold text-[#EA4335]">e</span>
        
        {/* Seta próximo ao lado do logo */}
        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Números de página */}
      <div className="flex items-center gap-0">
        {pageNumbers.map((pageNum, idx) => {
          const isActive = pageNum === currentPage;

          return (
            <button
              key={idx}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 text-sm ${
                isActive
                  ? "text-[#EA4335] font-bold"
                  : "text-[#4285F4] hover:underline"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Mais */}
        {totalPages > 10 && currentPage <= totalPages - 6 && (
          <button
            onClick={() => onPageChange(Math.min(currentPage + 10, totalPages))}
            className="px-3 py-1 text-sm text-[#4285F4] hover:underline"
          >
            Mais
          </button>
        )}
      </div>
    </div>
  );
};
