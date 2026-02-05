import React, { useEffect, useState, ReactNode } from "react";
import { Loader2, LucideIcon } from "lucide-react";
import SearchHeader from "@/features/search/molecoogle/SearchHeader";
import { Pagination } from "@/features/search/molecoogle/Pagination";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

// Log de início de renderização
logger.info("🔵 [UnifiedSearchResultsLayout] Renderizando layout de resultados");

interface SearchResultsLayoutProps {
  /** Query de busca atual */
  query: string;
  /** Input de busca controlado */
  searchInput: string;
  /** Setter para o input de busca */
  setSearchInput: (value: string) => void;
  /** Handler para submit da busca */
  onSearch: (e: React.FormEvent) => void;
  /** Placeholder da barra de busca */
  searchPlaceholder: string;
  /** Ícone da barra de busca */
  SearchIcon: LucideIcon;
  /** Link de retorno do logo */
  logoLink: string;
  /** Total de resultados */
  totalCount: number;
  /** Página atual */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Handler para mudança de página */
  onPageChange: (page: number) => void;
  /** Estado de loading */
  isLoading: boolean;
  /** Componente de filtros desktop (sidebar) */
  filtersPanel?: ReactNode;
  /** Componente de filtros mobile (drawer) */
  mobileFiltersDrawer?: ReactNode;
  /** Lista de resultados renderizada */
  children: ReactNode;
  /** Mensagem quando não há resultados */
  emptyMessage?: ReactNode;
  /** Se há resultados */
  hasResults: boolean;
}

/**
 * Layout unificado para páginas de resultados de busca estilo Google
 * Reutilizado por: Disciplinas, Livros e Usuários
 * 
 * FEATURES:
 * - Header sticky com logo Molecoooogle + barra de busca
 * - Sidebar de filtros (desktop) + drawer (mobile)
 * - Paginação estilo Google
 * - Contagem de resultados
 * - Estado de loading centralizado
 */
export const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  query,
  searchInput,
  setSearchInput,
  onSearch,
  searchPlaceholder,
  SearchIcon,
  logoLink,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  filtersPanel,
  mobileFiltersDrawer,
  children,
  emptyMessage,
  hasResults,
}) => {
  
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  return (
    <div className="bg-white min-h-screen">
      <div className="content-container pt-0">
        
        {/* Header de busca */}
        <SearchHeader
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={onSearch}
          searchPlaceholder={searchPlaceholder}
          SearchIcon={SearchIcon}
          logoLink={logoLink}
        />

        {/* Informações da busca */}
        {!isLoading && (
          <div className={cn(isMobile ? "flex items-center gap-1" : null, "prose-sm text-gray-700 mb-4")}>
            <span>
              Aproximadamente <strong>{totalCount}</strong> resultado(s) para{" "}
              <strong>"{query}"</strong>
            </span>
            {isMobile && mobileFiltersDrawer ? (
              <span className="ml-1">{mobileFiltersDrawer}</span>
            ) : null}
          </div>
        )}

        {/* Mensagem de carregamento */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-cm-blue" size={32} />
          </div>
        ) : <></>}

        {/* Filtros + Resultados */}          
        <div className="flex">
          {!isMobile && filtersPanel}
          {hasResults && (
            <div className="flex-1 min-w-0">
              {children}
            </div>
          )}
        </div>

        {hasResults 
          ? (<>
              {/* Botões de mudança de página */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              )}
            </>) 
          : (
            <div className="flex justify-center py-16">
              {/* Mensagem de nenhum resultado */}
              {emptyMessage || (
                <p>
                  Nenhum resultado encontrado para "{query}"
                </p>
              )}
            </div>
          )}

      </div>
    </div>
  );
};

export default SearchResultsLayout;