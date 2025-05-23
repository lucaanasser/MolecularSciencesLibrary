import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface BookLanguageStepProps {
  onLanguageSelect: (languageId: number) => void;
  onPrevious: () => void;
}

export default function BookLanguageStep({ onLanguageSelect, onPrevious }: BookLanguageStepProps) {
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
          <SelectItem value="3">Espanhol</SelectItem>
          <SelectItem value="4">Outros Idiomas</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onPrevious}>Voltar</Button>
    </div>
  );
}