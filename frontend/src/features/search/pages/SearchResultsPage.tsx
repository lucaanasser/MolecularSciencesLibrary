/**
 * Página de resultados de busca.
 *
 * Exibe:
 * - Resultados paginados.
 * - Permite aplicar filtros (opcional).
 * - Exibe barra de busca no topo.
 *
 * Props (SearchResultsPageProps): veja types/index.ts.
 */

import { SearchResultsPageProps, SearchPanel, MolecoogleLogo, FiltersPanel, ResultItem, useSearchResultsController, Pagination } from "..";
import { useIsMobile } from "@/hooks/useMobile";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";

export default function SearchResultsPage(props: SearchResultsPageProps) {
  
  const {
    fields,
    searchProps,
    currentPage,
    totalPages,
    setCurrentPage,
    query,
    results,
    total,
    loading,
    filterProps,
  } = useSearchResultsController(props);

  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="content-container">

      {/* Barra de busca no topo */}
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-normal gap-4">
        <MolecoogleLogo onLogoClick={searchProps?.onLogoClick} />
        <div className="w-full max-w-3xl">
          <SearchPanel {...searchProps} size="md" />      
        </div>
      </div>


      {/* Contagem de resultados */}
      <div className="my-4 flex flex-row items-center justify-between">
        <span className="text-lg font-semibold leading-tight">
          {total > 0
            ? `${total} resultado${total > 1 ? "s" : ""} para "${query}"`
            : `Nenhum resultado para "${query}"`}
        </span>
        
        {/* Filtro para mobile (drawer) */}
        {isMobile && filterProps && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir filtros"
            >
              <FilterIcon className="w-5 h-5" />
            </Button>
            <FiltersPanel {...filterProps} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
          </>
        )}
      </div>

      <div className="flex flex-row">
        {/* Filtros para desktop (sidebar) */}
        {!isMobile && filterProps && (
          <FiltersPanel {...filterProps}/>
        )}

        {/* Lista de resultados */}
        <div className="w-full max-w-3xl space-y-4">
          {results.map((item, idx) => (
            <ResultItem
              key={item.id || item._id}
              result={item}
              fields={fields}
              searchQuery={query}
            />
          ))}
        </div>
      </div>

      {/* Paginação */}
      <div className="-mt-10">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageClick={setCurrentPage}
      />
      </div>
    </div>
  );
}