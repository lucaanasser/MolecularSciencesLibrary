import React from "react";
import { Loader2, Clock } from "lucide-react";

interface SearchDropdownProps<T = any> {
  isLoading: boolean;
  suggestions: T[];
  recents?: string[];
  favorites?: string[];
  searchQuery: string;
  selectedIndex: number;
  renderSuggestion: (item: T, query: string, selected: boolean) => React.ReactNode;
  onSelect: (item: T) => void;
  onSearch: (query: string) => void;
  renderEmpty?: (query: string) => React.ReactNode;
  renderRecent?: (item: T) => React.ReactNode;
  renderPopular?: () => React.ReactNode;
}

export function SearchDropdown<T = any>({
  isLoading,
  suggestions,
  recents = [],
  favorites = [],
  searchQuery,
  selectedIndex,
  renderSuggestion,
  onSelect,
  onSearch,
  renderEmpty,
  renderRecent,
  renderPopular,
}: SearchDropdownProps<T>) {

  const dropdownContainer = "flex items-center gap-3 px-4";
  const defaultTextStyle = "justify-center text-gray-500 py-8";
  const resultsTextStyle = (index) => `${dropdownContainer} py-2.5 cursor-pointer transition-colors ${selectedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"}`;

  return (
    <div className="bg-white border-t-none border-2 border-gray-100 rounded-b-3xl shadow-lg overflow-hidden z-10">
      {/* Loading */}
      {isLoading && (
        <div className={`${dropdownContainer} ${defaultTextStyle}`}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Buscando...</span>
        </div>
      )}

      {/* Recentes/populares */}
      {!isLoading && searchQuery.length === 0 && (
        <>
          {recents.length > 0 && (
            <>
              <div className={`${dropdownContainer} mt-4 mb-2 text-gray-500 font-semibold`}>
                Buscas recentes
              </div>
              <ul className="py-2">
                {recents.map((item, index) => (
                  <li
                    key={item}
                    onClick={() => onSearch(item as any)}
                    className={resultsTextStyle(index)}
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    {renderRecent ? renderRecent(item as any) : item as any}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* Sugestões */}
      {searchQuery.length >= 2 && suggestions.length > 0 && (
        <ul className="py-2">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onMouseDown={() => onSelect(item)}
              className={resultsTextStyle(index)}
            >
              {renderSuggestion(item, searchQuery, selectedIndex === index)}
            </li>
          ))}
        </ul>
      )}
      
      {/* Default: menos de 2 caracteres */}
      {!isLoading && searchQuery.length > 0 && searchQuery.length < 2 && (
        <div className={`${dropdownContainer} ${defaultTextStyle}`}>
          Digite pelo menos 2 caracteres para buscar
        </div>
      )}

      {/* Default: sem resultados */}
      {!isLoading && searchQuery.length >= 2 && suggestions.length === 0 && (
        <div className={`${dropdownContainer} ${defaultTextStyle}`}>
          {renderEmpty && renderEmpty(searchQuery)}
          Nenhum resultado encontrado para "{searchQuery}"
        </div>
      )}
    </div>
  );
}
