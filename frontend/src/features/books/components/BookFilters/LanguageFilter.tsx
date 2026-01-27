import React from "react";
import { Checkbox } from "@/components/ui/checkbox";


interface LanguageFilterProps {
  language: string[];
  setLanguage: (value: string[]) => void;
  languageOptions: { value: string; label: string }[];
}

const LanguageFilter: React.FC<LanguageFilterProps> = ({ language, setLanguage, languageOptions }) => {
  const handleChange = (val: string) => {
    if (language.includes(val)) {
      setLanguage(language.filter(l => l !== val));
    } else {
      setLanguage([...language, val]);
    }
  };
  return (
    <div>
      <div className="font-semibold mb-1">Idioma</div>
      <div className="flex flex-col gap-1">
        {languageOptions.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={language.includes(opt.value)} onCheckedChange={() => handleChange(opt.value)} id={`lang-${opt.value}`} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default LanguageFilter;
