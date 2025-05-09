import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface LanguageSelectionProps {
  onLanguageSelect: (languageId: number) => void;
  onPrevious: () => void;
}

export default function LanguageSelection({ onLanguageSelect, onPrevious }: LanguageSelectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Selecione o idioma do livro</h2>
      <Select onValueChange={v => onLanguageSelect(Number(v))}>
        <SelectTrigger>
          <SelectValue placeholder="Idioma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Português</SelectItem>
          <SelectItem value="2">Inglês</SelectItem>
          {/* Adicione outros idiomas se necessário */}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onPrevious}>Voltar</Button>
    </div>
  );
}