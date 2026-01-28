import React from "react";
import CategoryFilter from "./BookFilters/CategoryFilter";
import SubareaFilter from "./BookFilters/SubareaFilter";
import StatusFilter from "./BookFilters/StatusFilter";
import LanguageFilter from "./BookFilters/LanguageFilter";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface BookFiltersPanelProps {
  category: string[];
  setCategory: (value: string[]) => void;
  subcategory: string[];
  setSubcategory: (value: string[]) => void;
  status: string[];
  setStatus: (value: string[]) => void;
  language: string[];
  setLanguage: (value: string[]) => void;
  areaCodes: Record<string, string>;
  subareaCodes: Record<string, Record<string, string | number>>;
  languageOptions: { value: string; label: string }[];
  isPristine: boolean;
  setSearch: (value: string) => void;
}

const BookFiltersPanel: React.FC<BookFiltersPanelProps> = ({
  category,
  setCategory,
  subcategory,
  setSubcategory,
  status,
  setStatus,
  language,
  setLanguage,
  areaCodes,
  subareaCodes,
  languageOptions,
  isPristine,
  setSearch,
}) => {
  return (
    <div className="space-y-4">
      <CategoryFilter category={category} setCategory={setCategory} areaCodes={areaCodes} />
      <SubareaFilter category={category} subcategory={subcategory} setSubcategory={setSubcategory} subareaCodes={subareaCodes} />
      <LanguageFilter language={language} setLanguage={setLanguage} languageOptions={languageOptions} />
      <StatusFilter status={status} setStatus={setStatus} />
      {!isPristine && (
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl text-sm flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            setCategory([]);
            setSubcategory([]);
            setStatus([]);
            setLanguage([]);
            setSearch("");
          }}
        >
          <XCircle size={16} /> Limpar
        </Button>
      )}
    </div>
  );
};

export default BookFiltersPanel;
