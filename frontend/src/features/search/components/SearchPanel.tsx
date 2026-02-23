/**
 * Barra de busca principal com sugestões, buscas recentes e populares.
 *
 * Props (SearchPanelProps):
 * - icon (opcional): Ícone exibido à esquerda do input.
 * - placeholder (opcional): Texto placeholder do input.
 * - autocompleteService: Função para buscar sugestões de autocomplete.
 * - resultRoute: Rota base para navegação ao resultado.
 * - mapSuggestion (opcional): Função para mapear sugestões da API para SearchItem.
 * - populars (opcional): Lista de buscas populares.
 * - size (opcional): Tamanho da barra ("sm" | "md" | "lg").
 *
 * O componente gerencia o estado do input, sugestões, buscas recentes e populares,
 * e navegação por teclado, usando o hook useSearchController.
 */

import { Clock, Search, TrendingUp, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SearchItem, SearchProps, useSearchController, useHighlightMatch } from "..";

export default function SearchPanel(props: SearchProps) {
  const { size = "sm" } = props;
  
  // Lógica do componente encapsulada no hook
  const {
    icon, placeholder,
    query,
    suggestions, recents, populars, renderSuggestion,
    onSuggestionClick, onRecentClick, onPopularClick, onClearRecents,
    onChange, onSubmit,
    inputRef,
    focused, setFocused,
    selectedIndex, handleKeyDown,
  } = useSearchController(props);

  // Classes de estilo baseadas no tamanho
  const textSizeClasses = {
    sm: "prose-xs px-2 py-1",
    md: "prose-sm px-4 py-2",
    lg: "text-lg px-2 md:px-4 py-2",
  };
  const appliedTextSize = textSizeClasses[size];

  const dropdownMarginTop = {
    sm: "mt-4",
    md: "mt-6",
    lg: "mt-6",
  };
  const appliedDropdownMargin = dropdownMarginTop[size];

  // Seções renderizadas no dropdown
  const { highlightMatch, highlightAllInNode } = useHighlightMatch();
  const sections = [
    {
      title: "Sugestões",
      items: suggestions || [],
      onClick: onSuggestionClick,
      renderTitle: () => (
        <div className={`text-gray-500 ${appliedTextSize} -ml-2 mb-0`}>Sugestões</div>
      ),
      renderItem: (item: SearchItem, query: string) => 
        <span>
          {renderSuggestion
            ? highlightAllInNode(renderSuggestion(item), query)
            : highlightMatch(item.label, query)}
        </span>,
    },
    {
      title: "Buscas Recentes",
      items: recents || [],
      onClick: onRecentClick,
      renderTitle: () => (
        <div className="flex items-center justify-between">
          <span className={`text-gray-500 ${appliedTextSize} -ml-2 mb-0`}>Buscas Recentes</span>
          <Button
            variant="ghost"
            type="button"
            size="icon"
            onMouseDown={e => { e.preventDefault(); onClearRecents(); }}
            aria-label="Limpar buscas recentes"
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ),
      renderItem: (item: SearchItem, query: string) => (
        <span className={`flex items-center gap-2 pl-0`}>
          <Clock className={`text-gray-400 pl-0`} />
          {highlightMatch(item.label, query)}
        </span>
      ),
    },
    {
      title: "Buscas Populares",
      items: populars || [],
      onClick: onPopularClick,
      renderTitle: () => (
        <div className={`text-gray-500 ${appliedTextSize} -ml-2 mb-0`}>Buscas Populares</div>
      ),
      renderItem: (item: SearchItem, query: string) => (
        <span className={`flex items-center gap-2 pl-0`}>
          <TrendingUp className={`text-gray-400 pl-0`} />
          {highlightMatch(item.label, query)}
        </span>
      ),
    },
  ];

  // Limita o total de itens exibidos no dropdown a 5, mantendo os títulos das seções
  let totalCount = 0;
  const limitedSections = sections.map(section => {
    if (totalCount >= 5) return { ...section, items: [] };
    const remaining = 5 - totalCount;
    const items = section.items.slice(0, remaining);
    totalCount += items.length;
    return { ...section, items };
  }).filter(section => section.items.length > 0);
  
  return (
    <div className={`relative w-full rounded-full transition-all duration-200 bg-white ${appliedTextSize} ${focused ? "shadow-lg" : "shadow-md"}`}>
      
      {/* Barra de busca */}
      <form onSubmit={e => { e.preventDefault(); onSubmit();
  }} className={`flex items-center rounded-full w-full`}>
        
        {/* Ícone personalizado com animação de hover */}
        <motion.span
          whileHover={{ rotate: 360, scale: 1.15 }}
          transition={{ type: "spring", stiffness: 300, damping: 60 }}
          className={`text-gray-400 ${appliedTextSize}`}
        >
          {icon}
        </motion.span>

        {/* Input de busca */}
        <input
          ref={inputRef}
          type="text"
          value={query ?? ""}
          onKeyDown={handleKeyDown}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`flex-1 min-w-0 outline-none bg-transparent`}
          autoComplete="off"
        />

        {/* Botão de submit */}
        <Button
          type="submit"
          variant="default"
          tabIndex={-1}
          aria-label="Buscar"
        >
          <Search className={`h-full aspect-square primary-text`} />
        </Button>
      </form>

      {/* Dropdown de sugestões e buscas recentes */}
      {(focused && limitedSections.some(section => section.items.length > 0)) && (
        <div className={`${appliedDropdownMargin} absolute left-0 w-full bg-white rounded-2xl shadow-lg z-10 p-2`}>
          {limitedSections.map(
            (section, sectionIdx) =>
              section.items.length > 0 && (
                <div key={section.title}>
                  {section.renderTitle?.()}
                  {section.items.map((item, idx) => {
                    // Calcule o índice global para navegação por teclado
                    const globalIdx =
                      limitedSections
                        .slice(0, sectionIdx)
                        .reduce((acc, s) => acc + s.items.length, 0) + idx;
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl cursor-pointer hover:bg-gray-100 ${appliedTextSize} ${
                          selectedIndex === globalIdx ? "bg-gray-200" : ""
                        }`}
                        onMouseDown={() => section.onClick?.(item)}
                      >
                        {section.renderItem
                          ? section.renderItem(item, query)
                          : item.label}
                      </div>
                    );
                  })}
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
};