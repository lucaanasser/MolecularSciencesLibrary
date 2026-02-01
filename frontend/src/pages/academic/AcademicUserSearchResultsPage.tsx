import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserFiltersPanel } from "@/components/academic/UserFiltersPanel";
import { MobileUserFiltersDrawer } from "@/components/academic/MobileUserFiltersDrawer";
import { UserResultsList } from "@/components/academic/UserResultsList";
import { GooglePagination } from "@/components/academic/GooglePagination";
import {
  searchUsers,
  type UserSearchResult,
  type UserSearchFilters,
} from "@/services/UsersService";

const RESULTS_PER_PAGE = 15;

/**
 * Página de resultados de busca de usuários estilo Google
 * Exibe usuários com filtros laterais e paginação
 */
const AcademicUserSearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  // Estados de filtros
  const [turmas, setTurmas] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [disciplinaFilter, setDisciplinaFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Dados
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTurmas, setAvailableTurmas] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCursos, setAvailableCursos] = useState<string[]>([]);

  // Input de busca local
  const [searchInput, setSearchInput] = useState(query);

  // Buscar usuários com filtros aplicados
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Monta filtros para a API
        const filters: UserSearchFilters = {};
        if (turmas.length > 0) filters.turma = turmas[0]; // API suporta 1 por vez
        if (disciplinaFilter) filters.disciplina = disciplinaFilter;
        
        // Busca todos os usuários que correspondem à query e filtros
        const results = await searchUsers(query, 1000, filters);
        setAllUsers(results);

        // Extrai opções únicas para os filtros
        const uniqueTurmas = Array.from(
          new Set(results.map((u) => u.class).filter(Boolean) as string[])
        ).sort();
        setAvailableTurmas(uniqueTurmas);

        const uniqueCursos = Array.from(
          new Set(results.map((u) => u.curso_origem).filter(Boolean) as string[])
        ).sort();
        setAvailableCursos(uniqueCursos);

        const allTags = results.flatMap((u) => u.tags || []);
        const uniqueTags = Array.from(new Set(allTags))
          .sort()
          .slice(0, 50); // Limita a 50 tags mais comuns
        setAvailableTags(uniqueTags);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        setAllUsers([]);
        setAvailableTurmas([]);
        setAvailableTags([]);
        setAvailableCursos([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchUsers();
    } else {
      setAllUsers([]);
      setAvailableTurmas([]);
      setAvailableTags([]);
      setAvailableCursos([]);
    }
  }, [query, turmas, disciplinaFilter]);

  // Filtrar usuários client-side (filtros multi-select)
  const filteredUsers = useMemo(() => {
    let filtered = allUsers;

    // Filtro de turmas (multi-select)
    if (turmas.length > 1) {
      filtered = filtered.filter((u) => u.class && turmas.includes(u.class));
    }

    // Filtro de curso
    if (cursos.length > 0) {
      filtered = filtered.filter((u) => u.curso_origem && cursos.includes(u.curso_origem));
    }

    // Filtro de tags (pelo menos uma tag deve corresponder)
    if (tags.length > 0) {
      filtered = filtered.filter((u) =>
        u.tags && tags.some((filterTag) =>
          u.tags!.some((userTag) =>
            userTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }, [allUsers, turmas, tags, cursos]);

  // Paginar resultados filtrados
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    const endIndex = startIndex + RESULTS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredUsers.length / RESULTS_PER_PAGE);

  // Limpar filtros
  const handleClearFilters = () => {
    setTurmas([]);
    setTags([]);
    setCursos([]);
    setDisciplinaFilter("");
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
  }, [turmas, tags, cursos, disciplinaFilter, query]);

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
                placeholder="Buscar usuários..."
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
              Aproximadamente <strong>{filteredUsers.length}</strong> resultado(s) para{" "}
              <strong>"{query}"</strong>
            </span>
          )}
        </div>

        {/* Drawer mobile de filtros */}
        <MobileUserFiltersDrawer
          turmas={turmas}
          setTurmas={setTurmas}
          tags={tags}
          setTags={setTags}
          cursos={cursos}
          setCursos={setCursos}
          disciplinaFilter={disciplinaFilter}
          setDisciplinaFilter={setDisciplinaFilter}
          availableTurmas={availableTurmas}
          availableTags={availableTags}
          availableCursos={availableCursos}
          onClear={handleClearFilters}
        />

        {/* Layout desktop: filtros + resultados */}
        <div className="flex">
          {/* Filtros laterais (desktop) */}
          <UserFiltersPanel
            turmas={turmas}
            setTurmas={setTurmas}
            tags={tags}
            setTags={setTags}
            cursos={cursos}
            setCursos={setCursos}
            disciplinaFilter={disciplinaFilter}
            setDisciplinaFilter={setDisciplinaFilter}
            availableTurmas={availableTurmas}
            availableTags={availableTags}
            availableCursos={availableCursos}
            onClear={handleClearFilters}
          />

          {/* Resultados */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-[#4285F4]" size={32} />
              </div>
            ) : paginatedUsers.length > 0 ? (
              <>
                <UserResultsList
                  results={paginatedUsers}
                  searchQuery={query}
                />
                {totalPages > 1 && (
                  <GooglePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg mb-4">
                  Nenhum usuário encontrado para "{query}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicUserSearchResultsPage;
