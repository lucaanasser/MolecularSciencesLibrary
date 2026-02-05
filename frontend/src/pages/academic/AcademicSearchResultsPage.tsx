import React, { useState, useEffect, useMemo } from "react";
import { logger } from "@/utils/logger";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { SearchResultsLayout } from "@/features/search/molecoogle/SearchResultsLayout";
import { DisciplineFiltersPanel } from "@/features/search/_disciplines/DisciplineFiltersPanel";
import { DisciplineFiltersDrawer } from "@/features/search/_disciplines/DisciplineFiltersDrawer";
import { DisciplineResultsList } from "@/components/academic/DisciplineResultsList";
import {
  getDisciplinesWithPagination,
  getCampi,
  getUnidades,
  type Discipline,
} from "@/services/DisciplinesService";
import { getAggregatedRatings } from "@/services/DisciplineEvaluationsService";

/**
 * Página de resultados de busca de DISCIPLINAS estilo Google
 * Usa o layout unificado compartilhado com Livros e Usuários
 * 
 * FEATURES:
 * - Paginação estilo Google (15 resultados por página)
 * - Sticky header com logo pequeno + busca
 * - Filtros laterais (desktop) ou drawer (mobile)
 * - Avaliações com estrelas
 * - Highlight de termos de busca
 * - Contagem total de resultados
 */

const RESULTS_PER_PAGE = 15;

interface DisciplineWithRating extends Discipline {
  avaliacao?: number | null;
}

const AcademicSearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // Estados de filtros
  const [campus, setCampus] = useState<string[]>([]);
  const [unidade, setUnidade] = useState<string[]>([]);
  const [hasClasses, setHasClasses] = useState<boolean | null>(null);
  const [isPostgrad, setIsPostgrad] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Dados
  const [disciplines, setDisciplines] = useState<DisciplineWithRating[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCampi, setAvailableCampi] = useState<string[]>([]);
  const [availableUnidades, setAvailableUnidades] = useState<string[]>([]);

  // Input de busca local
  const [searchInput, setSearchInput] = useState(query);

  // Calcular total de páginas
  const totalPages = Math.ceil(totalCount / RESULTS_PER_PAGE);

  // Carregar opções de filtros
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [campiData, unidadesData] = await Promise.all([
          getCampi(),
          getUnidades(),
        ]);
        setAvailableCampi(campiData);
        setAvailableUnidades(unidadesData);
      } catch (error) {
        logger.error("Erro ao carregar opções de filtros:", error);
      }
    };
    loadFilterOptions();
  }, []);

  // Buscar disciplinas
  useEffect(() => {
    const fetchDisciplines = async () => {
      setIsLoading(true);
      try {
        const filters = {
          search: query,
          campus: campus[0], // API aceita apenas um valor
          unidade: unidade[0],
          hasValidClasses: hasClasses || undefined,
          isPostgrad: isPostgrad || undefined,
        };

        const { disciplines: results, total } = await getDisciplinesWithPagination(
          filters,
          currentPage,
          RESULTS_PER_PAGE
        );

        // Buscar avaliações em paralelo
        const withRatings = await Promise.all(
          results.map(async (disc) => {
            try {
              const stats = await getAggregatedRatings(disc.codigo);
              return { ...disc, avaliacao: stats.media_geral };
            } catch {
              return { ...disc, avaliacao: null };
            }
          })
        );

        setDisciplines(withRatings);
        setTotalCount(total);
      } catch (error) {
        logger.error("Erro ao buscar disciplinas:", error);
        setDisciplines([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisciplines();
  }, [query, campus, unidade, hasClasses, isPostgrad, currentPage]);

  // Filtrar client-side para multi-select
  const filteredDisciplines = useMemo(() => {
    let filtered = disciplines;

    // Filtro multi-select de campus
    if (campus.length > 1) {
      filtered = filtered.filter((d) => d.campus && campus.includes(d.campus));
    }

    // Filtro multi-select de unidade
    if (unidade.length > 1) {
      filtered = filtered.filter((d) => d.unidade && unidade.includes(d.unidade));
    }

    return filtered;
  }, [disciplines, campus, unidade]);

  // Limpar filtros
  const handleClearFilters = () => {
    setCampus([]);
    setUnidade([]);
    setHasClasses(null);
    setIsPostgrad(null);
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

  // Resetar página ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [campus, unidade, hasClasses, isPostgrad, query]);

  return (
    <SearchResultsLayout
      query={query}
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      onSearch={handleSearch}
      searchPlaceholder="Buscar disciplinas..."
      SearchIcon={Search}
      logoLink="/academico/buscar"
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      isLoading={isLoading}
      hasResults={filteredDisciplines.length > 0}
      filtersPanel={
        <DisciplineFiltersPanel
          campus={campus}
          setCampus={setCampus}
          unidade={unidade}
          setUnidade={setUnidade}
          hasClasses={hasClasses}
          setHasClasses={setHasClasses}
          isPostgrad={isPostgrad}
          setIsPostgrad={setIsPostgrad}
          availableCampi={availableCampi}
          availableUnidades={availableUnidades}
          onClear={handleClearFilters}
        />
      }
      mobileFiltersDrawer={
        <DisciplineFiltersDrawer
          campus={campus}
          setCampus={setCampus}
          unidade={unidade}
          setUnidade={setUnidade}
          hasClasses={hasClasses}
          setHasClasses={setHasClasses}
          isPostgrad={isPostgrad}
          setIsPostgrad={setIsPostgrad}
          availableCampi={availableCampi}
          availableUnidades={availableUnidades}
          onClear={handleClearFilters}
        />
      }
      emptyMessage={
        <div>
          <p className="text-gray-600 text-lg mb-4">
            Nenhuma disciplina encontrada para "{query}"
          </p>
          <Link
            to="/academico/criar-disciplina"
            className="inline-flex items-center gap-2 text-[#4285F4] hover:underline"
          >
            <Plus size={18} />
            Adicionar disciplina de pós-graduação
          </Link>
        </div>
      }
    >
      <DisciplineResultsList
        results={filteredDisciplines}
        searchQuery={query}
      />
    </SearchResultsLayout>
  );
};

// Export default para uso direto
export default AcademicSearchResultsPage;

// Export nomeado para facilitar reuso em outros contextos
export { AcademicSearchResultsPage };
