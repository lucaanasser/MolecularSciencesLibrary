import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchDropdown } from "@/features/search/components/SearchDropdown";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  setIsFocused: (v: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  showDropdown: boolean;
  isLoading: boolean;
  suggestions: any[];
  recents?: string[];
  favorites?: string[];
  selectedIndex: number;
  modes: any[];
  currentMode: string;
  onSelect: (item: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  inputRef,
  dropdownRef,
  setIsFocused,
  handleKeyDown,
  handleSearch,
  showDropdown,
  isLoading,
  suggestions,
  recents = [],
  favorites = [],
  selectedIndex,
  modes,
  currentMode,
  onSelect,
}) => (
  <div className="w-full max-w-xl lg:max-w-2xl relative" ref={dropdownRef}>
    <div
      className={`
        relative bg-white rounded-3xl transition-all duration-200
        ${showDropdown ? "rounded-b-none border-b-0 shadow-lg" : "shadow-md hover:shadow-lg"}
        border-2 border-gray-100`}
    >
      <div className="flex items-center px-4 py-3">
        {modes.find((m: any) => m.key === currentMode)?.icon}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={modes.find((m: any) => m.key === currentMode)?.placeholder}
          className="flex-1 text-base outline-none bg-transparent"
          autoComplete="off"
        />
        {searchQuery && (
          <>
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <span className="text-xl leading-none">×</span>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-3" />
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          tabIndex={-1}
          aria-label="Buscar"
          onClick={handleSearch}
        >
          <Search className="w-5 h-5 text-academic-blue" />
        </Button>
      </div>
    </div>
    {showDropdown && (
      <div className="absolute left-0 right-0 z-10">
        <SearchDropdown
          isLoading={isLoading}
          recents={recents}
          favorites={favorites}
          suggestions={suggestions as any[]}
          searchQuery={searchQuery}
          selectedIndex={selectedIndex}
          renderSuggestion={(item, query, selected) => modes.find((m: any) => m.key === currentMode)?.renderSuggestion(item, query, selected)}
          onSelect={onSelect}
          onSearch={setSearchQuery} // solução temporária para buscas recentes
          renderEmpty={modes.find((m: any) => m.key === currentMode)?.renderEmpty}
          renderRecent={modes.find((m: any) => m.key === currentMode)?.renderRecent ? () => modes.find((m: any) => m.key === currentMode)?.renderRecent?.([], setSearchQuery) : undefined}
          renderPopular={modes.find((m: any) => m.key === currentMode)?.renderPopular ? () => modes.find((m: any) => m.key === currentMode)?.renderPopular?.(setSearchQuery) : undefined}
        />
      </div>
    )}
  </div>
);

export default SearchBar;