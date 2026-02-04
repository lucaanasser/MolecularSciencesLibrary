import React, { useState, useRef, useEffect, useCallback } from "react";
import { logger } from "@/utils/logger";
import { Search, Clock, TrendingUp, Star, Users, Loader2, Plus, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  searchDisciplines,
  checkExactMatch,
  searchUsers,
  searchBooks,
  type DisciplineSearchResult,
  type UserSearchResult,
  type BookSearchResult,
  type SearchMode,
} from "@/services/SearchService";
import { getAggregatedRatings } from "@/services/DisciplineEvaluationsService";

/**
 * COMPONENTE REUTILIZÁVEL: MolecoogleSearchPage
 * 
 * Página de busca unificada estilo Google (Molecoogle) que suporta 3 modos:
 * - Disciplinas (modo acadêmico)
 * - Usuários (modo acadêmico)  
 * - Livros (modo biblioteca)
 * 
 * REUSO:
 * - Modo Acadêmico: <AcademicSearchPage /> (sem props, mostra todos os modos)
 * - Modo Biblioteca: <AcademicSearchPage fixedMode="livros" hideModeSwitcher />
 * 
 * PROPS:
 * - fixedMode: Fixa o modo de busca (desabilita troca)
 * - hideModeSwitcher: Oculta os botões de seleção de modo
 * 
 * FEATURES:
 * - Autocomplete em tempo real com debounce
 * - Navegação por teclado (setas, Enter, Esc)
 * - Buscas recentes (localStorage)
 * - Logo animado Molecoooogle
 * - Design minimalista estilo Google
 */

interface DisciplineWithRating extends DisciplineSearchResult {
  avaliacao?: number | null;
}

interface BookWithAvailability extends BookSearchResult {
  availability?: string;
}

interface SearchPageProps {
  /** Força um modo específico (desabilita troca de modo) */
  fixedMode?: SearchMode;
  /** Oculta os botões de seleção de modo */
  hideModeSwitcher?: boolean;
}

/**
 * Página de busca unificada - Estilo Google (Molecoogle).
 * Suporta 3 modos: disciplinas, usuários e livros.
 * Pode ser configurada para modo fixo (ex: biblioteca só busca livros).
 */
