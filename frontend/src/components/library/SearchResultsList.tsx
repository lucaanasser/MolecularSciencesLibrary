import React from "react";
import SearchResultItem from "@/components/library/SearchResultItem";

export interface SearchResult {
  id: string | number;
  [key: string]: any;
}

export interface FieldConfig {
  key: string; // Chave do campo no objeto
  label?: string; // Label opcional
  type?: "main" | "secondary" | "custom"; // Estilo de exibição
  render?: (value: any, result: SearchResult) => React.ReactNode; // Render customizado
  className?: string; // Classe customizada
  linkTo?: (result: SearchResult) => string; // Função para gerar link
}

interface SearchResultsListProps {
  results: SearchResult[];
  searchQuery?: string;
  fields: FieldConfig[];
  emptyMessage?: string;
  renderEmpty?: () => React.ReactNode;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  results,
  searchQuery,
  fields,
  emptyMessage = "Nenhum resultado encontrado.",
  renderEmpty,
}) => {
  return (
    <div className="space-y-4">
      {results.length === 0 ? (
        <>
          <div className="text-gray-700 text-center py-8">
            {emptyMessage}
          </div>
          {renderEmpty && renderEmpty()}
        </>
      ) : (
        results.map(result => (
          <SearchResultItem
            key={result.id}
            result={result}
            fields={fields}
            searchQuery={searchQuery}
          />
        ))
      )}
    </div>
  );
};

export default SearchResultsList;