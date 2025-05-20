import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BookDetailsFormProps {
  title: string;
  subtitle: string;
  authors: string;
  edition: string;
  volume: string;
  isExemplar: boolean;
  selectedBook?: any;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onAuthorsChange: (value: string) => void;
  onEditionChange: (value: string) => void;
  onVolumeChange: (value: string) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

export default function BookDetailsForm({
  title,
  subtitle, // Add this prop
  authors,
  edition,
  volume,
  isExemplar,
  selectedBook,
  onTitleChange,
  onSubtitleChange, // Add this handler
  onAuthorsChange,
  onEditionChange,
  onVolumeChange,
  onSubmit,
  onPrevious,
  isSubmitting = false
}: BookDetailsFormProps) {
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      {isExemplar && (
        <div className="text-sm text-gray-600 mb-2">
          Ajuste conforme necessário.
        </div>
      )}
      <Input
        placeholder="Título do Livro"
        value={isExemplar ? (title || selectedBook?.title || "") : title}
        onChange={e => onTitleChange(e.target.value)}
        required
        disabled={isSubmitting}
      />
      <Input
        placeholder="Subtítulo"
        value={isExemplar ? (subtitle || selectedBook?.subtitle || "") : subtitle}
        onChange={e => onSubtitleChange(e.target.value)}
        disabled={isSubmitting}
      />
      <Input
        placeholder="Autores"
        value={isExemplar ? (authors || selectedBook?.authors || "") : authors}
        onChange={e => onAuthorsChange(e.target.value)}
        required
        disabled={isSubmitting}
      />
      <Input
        placeholder="Edição"
        value={isExemplar ? (edition || selectedBook?.edition || "") : edition}
        onChange={e => onEditionChange(e.target.value)}
        required
        disabled={isSubmitting}
      />
      <Input
        placeholder="Volume"
        value={
          isExemplar
            ? (selectedBook?.volume || volume || "")
            : volume
        }
        onChange={e => onVolumeChange(e.target.value)}
        required
        disabled={isSubmitting || isExemplar} // <-- Só permite editar se NÃO for exemplar
      />
      <div className="flex gap-2">
        <Button 
          type="submit" 
          className="bg-cm-blue text-white rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adicionando..." : isExemplar ? "Adicionar Exemplar" : "Adicionar Livro"}
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          Voltar
        </Button>
      </div>
    </form>
  );
}