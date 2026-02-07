import React from "react";
import { useSearchLogic } from "@/features/search/hooks/useSearchLogic";
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
  const logic = useSearchLogic({ modes, initialMode, hideModeSwitcher });
  const showDropdown = logic.isFocused && (logic.suggestions.length > 0 || logic.searchQuery.length >= 0 || logic.isLoading);

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
          searchQuery={logic.searchQuery}
          setSearchQuery={logic.setSearchQuery}
          inputRef={logic.inputRef}
          dropdownRef={logic.dropdownRef}
          setIsFocused={logic.setIsFocused}
          handleKeyDown={logic.handleKeyDown}
          handleSearch={logic.handleSearch}
          showDropdown={showDropdown}
          isLoading={logic.isLoading}
          suggestions={logic.suggestions}
          selectedIndex={logic.selectedIndex}
          modes={modes}
          currentMode={logic.searchMode}
          recents={logic.recentSearches}
          favorites={[]} // Adapte para favoritos reais se houver
          onSelect={logic.handleSelect}
        />
        
        {/* Botões de seleção de modo - Ocultos se hideModeSwitcher */}
        {!hideModeSwitcher && (
          <div className="flex gap-3 mt-8">
            {modes.map((mode) => (
              <Button
                key={mode.key}
                variant={logic.searchMode === mode.key ? "primary" : "ghost"}
                size="sm"
                onClick={() => logic.handleModeChange(mode.key)}
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
            onTagClick={(label) => { logic.setSearchQuery(label) }} // solução temporária:tag apenas define a query
          />
        </div>
      </div>
    </div>
  );
};
