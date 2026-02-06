import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
}

// Destaca o termo buscado
const highlightMatch = (text: string, query?: string) => {
  if (!query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <strong key={i} className="font-bold">{part}</strong>
    ) : (
      part
    )
  );
};

// Renderiza um único resultado
const SearchResultItem: React.FC<{
  result: SearchResult;
  fields: FieldConfig[];
  searchQuery?: string;
}> = ({ result, fields, searchQuery }) => {
  
  // Campo principal para link
  const mainField = fields.find(f => f.type === "main");
  const mainValue = mainField ? result[mainField.key] : undefined;
  const mainLink = mainField && mainField.linkTo ? mainField.linkTo(result) : undefined;

  // Formatações padrão
  const mainClass = "prose-md text-google-result-blue";
  
  return (
    <div className="pb-4 border-b border-gray-200 last:border-0">
      {/* Campo principal */}
      {mainField && mainLink ? (
        <Link
          to={mainLink}
          className={`${mainClass} hover:underline visited:text-google-result-purple`}
        >
          {mainField.render
            ? mainField.render(mainValue, result)
            : highlightMatch(String(mainValue ?? ""), searchQuery)}
        </Link>
      ) : mainField ? (
        <span className={mainClass}>
          {mainField.render
            ? mainField.render(mainValue, result)
            : highlightMatch(String(mainValue ?? ""), searchQuery)}
        </span>
      ) : null}

      {/* Campos secundários */}
      <div className="flex items-center gap-3 mt-1 prose-xs flex-wrap">
        {fields.filter(f => f.type === "secondary" || !f.type).map(f => {
          const value = result[f.key];
          if (!value) return null;
          return (
            <span key={f.key} className={f.className ?? "text-google-result-green"}>
              {f.render ? f.render(value, result) : highlightMatch(String(value), searchQuery)}
            </span>
          );
        })}

        {/* Custom */}
        {fields.filter(f => f.type === "custom").map(f => {
          const value = result[f.key];
          return f.render ? <React.Fragment key={f.key}>{f.render(value, result)}</React.Fragment> : null;
        })}

      </div>
    </div>
  );
};

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  results,
  searchQuery,
  fields,
  emptyMessage = "Nenhum resultado encontrado.",
}) => {
  return (
    <div className="space-y-4">
      {results.length === 0 ? (
        <div className="text-gray-700 text-center py-8">{emptyMessage}</div>
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