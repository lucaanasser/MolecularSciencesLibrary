import React from "react";

/**
 * Hook para destacar ocorrências de um termo em textos ou ReactNodes.
 */
export function useHighlightMatch() {
  /**
   * Destaca todas as ocorrências de `query` em `text`.
   */
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!text || typeof text !== "string") return text;
    if (!query) return text;

    // Divide a query em palavras e escapa cada uma para regex
    const words = query.trim().split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (words.length === 0) return text;

    // Cria uma regex para todas as palavras
    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      words.some(w => part.toLowerCase() === w.toLowerCase())
        ? <strong key={i} className="font-semibold">{part}</strong>
        : part
    );
  };

  /**
   * Aplica highlight recursivamente em todos os textos de um ReactNode.
   */
  function highlightAllInNode(node: React.ReactNode, query: string): React.ReactNode {
    if (typeof node === "string") {
      return highlightMatch(node, query);
    }
    if (React.isValidElement(node)) {
      return React.cloneElement(
        node,
        node.props,
        React.Children.map(node.props.children, child =>
          highlightAllInNode(child, query)
        )
      );
    }
    if (Array.isArray(node)) {
      return node.map((child, idx) => <React.Fragment key={idx}>{highlightAllInNode(child, query)}</React.Fragment>);
    }
    return node;
  }

  return { highlightMatch, highlightAllInNode };
}