import React from "react";
import { Checkbox } from "@/components/ui/checkbox";


interface CategoryFilterProps {
  category: string[];
  setCategory: (value: string[]) => void;
  areaCodes: Record<string, string>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ category, setCategory, areaCodes }) => {
  const categoryOptions = Object.keys(areaCodes);
  const handleChange = (val: string) => {
    if (category.includes(val)) {
      setCategory(category.filter(c => c !== val));
    } else {
      setCategory([...category, val]);
    }
  };
  return (
    <div>
      <div className="font-semibold mb-1">Área</div>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
        {categoryOptions
          .filter(cat => cat !== "" && cat !== undefined && cat !== null)
          .map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={category.includes(cat)} onCheckedChange={() => handleChange(cat)} id={`cat-${cat}`} />
              <span>{areaCodes[cat]}</span>
            </label>
          ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
