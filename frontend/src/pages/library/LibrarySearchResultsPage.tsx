import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { SearchResultsLayout } from "@/features/search/SearchResultsLayout";
import { BookResultsList } from "@/components/library/BookResultsList";
import { BookFiltersPanel } from "@/features/_books/BookFiltersPanel";
import { BookFiltersDrawer } from "@/features/_books/BookFiltersDrawer";
import { useLibrarySearch } from "@/features/_books/useLibrarySearch";
import { logger } from "@/utils/logger";

/**
 * Página de resultados de busca de LIVROS estilo Google
 * Usa o layout unificado com mesma estética da página de disciplinas
 * 
 * FEATURES:
 * - Paginação estilo Google (15 resultados por página)
 * - Sticky header com logo pequeno + busca
 * - Filtros laterais (desktop) + drawer (mobile)
 * - Resultados em formato Google (cards clicáveis)
 * - Highlight de status e disponibilidade
 * - Contagem total de resultados
 */

const RESULTS_PER_PAGE = 15;

const LibrarySearchResultsPage: React.FC = () => {
  // Log de início da renderização
  logger.info("🔵 [LibrarySearchResultsPage] Renderizando página de resultados de busca de livros");
  
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchInput, setSearchInput] = useState(query);

  // Hook de busca de livros
  const {
    books: allBooks,
    isLoading,
    availableStatus,
    availableAreas,
    availableLanguages,
  } = useLibrarySearch({ q: query, limit: 500, offset: 0 });

  // Filtrar livros client-side
  const filteredBooks = useMemo(() => {
    let filtered = allBooks;
    if (statusFilter.length > 0) { filtered = filtered.filter((b) => statusFilter.includes(b.status)); }
    if (areaFilter.length > 0) { filtered = filtered.filter((b) => areaFilter.includes(b.area)); }
    if (languageFilter.length > 0) { filtered = filtered.filter((b) => languageFilter.includes(b.language)); }
    return filtered;
  }, [allBooks, statusFilter, areaFilter, languageFilter]);

  // Paginar resultados filtrados
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    const endIndex = startIndex + RESULTS_PER_PAGE;
    return filteredBooks.slice(startIndex, endIndex);
  }, [filteredBooks, currentPage]);

  // Calcular total de páginas baseado nos resultados filtrados
  const totalPages = Math.ceil(filteredBooks.length / RESULTS_PER_PAGE);

  // Limpar filtros
  const handleClearFilters = () => {
    setStatusFilter([]);
    setAreaFilter([]);
    setLanguageFilter([]);
    setCurrentPage(1);
  };

  // Nova busca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
      setCurrentPage(1);
    }
  };

  // Mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Resetar página ao mudar filtros ou query
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, areaFilter, languageFilter, query]);

  return (
    <SearchResultsLayout
      query={query}
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      onSearch={handleSearch}
      searchPlaceholder="Buscar livros..."
      SearchIcon={BookOpen}
      logoLink="/biblioteca/buscar"
      totalCount={filteredBooks.length}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      isLoading={isLoading}
      hasResults={paginatedBooks.length > 0}
      filtersPanel={
        <BookFiltersPanel
          status={statusFilter}
          setStatus={setStatusFilter}
          area={areaFilter}
          setArea={setAreaFilter}
          language={languageFilter}
          setLanguage={setLanguageFilter}
          availableStatus={availableStatus}
          availableAreas={availableAreas}
          availableLanguages={availableLanguages}
          onClear={handleClearFilters}
        />
      }
      mobileFiltersDrawer={
        <BookFiltersDrawer
          status={statusFilter}
          setStatus={setStatusFilter}
          area={areaFilter}
          setArea={setAreaFilter}
          language={languageFilter}
          setLanguage={setLanguageFilter}
          availableStatus={availableStatus}
          availableAreas={availableAreas}
          availableLanguages={availableLanguages}
          onClear={handleClearFilters}
        />
      }
      emptyMessage={
        <p className="text-gray-600 text-lg">
          Nenhum livro encontrado para "{query}"
        </p>
      }
    >
      <BookResultsList results={paginatedBooks} searchQuery={query} />
    </SearchResultsLayout>
  );
};

export default LibrarySearchResultsPage;