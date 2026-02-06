import React from "react";
import { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { MolecoooogleLogo } from "@/features/search/components/MolecoooogleLogo";

interface SearchHeaderProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  searchPlaceholder?: string;
  SearchIcon: LucideIcon;
  logoLink: string;
}

/**
 * Header de busca reutilizável com logo Molecoooogle e ícone customizável
 */
export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchInput,
  setSearchInput,
  onSearch,
  searchPlaceholder = "Buscar...",
  SearchIcon,
  logoLink,
}) => {
  return (
    <div className="z-10 sticky top-24 md:top-32 pt-12 pb-2 md:pb-6 bg-white">
      <div className="md:px-4 flex flex-col md:flex-row items-center gap-4">
        <Link to={logoLink} className="md:mb-4">
          <MolecoooogleLogo/>
        </Link>
        {/* Barra de busca */}
        <form onSubmit={onSearch} className="flex-1 w-full max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-4 md:pl-6 rounded-full border-gray-200 shadow-md"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchHeader;