import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Search, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DisciplineFiltersPanel } from "@/components/academic/DisciplineFiltersPanel";
import { MobileFiltersDrawer } from "@/components/academic/MobileFiltersDrawer";
import { DisciplineResultsList } from "@/components/academic/DisciplineResultsList";
import { GooglePagination } from "@/components/academic/GooglePagination";
import {
  getDisciplinesWithPagination,
  getCampi,
  getUnidades,
  countDisciplines,
  type Discipline,
} from "@/services/DisciplinesService";
import { getAggregatedRatings } from "@/services/DisciplineEvaluationsService";

const RESULTS_PER_PAGE = 15;

interface DisciplineWithRating extends Discipline {
  avaliacao?: number | null;
}

/**
 * Página de resultados de busca estilo Google
 * Exibe disciplinas com filtros laterais e paginação
 */
const AcademicSearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
        console.error("Erro ao carregar opções de filtros:", error);
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
        console.error("Erro ao buscar disciplinas:", error);
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
    <div className="min-h-screen bg-default-bg">
      {/* Header de busca fixo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo pequeno */}
          <Link to="/academico/buscar" className="flex items-center gap-0.5 flex-shrink-0">
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
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar disciplinas..."
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
        <MobileFiltersDrawer
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

        {/* Layout desktop: filtros + resultados */}
        <div className="flex">
          {/* Filtros laterais (desktop) */}
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

          {/* Resultados */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-[#4285F4]" size={32} />
              </div>
            ) : filteredDisciplines.length > 0 ? (
              <>
                <DisciplineResultsList
                  results={filteredDisciplines}
                  searchQuery={query}
                />
                <GooglePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="text-center py-16">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicSearchResultsPage;
