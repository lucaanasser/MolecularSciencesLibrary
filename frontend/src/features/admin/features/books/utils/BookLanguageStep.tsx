import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/**
 * Componente de seleção de idioma do livro.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface BookLanguageStepProps {
  onLanguageSelect: (languageId: number) => void;
  onPrevious: () => void;
}

export default function BookLanguageStep({ onLanguageSelect, onPrevious }: BookLanguageStepProps) {
  // Log de início de renderização
  console.log("🔵 [BookLanguageStep] Renderizando seleção de idioma");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Selecione o idioma do livro</h2>
      <Select onValueChange={v => {
        console.log("🟢 [BookLanguageStep] Idioma selecionado:", v);
        onLanguageSelect(Number(v));
      }}>
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
      <Button variant="default" onClick={() => {
        console.warn("🟡 [BookLanguageStep] Voltar clicado");
        onPrevious();
      }}>Voltar</Button>
    </div>
  );
}