import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Loader2, LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GooglePagination } from "@/components/academic/GooglePagination";

interface UnifiedSearchResultsLayoutProps {
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
export const UnifiedSearchResultsLayout: React.FC<UnifiedSearchResultsLayoutProps> = ({
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
  return (
    <div className="min-h-screen bg-default-bg">
      {/* Header de busca fixo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo pequeno - Molecoooogle */}
          <Link to={logoLink} className="flex items-center gap-0.5 flex-shrink-0">
            <span className="text-2xl font-bold text-[#4285F4]">M</span>
            <span className="text-2xl font-bold text-[#EA4335]">o</span>
            <span className="text-2xl font-bold text-[#FBBC05]">l</span>
            <span className="text-2xl font-bold text-[#4285F4]">e</span>
            <span className="text-2xl font-bold text-[#34A853]">c</span>
            <span className="text-2xl font-bold text-[#EA4335]">o</span>
            <span className="text-2xl font-bold text-[#4285F4]">o</span>
            <span className="text-2xl font-bold text-[#FBBC05]">g</span>
            <span className="text-2xl font-bold text-[#34A853]">l</span>
            <span className="text-2xl font-bold text-[#EA4335]">e</span>
          </Link>

          {/* Barra de busca */}
          <form onSubmit={onSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10 rounded-full border-gray-300 focus:border-[#4285F4]"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info da busca */}
        <div className="mb-4 text-sm text-gray-600">
          {!isLoading && (
            <span>
              Aproximadamente <strong>{totalCount}</strong> resultado(s) para{" "}
              <strong>"{query}"</strong>
            </span>
          )}
        </div>

        {/* Drawer mobile de filtros */}
        {mobileFiltersDrawer}

        {/* Layout desktop: filtros + resultados */}
        <div className="flex">
          {/* Filtros laterais (desktop) */}
          {filtersPanel}

          {/* Resultados */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-[#4285F4]" size={32} />
              </div>
            ) : hasResults ? (
              <>
                {children}
                {totalPages > 1 && (
                  <GooglePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-16">
                {emptyMessage || (
                  <p className="text-gray-600 text-lg">
                    Nenhum resultado encontrado para "{query}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSearchResultsLayout;
