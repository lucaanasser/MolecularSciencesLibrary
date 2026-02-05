import React from "react";

export function useHighlightMatch() {
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <strong key={i} className="font-semibold">{part}</strong>
        : part
    );
  };
  return { highlightMatch };
}
