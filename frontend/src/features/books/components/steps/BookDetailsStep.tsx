import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOption } from "@/features/books/types/book";

/**
 * Componente de formulário de detalhes do livro.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface BookDetailsStepProps {
  title: string;
  subtitle: string;
  authors: string;
  edition: string;
  volume: string;
  isExemplar: boolean;
  addType?: string;
  selectedBook?: BookOption | null;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onAuthorsChange: (value: string) => void;
  onEditionChange: (value: string) => void;
  onVolumeChange: (value: string) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  isVolumeLocked?: boolean; // nova prop
}

export default function BookDetailsStep({
  title,
  subtitle, 
  authors,
  edition,
  volume,
  isExemplar,
  addType,
  selectedBook,
  onTitleChange,
  onSubtitleChange, 
  onAuthorsChange,
  onEditionChange,
  onVolumeChange,
  onSubmit,
  onPrevious,
  isSubmitting = false,
  submitLabel = "Salvar",
  isVolumeLocked = false // default
}: BookDetailsStepProps) {
  // Log de início de renderização
  console.log("🔵 [BookDetailsStep] Renderizando formulário de detalhes do livro");
  // O campo volume só fica travado se isVolumeLocked for true
  return (
    <form className="space-y-4" onSubmit={e => { 
      e.preventDefault(); 
      console.log("🔵 [BookDetailsStep] Submissão do formulário");
      onSubmit(); 
    }}>
      {isExemplar && (
        <div className="text-sm text-gray-600 mb-2">
          Ajuste conforme necessário.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Título do Livro</label>
        <Input
          placeholder="Título do Livro"
          value={isExemplar ? (title || selectedBook?.title || "") : title}
          onChange={e => {
            console.log("🟢 [BookDetailsStep] Título alterado:", e.target.value);
            onTitleChange(e.target.value);
          }}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Subtítulo</label>
        <Input
          placeholder="Subtítulo"
          value={isExemplar ? (subtitle || selectedBook?.subtitle || "") : subtitle}
          onChange={e => {
            console.log("🟢 [BookDetailsStep] Subtítulo alterado:", e.target.value);
            onSubtitleChange(e.target.value);
          }}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Autores</label>
        <Input
          placeholder="Autores"
          value={isExemplar ? (authors || selectedBook?.authors || "") : authors}
          onChange={e => {
            console.log("🟢 [BookDetailsStep] Autores alterados:", e.target.value);
            onAuthorsChange(e.target.value);
          }}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Edição</label>
        <Input
          placeholder="Edição"
          value={isExemplar ? (edition || selectedBook?.edition || "") : edition}
          onChange={e => {
            console.log("🟢 [BookDetailsStep] Edição alterada:", e.target.value);
            onEditionChange(e.target.value);
          }}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Volume</label>
        <Input
          placeholder="Volume"
          value={
            isExemplar
              ? (selectedBook?.volume || volume || "")
              : volume
          }
          onChange={e => {
            console.log("🟢 [BookDetailsStep] Volume alterado:", e.target.value);
            onVolumeChange(e.target.value);
          }}
          required
          disabled={isSubmitting || isVolumeLocked}
        />
      </div>
      <div className="flex gap-2">
        <Button 
          type="submit" 
          className="bg-cm-blue text-white rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          onClick={() => {
            console.warn("🟡 [BookDetailsStep] Voltar clicado");
            onPrevious();
          }}
          disabled={isSubmitting}
        >
          Voltar
        </Button>
      </div>
    </form>
  );
}