const AcademicSearchPage: React.FC<SearchPageProps> = ({ 
  fixedMode,
  hideModeSwitcher = false 
}) => {
  logger.info("🔵 [AcademicSearchPage] Renderizando página de busca unificada", { fixedMode, hideModeSwitcher });

  const navigate = useNavigate();
  const location = useLocation();
  
  // Determina o modo inicial: fixedMode tem prioridade, senão baseado na rota
  const getInitialMode = (): SearchMode => {
    if (fixedMode) return fixedMode;
    if (location.pathname.includes('/biblioteca/buscar')) return 'livros';
    return 'disciplinas';
  };
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>(getInitialMode);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [disciplineSuggestions, setDisciplineSuggestions] = useState<DisciplineWithRating[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserSearchResult[]>([]);
  const [bookSuggestions, setBookSuggestions] = useState<BookWithAvailability[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Buscas recentes (localStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("academicRecentSearches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Disciplinas populares (estático por enquanto)
  const popularDisciplines = [
    { codigo: "MAC0110", nome: "Introdução à Computação" },
    { codigo: "MAT0111", nome: "Cálculo Diferencial e Integral I" },
    { codigo: "4302111", nome: "Física I" },
  ];

  // Salvar busca recente
  const saveRecentSearch = useCallback((term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("academicRecentSearches", JSON.stringify(updated));
  }, [recentSearches]);

  // Buscar disciplinas na API com debounce
  const searchDisciplinesDebounced = useCallback(async (query: string) => {
    if (query.length < 2) {
      setDisciplineSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchDisciplines(query, 8);
      
      // Buscar ratings para cada disciplina (em paralelo)
      const resultsWithRatings = await Promise.all(
        results.map(async (disc) => {
          try {
            const stats = await getAggregatedRatings(disc.codigo);
            return { ...disc, avaliacao: stats.media_geral };
          } catch {
            return { ...disc, avaliacao: null };
          }
        })
      );
      
      setDisciplineSuggestions(resultsWithRatings);
    } catch (error) {
      logger.error("🔴 [AcademicSearchPage] Erro ao buscar disciplinas:", error);
      setDisciplineSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar usuários na API com debounce
  const searchUsersDebounced = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUserSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchUsers(query, 8);
      setUserSuggestions(results);
    } catch (error) {
      logger.error("🔴 [AcademicSearchPage] Erro ao buscar usuários:", error);
      setUserSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar livros na API com debounce
  const searchBooksDebounced = useCallback(async (query: string) => {
    if (query.length < 2) {
      setBookSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchBooks(query, 8);
      setBookSuggestions(results);
    } catch (error) {
      logger.error("🔴 [AcademicSearchPage] Erro ao buscar livros:", error);
      setBookSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito para buscar com debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        if (searchMode === "disciplinas") {
          searchDisciplinesDebounced(searchQuery);
        } else if (searchMode === "usuarios") {
          searchUsersDebounced(searchQuery);
        } else {
          searchBooksDebounced(searchQuery);
        }
      }, 300);
    } else {
      setDisciplineSuggestions([]);
      setUserSuggestions([]);
      setBookSuggestions([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchMode, searchDisciplinesDebounced, searchUsersDebounced, searchBooksDebounced]);

  // Função para destacar o texto que coincide
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    // Escapa caracteres especiais de regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <strong key={i} className="font-semibold">{part}</strong>
        : part
    );
  };

  // Navegar para disciplina
  const handleSelectDiscipline = (codigo: string, nome?: string) => {
    if (nome) saveRecentSearch(nome);
    navigate(`/academico/disciplina/${codigo}`);
  };

  // Navegar para perfil público do usuário
  const handleSelectUser = (id: number, name?: string) => {
    if (name) saveRecentSearch(name);
    navigate(`/perfil/${id}`);
  };

  // Navegar para detalhes do livro
  const handleSelectBook = (id: number, title?: string) => {
    if (title) saveRecentSearch(title);
    navigate(`/biblioteca/livro/${id}`);
  };

  // Fazer busca
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    if (searchMode === "disciplinas") {
      try {
        // Verifica se existe match exato de código
        const matchResult = await checkExactMatch(searchQuery.trim());
        
        if (matchResult.exists && matchResult.codigo) {
          // Navega direto para a disciplina
          saveRecentSearch(searchQuery.trim());
          navigate(`/academico/disciplina/${matchResult.codigo}`);
        } else {
          // Navega para página de resultados
          saveRecentSearch(searchQuery.trim());
          navigate(`/academico/buscar/resultados?q=${encodeURIComponent(searchQuery.trim())}`);
        }
      } catch (error) {
        logger.error("Erro ao verificar match exato:", error);
        // Em caso de erro, vai para página de resultados
        saveRecentSearch(searchQuery.trim());
        navigate(`/academico/buscar/resultados?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    } else if (searchMode === "usuarios") {
      // Busca de usuários - navega para página de resultados
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery.trim());
        navigate(`/academico/buscar/usuarios?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    } else {
      // Busca de livros - navega para página de resultados
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery.trim());
        navigate(`/biblioteca/buscar/resultados?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Trocar modo de busca
  const handleModeChange = (mode: SearchMode) => {
    // Se modo está fixado, não permite mudança
    if (fixedMode) return;
    
    setSearchMode(mode);
    setSearchQuery("");
    setSelectedIndex(-1);
    setDisciplineSuggestions([]);
    setUserSuggestions([]);
    setBookSuggestions([]);
    inputRef.current?.focus();
    
    // Navega para a rota correta ao mudar de modo
    if (mode === 'livros') {
      navigate('/biblioteca/buscar');
    } else if (mode === 'disciplinas' || mode === 'usuarios') {
      navigate('/academico/buscar');
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = searchMode === "disciplinas"
      ? (disciplineSuggestions.length > 0 ? disciplineSuggestions : (isFocused && !searchQuery ? popularDisciplines : []))
      : searchMode === "usuarios" 
        ? userSuggestions
        : bookSuggestions;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        if (searchMode === "disciplinas") {
          const disc = items[selectedIndex] as DisciplineWithRating;
          handleSelectDiscipline(disc.codigo, disc.nome);
        } else if (searchMode === "usuarios") {
          const user = items[selectedIndex] as UserSearchResult;
          handleSelectUser(user.id, user.name);
        } else {
          const book = items[selectedIndex] as BookWithAvailability;
          handleSelectBook(book.id, book.title);
        }
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isFocused && (
    (searchMode === "disciplinas" && (disciplineSuggestions.length > 0 || searchQuery.length >= 0 || isLoading)) ||
    (searchMode === "usuarios" && (userSuggestions.length > 0 || searchQuery.length > 0)) ||
    (searchMode === "livros" && (bookSuggestions.length > 0 || searchQuery.length > 0 || isLoading))
  );

  return (
    <div className="min-h-screen flex flex-col bg-default-bg">
      
      
      <div className="flex-1 flex flex-col items-center px-4 pt-20 pb-16">
        {/* Logo Molecoogle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-0.5">
            <span className="text-6xl md:text-7xl font-bold text-[#4285F4]">M</span>
            <span className="text-6xl md:text-7xl font-bold text-[#EA4335]">o</span>
            <span className="text-6xl md:text-7xl font-bold text-[#FBBC05]">l</span>
            <span className="text-6xl md:text-7xl font-bold text-[#4285F4]">e</span>
            <span className="text-6xl md:text-7xl font-bold text-[#34A853]">c</span>
            <span className="text-6xl md:text-7xl font-bold text-[#EA4335]">o</span>
            <span className="text-6xl md:text-7xl font-bold text-[#4285F4]">o</span>
            <span className="text-6xl md:text-7xl font-bold text-[#FBBC05]">g</span>
            <span className="text-6xl md:text-7xl font-bold text-[#34A853]">l</span>
            <span className="text-6xl md:text-7xl font-bold text-[#EA4335]">e</span>
          </div>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-xl lg:max-w-2xl relative"
          ref={dropdownRef}
        >
          <div 
            className={`
              relative bg-white rounded-3xl transition-all duration-200
              ${showDropdown ? "rounded-b-none shadow-lg" : "shadow-md hover:shadow-lg"}
              ${isFocused ? "border-transparent" : "border border-gray-200"}
            `}
          >
            <div className="flex items-center px-4 py-3">
              {searchMode === "disciplinas" ? (
                <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              ) : searchMode === "usuarios" ? (
                <Users className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              ) : (
                <BookOpen className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder={
                  searchMode === "disciplinas" 
                    ? "Buscar disciplinas..." 
                    : searchMode === "usuarios"
                      ? "Buscar usuários..."
                      : "Buscar livros..."
                }
                className="flex-1 text-base outline-none bg-transparent"
                autoComplete="off"
              />
              {searchQuery && (
                <>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-3" />
                </>
              )}
              <button
                onClick={handleSearch}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-academic-blue" />
              </button>
            </div>
          </div>

          {/* Dropdown de Sugestões */}
          {showDropdown && (
            <div className="absolute left-0 right-0 bg-white border-t border-gray-100 rounded-b-3xl shadow-lg overflow-hidden z-50">
              
              {/* MODO DISCIPLINAS */}
              {searchMode === "disciplinas" && (
                <>
                  {/* Loading */}
                  {isLoading && searchQuery.length >= 2 && (
                    <div className="px-4 py-6 flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Buscando disciplinas...</span>
                    </div>
                  )}

                  {/* Quando tem query - mostra sugestões filtradas */}
                  {!isLoading && searchQuery.length >= 2 && disciplineSuggestions.length > 0 && (
                    <ul className="py-2">
                      {disciplineSuggestions.map((disc, index) => (
                        <li
                          key={disc.codigo}
                          onClick={() => handleSelectDiscipline(disc.codigo, disc.nome)}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                            ${selectedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"}
                          `}
                        >
                          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-800">
                              {highlightMatch(disc.nome, searchQuery)}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                              — {disc.codigo}{disc.unidade ? ` • ${disc.unidade}` : ""}
                            </span>
                          </div>
                          {disc.avaliacao && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              {disc.avaliacao.toFixed(1)}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Quando não tem query - mostra recentes e populares */}
                  {searchQuery.length === 0 && (
                    <div className="py-2">
                      {/* Buscas recentes */}
                      {recentSearches.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Buscas recentes
                          </div>
                          {recentSearches.map((term, index) => (
                            <button
                              key={term}
                              onClick={() => setSearchQuery(term)}
                              className={`
                                w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                                ${selectedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"}
                              `}
                            >
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{term}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Divisor */}
                      <div className="border-t border-gray-100 my-2" />

                      {/* Disciplinas populares */}
                      <div>
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Disciplinas populares
                        </div>
                        {popularDisciplines.map((disc, index) => (
                          <button
                            key={disc.codigo}
                            onClick={() => handleSelectDiscipline(disc.codigo)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                              ${selectedIndex === index + recentSearches.length ? "bg-gray-100" : "hover:bg-gray-50"}
                            `}
                          >
                            <TrendingUp className="w-4 h-4 text-academic-blue" />
                            <span className="text-gray-700">{disc.nome}</span>
                            <span className="text-gray-400 text-sm">— {disc.codigo}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sem resultados */}
                  {!isLoading && searchQuery.length >= 2 && disciplineSuggestions.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-gray-700 font-medium mb-1">
                        Nenhuma disciplina encontrada para "{searchQuery}"
                      </p>
                      <p className="text-gray-500 text-sm mb-3">
                        É uma disciplina da pós? Adicione ela manualmente.
                      </p>
                      <Link
                        to={`/academico/criar-disciplina?codigo=${encodeURIComponent(searchQuery.toUpperCase())}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-academic-blue text-white rounded-lg hover:bg-academic-blue/90 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Disciplina
                      </Link>
                    </div>
                  )}

                  {/* Digitando menos de 2 caracteres */}
                  {searchQuery.length === 1 && (
                    <div className="px-4 py-6 text-center text-gray-500">
                      Digite pelo menos 2 caracteres para buscar
                    </div>
                  )}
                </>
              )}

              {/* MODO USUÁRIOS */}
              {searchMode === "usuarios" && (
                <>
                  {/* Loading */}
                  {isLoading && (
                    <div className="px-4 py-6 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-library-purple mx-auto" />
                    </div>
                  )}

                  {/* Quando tem query - mostra sugestões filtradas */}
                  {!isLoading && searchQuery.length >= 2 && userSuggestions.length > 0 && (
                    <ul className="py-2">
                      {userSuggestions.map((user, index) => (
                        <li
                          key={user.id}
                          onClick={() => handleSelectUser(user.id, user.name)}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                            ${selectedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"}
                          `}
                        >
                          {user.profile_image ? (
                            <img 
                              src={user.profile_image} 
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-library-purple/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-library-purple font-semibold text-sm">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-800">
                              {highlightMatch(user.name, searchQuery)}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {user.class && (
                                <span className="text-gray-400 text-xs">
                                  {user.class}
                                </span>
                              )}
                              {user.tags && user.tags.length > 0 && (
                                <>
                                  {user.class && <span className="text-gray-300">•</span>}
                                  <span className="text-gray-400 text-xs truncate">
                                    {user.tags.slice(0, 2).join(", ")}
                                    {user.tags.length > 2 && ` +${user.tags.length - 2}`}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Sem resultados */}
                  {!isLoading && searchQuery.length >= 2 && userSuggestions.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500">
                      Nenhum usuário encontrado para "{searchQuery}"
                    </div>
                  )}

                  {/* Digitando menos de 2 caracteres */}
                  {searchQuery.length === 1 && (
                    <div className="px-4 py-6 text-center text-gray-500">
                      Digite pelo menos 2 caracteres para buscar
                    </div>
                  )}

                  {/* Quando não tem query */}
                  {searchQuery.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500">
                      Digite o nome de um colega para encontrá-lo
                    </div>
                  )}
                </>
              )}

              {/* MODO LIVROS */}
              {searchMode === "livros" && (
                <>
                  {/* Loading */}
                  {isLoading && searchQuery.length >= 2 && (
                    <div className="px-4 py-6 flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Buscando livros...</span>
                    </div>
                  )}

                  {/* Quando tem query - mostra sugestões filtradas */}
                  {!isLoading && searchQuery.length >= 2 && bookSuggestions.length > 0 && (
                    <ul className="py-2">
                      {bookSuggestions.map((book, index) => (
                        <li
                          key={book.id}
                          onClick={() => handleSelectBook(book.id, book.title)}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                            ${selectedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"}
                          `}
                        >
                          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-800">
                              {highlightMatch(book.title, searchQuery)}
                            </span>
                            <div className="text-gray-400 text-sm mt-0.5">
                              {book.authors}
                              {book.code && <span className="ml-2">— {book.code}</span>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Sem resultados */}
                  {!isLoading && searchQuery.length >= 2 && bookSuggestions.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500">
                      Nenhum livro encontrado para "{searchQuery}"
                    </div>
                  )}

                  {/* Digitando menos de 2 caracteres */}
                  {searchQuery.length === 1 && (
                    <div className="px-4 py-6 text-center text-gray-500">
                      Digite pelo menos 2 caracteres para buscar
                    </div>
                  )}

                  {/* Quando não tem query */}
                  {searchQuery.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500">
                      Digite o título ou autor de um livro para encontrá-lo
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Botões de seleção de modo (estilo Google) - Oculto se hideModeSwitcher */}
        {!hideModeSwitcher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 mt-8"
          >
            {/* Botões acadêmicos - apenas quando NÃO estiver na biblioteca */}
            {!location.pathname.includes('/biblioteca') && (
              <>
                <button
                  onClick={() => handleModeChange("disciplinas")}
                  disabled={fixedMode !== undefined}
                  className={`px-4 py-2 text-sm rounded transition-colors border ${
                    searchMode === "disciplinas"
                      ? "bg-academic-blue text-white border-academic-blue"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-100 hover:border-gray-300"
                  } ${fixedMode ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  Buscar Disciplinas
                </button>
                <button
                  onClick={() => handleModeChange("usuarios")}
                  disabled={fixedMode !== undefined}
                  className={`px-4 py-2 text-sm rounded transition-colors border ${
                    searchMode === "usuarios"
                      ? "bg-academic-blue text-white border-academic-blue"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-100 hover:border-gray-300"
                  } ${fixedMode ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  Buscar Usuários
                </button>
              </>
            )}
            {/* Botão de livros - apenas quando estiver na biblioteca */}
            {location.pathname.includes('/biblioteca') && (
              <button
                onClick={() => handleModeChange("livros")}
                disabled={fixedMode !== undefined}
                className={`px-4 py-2 text-sm rounded transition-colors border ${
                  searchMode === "livros"
                    ? "bg-library-green text-white border-library-green"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-100 hover:border-gray-300"
                } ${fixedMode ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                Buscar Livros
              </button>
            )}
          </motion.div>
        )}

        {/* Tags de sugestão rápida */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-400 mb-4">Explore por área</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Matemática", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "Física", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
              { label: "Química", color: "bg-green-50 text-green-700 hover:bg-green-100" },
              { label: "Biologia", color: "bg-red-50 text-red-700 hover:bg-red-100" },
              { label: "Computação", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
            ].map((tag) => (
              <button
                key={tag.label}
                onClick={() => setSearchQuery(tag.label)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tag.color}`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
      
      
    </div>
  );
};

// Export default para uso direto
export default AcademicSearchPage;

// Export nomeado para facilitar reuso em outros contextos
export { AcademicSearchPage as MolecoogleSearchPage };
