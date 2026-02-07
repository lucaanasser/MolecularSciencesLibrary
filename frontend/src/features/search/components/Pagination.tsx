import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MolecoogleLogo} from "@/features/search/components/MolecoogleLogo";

/* Função auxiliar que retorna os números das páginas visíveis */
const getPageNumbers = (currentPage, totalPages) => {
  const pages: number[] = [];
  const maxVisible = 10;
  const half = Math.floor(maxVisible / 2);

  let start = currentPage - half;
  let end = currentPage + half - 1;
  
  if (start < 1) {
    end += 1 - start;
    start = 1;
  }
  if (end > totalPages) {
    start -= end - totalPages;
    end = totalPages;
  }
  start = Math.max(start, 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
};

/* Props do componente de paginação */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/* Componente de paginação com setas e logo interativa */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  
  // Configuração das páginas exibidas
  if (totalPages <= 1) return null;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-row items-end justify-center gap-2 border-b">
      
      {/* Seta para a esquerda */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="mr-0.5 pt-16 text-#4285F4 font-medium cursor-pointer"
          aria-label="Página anterior"
        >
          <div className="flex flex-col items-end">
            <ChevronLeft size={24} />
            <span className="pt-1 md:pt-3 hover:underline">Anterior</span>
          </div> 
        </button>
      )}

      {/* Logo interativa com paginação integrada */}
      <MolecoogleLogo
        pagination
        fontSize="text-2xl md:text-4xl"
        pages={pageNumbers}
        currentPage={currentPage}
        onClick={onPageChange}
      />

      {/* Seta para a direita */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="mr-0.5 pt-16 text-#4285F4 font-medium cursor-pointer"
          aria-label="Página seguinte"
        >
          <div className="flex flex-col items-start">
            <ChevronRight size={24} />
            <span className="pt-1 md:pt-3 hover:underline">Mais</span>
          </div>
        </button>
      )}

    </div>
  );
};

