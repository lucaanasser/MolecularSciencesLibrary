/**
 * Componente de paginação para navegar entre páginas de resultados.
 *
 * Props:
 * - currentPage: Página atual.
 * - totalPages: Total de páginas.
 * - onPageClick: Callback ao trocar de página.
 */

import { MolecoogleLogo } from "..";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageClick,}: {
  currentPage: number;
  totalPages: number;
  onPageClick: (page: number) => void;
}) {
  
  if (totalPages <= 1) return <></>;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-row items-end justify-center gap-2">
      
      {/* Seta para a esquerda */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageClick(currentPage - 1)}
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
        pagination={true}
        fontSize="text-2xl md:text-4xl"
        pages={pageNumbers}
        currentPage={currentPage}
        onPageClick={onPageClick}
      />

      {/* Seta para a direita */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageClick(currentPage + 1)}
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

// Função auxiliar que retorna os números das páginas visíveis
const getPageNumbers = (currentPage: number, totalPages: number) => {
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
