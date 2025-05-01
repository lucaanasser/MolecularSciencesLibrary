import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AreaCode, SubareaCode } from "../types/book";

interface AreaSelectionProps {
  areaCodes: AreaCode;
  subareaCodes: SubareaCode;
  category: string;
  subcategory: string;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onNext: () => void;
  onCancel?: () => void;
}

export default function AreaSelection({
  areaCodes,
  subareaCodes,
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  onNext,
  onCancel
}: AreaSelectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Informe a área e a subárea</h2>
      <Select value={category} onValueChange={value => { 
        onCategoryChange(value);
        onSubcategoryChange("");
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(areaCodes).map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={subcategory} onValueChange={onSubcategoryChange} disabled={!category}>
        <SelectTrigger>
          <SelectValue placeholder="Subcategoria" />
        </SelectTrigger>
        <SelectContent>
          {category && subareaCodes[category] && 
            Object.keys(subareaCodes[category]).map(sub => (
              <SelectItem key={sub} value={String(subareaCodes[category][sub])}>
                {sub}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button disabled={!category || !subcategory} onClick={onNext}>
          Avançar
        </Button>
        {onCancel && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
      </div>
    </div>
  );
}