import React from "react";

export function useHighlightMatch() {
  
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <strong key={i} className="font-semibold">{part}</strong>
        : part
    );
  };
  
  /* Cria um renderSuggestion padrão com highlight e formatação estilizada
   * @param field O nome do campo do item a destacar (ex: 'title', 'nome', 'name')
   * @param extraRender Função opcional para renderizar conteúdo extra
   */
  function renderSuggestionWithHighlight<T = any>(field: keyof T, extraRender?: (item: T) => React.ReactNode) {
    return (item: T, query: string) => (
      <>
        <div className="flex-1 min-w-0 text-gray-800">
          {highlightMatch(String(item[field] ?? ""), query)}
        </div>
        {extraRender && (
          <div className="ml-2 flex-shrink-0">{extraRender(item)}</div>
        )}
      </>
    );
  }

  return { highlightMatch, renderSuggestionWithHighlight };
}
