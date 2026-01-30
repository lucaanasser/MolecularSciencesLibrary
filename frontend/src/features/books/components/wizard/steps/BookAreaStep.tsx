import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AreaCode, SubareaCode } from "@/features/books/types/book";

/**
 * Componente de seleção de área e subárea do livro.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface BookAreaStepProps {
  areaCodes: AreaCode;
  subareaCodes: SubareaCode;
  category: string;
  subcategory: string;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onNext: () => void;
  onCancel?: () => void;
}

export default function BookAreaStep({
  areaCodes,
  subareaCodes,
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  onNext,
  onCancel
}: BookAreaStepProps) {
  // Log de início de operação
  console.log("🔵 [BookAreaStep] Renderizando seleção de área e subárea");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Informe a área e a subárea</h2>
      <Select value={category} onValueChange={value => { 
        console.log("🟢 [BookAreaStep] Categoria selecionada:", value);
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
      <Select value={subcategory} onValueChange={value => {
        console.log("🟢 [BookAreaStep] Subcategoria selecionada:", value);
        onSubcategoryChange(value);
      }} disabled={!category}>
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
        <Button disabled={!category || !subcategory} onClick={() => {
          console.log("🔵 [BookAreaStep] Avançar clicado");
          onNext();
        }}>
          Avançar
        </Button>
        {onCancel && <Button variant="default" onClick={() => {
          console.warn("🟡 [BookAreaStep] Cancelar clicado");
          onCancel();
        }}>Cancelar</Button>}
      </div>
    </div>
  );
}