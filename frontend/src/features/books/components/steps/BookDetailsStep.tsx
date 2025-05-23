import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOption } from "@/features/books/types/book";

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
  // O campo volume só fica travado se isVolumeLocked for true
  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
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
          onChange={e => onTitleChange(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Subtítulo</label>
        <Input
          placeholder="Subtítulo"
          value={isExemplar ? (subtitle || selectedBook?.subtitle || "") : subtitle}
          onChange={e => onSubtitleChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Autores</label>
        <Input
          placeholder="Autores"
          value={isExemplar ? (authors || selectedBook?.authors || "") : authors}
          onChange={e => onAuthorsChange(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Edição</label>
        <Input
          placeholder="Edição"
          value={isExemplar ? (edition || selectedBook?.edition || "") : edition}
          onChange={e => onEditionChange(e.target.value)}
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
          onChange={e => onVolumeChange(e.target.value)}
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
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          Voltar
        </Button>
      </div>
    </form>
  );
}