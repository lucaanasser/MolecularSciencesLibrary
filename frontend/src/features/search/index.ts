// Hooks
export * from "./hooks/useHighlightMatch";
export * from "./hooks/useFilters";
export * from "./hooks/useRecentSearches";
export * from "./hooks/useSuggestions";
export * from "./hooks/useSearchResultsController";
export * from "./hooks/useSearchController";

// Tipos globais
export * from "./types";

// Componentes principais
export { default as SearchPage } from "./pages/SearchPage";
export { default as SearchResultsPage } from "./pages/SearchResultsPage";

// Componentes de UI
export { default as SearchPanel } from "./components/SearchPanel";
export { default as Pagination } from "./components/Pagination";
export { default as ResultItem } from "./components/ResultItem";
export { default as MolecoogleLogo } from "./components/MolecoogleLogo";

// Filtros
export * from "./components/filters";