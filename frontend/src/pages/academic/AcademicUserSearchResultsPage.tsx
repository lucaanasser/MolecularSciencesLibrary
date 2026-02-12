import React, { useState, useEffect, useMemo } from "react";
import { logger } from "@/utils/logger";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { SearchResultsLayout } from "@/features/search/SearchResultsLayout";
import { UserFiltersPanel } from "@/features/_users/UserFiltersPanel";
import { UserFiltersDrawer } from "@/features/_users/UserFiltersDrawer";
import { UserResultsList } from "@/components/academic/UserResultsList";
import {
  searchUsers,
  type UserSearchResult,
  type UserSearchFilters,
} from "@/services/OldUsersService";

/**
 * Página de resultados de busca de USUÁRIOS estilo Google
 * Usa o layout unificado compartilhado com Disciplinas e Livros
 * 
 * FEATURES:
 * - Paginação estilo Google (15 resultados por página)
 * - Sticky header com logo pequeno + busca
 * - Filtros laterais (desktop) ou drawer (mobile)
 * - Tags do perfil
 * - Contagem total de resultados
 */

const RESULTS_PER_PAGE = 15;

const AcademicUserSearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // Estados de filtros
  const [turmas, setTurmas] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [disciplinaFilter, setDisciplinaFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Dados
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
      if (!query) {
        setAllUsers([]);
        setAvailableTurmas([]);
        setAvailableTags([]);
        setAvailableCursos([]);
        return;
      }

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
        logger.error("Erro ao buscar usuários:", error);
        setAllUsers([]);
        setAvailableTurmas([]);
        setAvailableTags([]);
        setAvailableCursos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
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
    <SearchResultsLayout
      query={query}
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      onSearch={handleSearch}
      searchPlaceholder="Buscar usuários..."
      SearchIcon={Search}
      logoLink="/academico/buscar"
      totalCount={filteredUsers.length}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      isLoading={isLoading}
      hasResults={paginatedUsers.length > 0}
      filtersPanel={
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
      }
      mobileFiltersDrawer={
        <UserFiltersDrawer
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
      }
      emptyMessage={
        <p className="text-gray-600 text-lg">
          Nenhum usuário encontrado para "{query}"
        </p>
      }
    >
      <UserResultsList results={paginatedUsers} searchQuery={query} />
    </SearchResultsLayout>
  );
};

export default AcademicUserSearchResultsPage;
