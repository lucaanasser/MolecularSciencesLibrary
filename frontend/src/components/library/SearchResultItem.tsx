import React from "react";
import { Link } from "react-router-dom";
import { SearchResult, FieldConfig } from "./SearchResultsList";
import { useHighlightMatch } from "@/features/search/useHighlightMatch";

// Função utilitária para destacar todos os campos
function getHighlightedFields(result: SearchResult, fields: FieldConfig[], searchQuery?: string, highlightFn?: (value: string, query?: string) => React.ReactNode) {
  return fields.map(field => {
    const value = result[field.key];
    if (value == null) return { ...field, highlightedValue: null };
    // Só aplica highlight se for string ou number
    const highlightedValue =
      typeof value === "string" || typeof value === "number"
        ? highlightFn?.(String(value), searchQuery)
        : value;
    return { ...field, highlightedValue };
  });
}

interface SearchResultItemProps {
  result: SearchResult;
  fields: FieldConfig[];
  searchQuery?: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, fields, searchQuery }) => {
  const { highlightMatch } = useHighlightMatch();
  const highlightedFields = getHighlightedFields(result, fields, searchQuery, highlightMatch);

  return (
    <div className="pb-4 border-b border-gray-200 last:border-0">
      {highlightedFields.map(f => {
        let className = f.className;
        if (!className) {
          if (f.type === "main") className = "prose-md text-google-result-blue";
          else if (f.type === "secondary" || !f.type) className = "text-google-result-green";
        }
        if (f.type === "main" && f.linkTo) {
          return (
            <Link
              key={f.key}
              to={f.linkTo(result)}
              className={`${className} hover:underline visited:text-google-result-purple`}
            >
              {f.render ? f.render(f.highlightedValue, result) : f.highlightedValue}
            </Link>
          );
        }
        if (f.type === "main") {
          return (
            <span key={f.key} className={className}>
              {f.render ? f.render(f.highlightedValue, result) : f.highlightedValue}
            </span>
          );
        }
        if (f.type === "secondary" || !f.type) {
          return (
            <span key={f.key} className={className}>
              {f.render ? f.render(f.highlightedValue, result) : f.highlightedValue}
            </span>
          );
        }
        if (f.type === "custom") {
          return f.render ? (
            <React.Fragment key={f.key}>{f.render(f.highlightedValue, result)}</React.Fragment>
          ) : null;
        }
        return null;
      })}
    </div>
  );
};

export default SearchResultItem;
