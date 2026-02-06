import React from "react";
import { useSearchLogic } from "@/features/search/useSearchLogic";
import { motion } from "framer-motion";
import { MolecoogleLogo } from "@/features/search/components/MolecoogleLogo";
import SearchBar from "@/features/search/components/SearchBar";
import { Button } from "@/components/ui/button";
import AreasExplorerTags from "@/features/_books/AreasExplorerTags";

import { SearchMode, SearchModeConfig } from "@/types/search";
export { type SearchModeConfig};

interface SearchPageProps {
  modes: SearchModeConfig[];
  initialMode?: SearchMode;
  hideModeSwitcher?: boolean;
}

export const SearchPage: React.FC<SearchPageProps> = ({ modes, initialMode, hideModeSwitcher = false }) => {
  const {
    searchQuery,
    setSearchQuery,
    dropdownRef,
    searchMode,
    setSearchMode,
    isLoading,
    suggestions,
    isFocused,
    setIsFocused,
    selectedIndex,
    setSelectedIndex,
    inputRef,
    handleKeyDown,
    handleModeChange,
    handleSelect,
    handleSearch,
    recentSearches,
    saveRecentSearch,
    onSelect,
  } = useSearchLogic({ modes, initialMode, hideModeSwitcher });

  const currentMode = searchMode;
  const showDropdown = isFocused && (suggestions.length > 0 || searchQuery.length >= 0 || isLoading);

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="content-container flex flex-col items-center px-4 py-16 w-full">
        {/* Logo Molecoogle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <MolecoogleLogo fontSize="text-6xl"/>
        </motion.div>
        
        {/* SearchBar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          inputRef={inputRef}
          dropdownRef={dropdownRef}
          setIsFocused={setIsFocused}
          handleKeyDown={handleKeyDown}
          handleSearch={handleSearch}
          showDropdown={showDropdown}
          isLoading={isLoading}
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          modes={modes}
          currentMode={currentMode}
          recents={recentSearches}
          favorites={[]} // Adapte para favoritos reais se houver
          onSelect={handleSelect}
        />
        
        {/* Botões de seleção de modo - Ocultos se hideModeSwitcher */}
        {!hideModeSwitcher && (
          <div className="flex gap-3 mt-8">
            {modes.map((mode) => (
              <Button
                key={mode.key}
                variant={currentMode === mode.key ? "primary" : "ghost"}
                size="sm"
                onClick={() => handleModeChange(mode.key)}
                disabled={!!hideModeSwitcher}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        )}
        
        {/* Tags de exploração por área */}
        <div className="mt-32 text-center">
          <AreasExplorerTags
            onTagClick={(label) => { setSearchQuery(label) }} // solução temporária:tag apenas define a query
          />
        </div>
      </div>
    </div>
  );
};
