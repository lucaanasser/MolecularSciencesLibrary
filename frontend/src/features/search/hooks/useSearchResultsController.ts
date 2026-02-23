/**
 * Hook controlador para lógica da página de resultados de busca.
 *
 * Gerencia:
 * - Query da busca (extraída da URL).
 * - Resultados e total de resultados.
 * - Estado de carregamento.
 * - Filtros aplicados e grupos de filtros.
 * - Submissão/aplicação de filtros.
 * - Setters para controle externo dos estados principais.
 *
 * Retorna handlers e estados para uso em SearchResultsPage.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchResultsPageProps, useFilters } from "..";

const RESULTS_PER_PAGE = 20; // Número de resultados por página

export function useSearchResultsController(props: SearchResultsPageProps) {

  const { resultsService, filterGroupsConfig, resultsFields: fields, searchProps } = props;
  
  // Extrai query da URL
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // Gerencia filtros usando o hook de filtros
  const {
    groups: filterGroups,
    filters, // objeto plano já montado
    setCheckbox,
    setInput,
    clearAll,
    getOptions,
  } = useFilters(filterGroupsConfig || []);

  // Inicializa estados dos resultados e das páginas
  const [allResults, setAllResults] = useState<any[]>([]); // Todos os resultados retornados pela busca (sem paginação)
  const [results, setResults] = useState<any[]>([]);       // Resultados da página atual
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Busca resultados sempre que a query ou os filtros mudarem
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    resultsService(query, filters)
      .then(({ results }) => {
        setAllResults(results);
        setCurrentPage(1);
        setTotalPages(Math.ceil(results.length / RESULTS_PER_PAGE));
        setTotal(results.length);
      })
      .finally(() => setLoading(false));
  }, [query, filters]);

  // Atualiza resultados da página atual sempre que os resultados totais ou a página atual mudarem
  useEffect(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE;
    setResults(allResults.slice(start, end));
  }, [allResults, currentPage]);
 

  return {
    // Props visuais e de configuração
    fields,
    searchProps,

    // Estados e handler de paginação
    currentPage,
    totalPages,
    setCurrentPage,

    // Estado da busca
    query,
    results,
    total,
    loading,

    // Estados de filtros
    filterProps: {
      filterGroups,
      handleCheckboxChange: setCheckbox,
      handleInputChange: setInput,
      handleClearAll: clearAll,
      getOptions,
    },
  };
}