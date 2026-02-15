import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AREAS, SUBAREAS, LANGUAGES, STATUS } from "@/constants/books";
import { Area, Subarea, Language, Book } from "@/types/new_book";

type BookFormFieldsProps = {
  book: Book;
  setBook: (book: Book) => void;
  disabledFields?: Partial<Record<keyof Book, boolean>>;
};

const BookFormFields: React.FC<BookFormFieldsProps> = ({ book, setBook, disabledFields: givenFields }) => {
  const disabledFields = { id: true, code: true, status: true, ...givenFields };
  const availableSubareas =
    book.area && SUBAREAS[book.area as keyof typeof SUBAREAS]
      ? SUBAREAS[book.area as keyof typeof SUBAREAS]
      : [];

  return (
    <>
      {/* ID (Código de barras) */}
      {!disabledFields.id ? (
        <div>
          <Label htmlFor="id">Id (Código de barras):</Label>
          <Input
            id="id"
            type="number"
            value={book.id ?? ""}
            onChange={e => setBook({ ...book, id: Number(e.target.value) })}
            placeholder="EAN13 (opcional)"
          />
        </div>
      ) : null}
      
      {/* Código da biblioteca */}
      {!disabledFields.code && (
        <div>
          <Label htmlFor="code">Código:</Label>
          <Input
            id="code"
            value={book.code || ""}
            onChange={e => setBook({ ...book, code: e.target.value })}
            placeholder="Ex.: FIS-01.01 v.1 (opcional)"
          />
        </div>
      )}

      {/* Área */}
      {!disabledFields.area && (
        <div>
          <Label htmlFor="area">Área:</Label>
          <Select
            value={book.area || ""}
            onValueChange={value => setBook({ ...book, area: value as Area, subarea: "" })}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {AREAS.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Subárea*/}
      {!disabledFields.subarea && (
        <div>
          <Label htmlFor="subarea">Subárea:</Label>
          <Select
            value={book.subarea || ""}
            onValueChange={value => setBook({ ...book, subarea: value as Subarea })}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {availableSubareas.map(sa => (
                <SelectItem key={sa} value={sa}>{sa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Título */}
      {!disabledFields.title && (
        <div>
          <Label htmlFor="title">Título:</Label>
          <Input
            id="title"
            value={book.title || ""}
            onChange={e => setBook({ ...book, title: e.target.value })}
            required
            placeholder="Ex: Introdução à Bioquímica"
          />
        </div>
      )}
      
      {/* Subtítulo */}
      {!disabledFields.subtitle && (
        <div>
          <Label htmlFor="subtitle">Subtítulo:</Label>
          <Input
            id="subtitle"
            value={book.subtitle || ""}
            onChange={e => setBook({ ...book, subtitle: e.target.value })}
            placeholder="(opcional)"
          />
        </div>
      )}
      
      {/* Autores */}
      {!disabledFields.authors && (
        <div>
          <Label htmlFor="authors">Autores:</Label>
          <Input
            id="authors"
            value={book.authors || ""}
            onChange={e => setBook({ ...book, authors: e.target.value })}
            required
            placeholder="Nome Sobrenome, Outro Autor, ..."
          />
        </div>
      )}
      
      {/* Idioma */}
      {!disabledFields.language && (
        <div>
          <Label htmlFor="language">Idioma:</Label>
          <Select
            value={book.language || ""}
            onValueChange={value => setBook({ ...book, language: value as Language })}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Edição */}
      {!disabledFields.edition && (
        <div>
          <Label htmlFor="edition">Edição:</Label>
          <Input
            id="edition"
            type="number"
            value={book.edition ?? ""}
            onChange={e => setBook({ ...book, edition: Number(e.target.value) })}
            placeholder="(opcional)"
            disabled={!!disabledFields.edition}
          />
        </div>
      )}

      {/* Volume */}
      {!disabledFields.volume && (
        <div>
          <Label htmlFor="volume">Volume:</Label>
          <Input
            id="volume"
            type="number"
            value={book.volume ?? ""}
            onChange={e => setBook({ ...book, volume: Number(e.target.value) })}
            placeholder="(opcional)"
            disabled={!!disabledFields.volume}
          />
        </div>
      )}
      
      {/* Status */}
      {!disabledFields.status && (
        <div>
          <Label htmlFor="status">Status:</Label>
          <Select
            value={book.status || ""}
            onValueChange={value => setBook({ ...book, status: value as Book["status"] })}
            required
            disabled={!!disabledFields.status}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
    </>
  );
};

export default BookFormFields;