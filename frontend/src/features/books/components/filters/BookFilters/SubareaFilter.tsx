import React from "react";
import { Checkbox } from "@/components/ui/checkbox";


interface SubareaFilterProps {
  category: string[];
  subcategory: string[];
  setSubcategory: (value: string[]) => void;
  subareaCodes: Record<string, Record<string, string | number>>;
}

const SubareaFilter: React.FC<SubareaFilterProps> = ({ category, subcategory, setSubcategory, subareaCodes }) => {
  // Mostra subáreas de todas as áreas selecionadas
  const subcategoryOptions = category.length === 1 ? Object.keys(subareaCodes[category[0]] || {}) : [];
  const handleChange = (val: string) => {
    if (subcategory.includes(val)) {
      setSubcategory(subcategory.filter(s => s !== val));
    } else {
      setSubcategory([...subcategory, val]);
    }
  };
  if (category.length !== 1) return null;
  return (
    <div>
      <div className="font-semibold mb-1">Subárea</div>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
        {subcategoryOptions
          .filter(sub => sub !== "" && sub !== undefined && sub !== null)
          .map(sub => (
            <label key={sub} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={subcategory.includes(sub)} onCheckedChange={() => handleChange(sub)} id={`sub-${sub}`} />
              <span>{sub}</span>
            </label>
          ))}
      </div>
    </div>
  );
};

export default SubareaFilter;
