import React, { useRef, useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { MolecoooogleLogo } from "@/features/search/molecoogle/MolecoooogleLogo";


export interface MolecoogleModeConfig<T = any> {
  key: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  getSuggestions: (query: string) => Promise<T[]>;
  onSelect: (item: T) => void;
  renderSuggestion: (item: T, query: string, selected: boolean) => React.ReactNode;
  renderEmpty?: (query: string) => React.ReactNode;
  renderRecent?: (recent: string[], setQuery: (q: string) => void) => React.ReactNode;
  renderPopular?: (setQuery: (q: string) => void) => React.ReactNode;
}

interface SearchPageProps {
  modes: MolecoogleModeConfig[];
  initialMode?: string;
  fixedMode?: string;
  hideModeSwitcher?: boolean;
}

export const SearchPage: React.FC<SearchPageProps> = ({ modes, initialMode, fixedMode, hideModeSwitcher = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMode, setCurrentMode] = useState<string>(fixedMode || initialMode || modes[0].key);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar sugestões ao digitar
  useEffect(() => {
    let active = true;
    if (searchQuery.length >= 2) {
      setIsLoading(true);
      const mode = modes.find(m => m.key === currentMode);
      if (mode) {
        mode.getSuggestions(searchQuery).then(results => {
          if (active) setSuggestions(results);
        }).finally(() => {
          if (active) setIsLoading(false);
        });
      }
    } else {
      setSuggestions([]);
    }
    return () => { active = false; };
  }, [searchQuery, currentMode, modes]);

  // Handlers
  const handleSelect = (item: any) => {
    const mode = modes.find(m => m.key === currentMode);
    if (mode) mode.onSelect(item);
  };
  const handleModeChange = (key: string) => {
    if (fixedMode) return;
    setCurrentMode(key);
    setSearchQuery("");
    setSelectedIndex(-1);
    setSuggestions([]);
    inputRef.current?.focus();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = isFocused && (suggestions.length > 0 || searchQuery.length > 0 || isLoading);

  return (
    <div className="min-h-screen flex flex-col bg-default-bg">
      <div className="flex-1 flex flex-col items-center px-4 pt-20 pb-16">
        {/* Logo Molecoogle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <MolecoooogleLogo textSize="text-6xl"/>
        </motion.div>
        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-xl lg:max-w-2xl relative"
          ref={dropdownRef}
        >
          <div 
            className={`
              relative bg-white rounded-3xl transition-all duration-200
              ${showDropdown ? "rounded-b-none shadow-lg" : "shadow-md hover:shadow-lg"}
              ${isFocused ? "border-transparent" : "border border-gray-200"}
            `}
          >
            <div className="flex items-center px-4 py-3">
              {modes.find(m => m.key === currentMode)?.icon}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder={modes.find(m => m.key === currentMode)?.placeholder}
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
              {/* Botão de busca pode ser customizado via props se necessário */}
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="submit"
                tabIndex={-1}
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 text-academic-blue" />
              </button>
            </div>
          </div>
          {/* Dropdown de Sugestões */}
          {showDropdown && (
            <div className="absolute left-0 right-0 bg-white border-t border-gray-100 rounded-b-3xl shadow-lg overflow-hidden z-50">
              {isLoading && (
                <div className="px-4 py-6 flex items-center justify-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Buscando...</span>
                </div>
              )}
              {!isLoading && searchQuery.length >= 2 && suggestions.length > 0 && (
                <ul className="py-2">
                  {suggestions.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelect(item)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selectedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"}`}
                    >
                      {modes.find(m => m.key === currentMode)?.renderSuggestion(item, searchQuery, selectedIndex === index)}
                    </li>
                  ))}
                </ul>
              )}
              {/* Custom empty, recent, popular renderers */}
              {!isLoading && searchQuery.length >= 2 && suggestions.length === 0 && modes.find(m => m.key === currentMode)?.renderEmpty?.(searchQuery)}
              {!isLoading && searchQuery.length === 0 && modes.find(m => m.key === currentMode)?.renderRecent?.([], setSearchQuery)}
              {!isLoading && searchQuery.length === 0 && modes.find(m => m.key === currentMode)?.renderPopular?.(setSearchQuery)}
            </div>
          )}
        </motion.div>
        {/* Botões de seleção de modo (estilo Google) - Oculto se hideModeSwitcher */}
        {!hideModeSwitcher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 mt-8"
          >
            {modes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => handleModeChange(mode.key)}
                disabled={!!fixedMode}
                className={`px-4 py-2 text-sm rounded transition-colors border ${
                  currentMode === mode.key
                    ? "bg-academic-blue text-white border-academic-blue"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-100 hover:border-gray-300"
                } ${fixedMode ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {mode.label}
              </button>
            ))}
          </motion.div>
        )}
        {/* Tags de sugestão rápida */}
        {/* ...copiar lógica das tags... */}
      </div>
    </div>
  );
};
