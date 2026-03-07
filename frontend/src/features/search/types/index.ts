/* ============================================================================
 * Tipos públicos para integração com SearchPage
 * ============================================================================
 */

/**
 * Item de busca utilizado em sugestões, históricos e resultados.
 * Usado em SearchPage e SearchResultsPage.
 */
export interface SearchItem { 
  label: any; 
  [key: string]: any 
}

/**
 * Função para mapear um item da API para SearchItem.
 * Usado em SearchPage e SearchResultsPage.
 */
export type MapSuggestion = (item: any) => SearchItem;

/**
 * Serviço de autocomplete para sugestões de busca.
 * Usado em SearchPage e SearchResultsPage.
 */
export type AutocompleteService = (query: string, limit?: number) => Promise<any[]>;

/**
 * Props para o componente SearchPanel (barra de busca principal).
 * Usado em SearchPage e SearchResultsPage.
 */
export type SearchPropsConfig = {
  icon?: React.ReactNode;
  placeholder?: string;
  autocompleteService: AutocompleteService;
  onLogoClick?: () => void;
  resultRoute: string;
  suggestionRoute: (item: SearchItem) => string;
  renderSuggestion?: (item: SearchItem) => React.ReactNode;
  populars?: SearchItem[];
};

/**
 * Props para o componente SearchPanel, incluindo tamanho.
 * Usado internamente em SearchPanel.
 */
export type SearchProps = SearchPropsConfig & {
  size?: "sm" | "md" | "lg";
};


/* ============================================================================
 * Tipos públicos para integração com SearchResultsPage
 * ============================================================================
 */

/**
 * Serviço para buscar resultados paginados.
 * Usado em SearchResultsPage.
 */
export type ResultsService = ( query: string, filters?: any) => Promise<{ results: any[]; total: number }>;

/**
 * Tipos de campo para exibição em ResultItem.
 * Usado em SearchResultsPage.
 */
export type FieldType = "main" | "secondary" | "custom";

/**
 * Configuração de um campo a ser exibido em ResultItem.
 * Usado em SearchResultsPage.
 *
 * Props:
 * - key: Nome do campo no objeto result (obrigatório).
 * - type: "main" (destaque), "secondary" (informação adicional) ou "custom" (opcional).
 * - className: Classe CSS adicional para customização do campo (opcional).
 * - render: Função customizada para renderizar o valor do campo (recebe o valor e o result, opcional).
 * - linkTo: Função que recebe o result e retorna uma URL para linkar o campo (opcional).
 */
export interface FieldConfig {
  key: string;
  type?: FieldType;
  className?: string;
  render?: (value: any) => React.ReactNode; // para campos customizados
  linkTo?: (result: any) => string; // para links dinâmicos
}

/**
 * Props para a página de resultados de busca.
 * Usado ao consumir SearchResultsPage.
 */
export type SearchResultsPageProps = {
  resultsService: ResultsService;
  resultsFields: FieldConfig[];
  searchProps: SearchPropsConfig;
  filterGroupsConfig?: FilterGroupConfig[];
};

/**
 * Grupo de filtros para uso em SearchResultsPage.
 */
import { FilterGroupConfig } from "../components/filters";
export type { FilterGroupConfig } from "../components/filters";