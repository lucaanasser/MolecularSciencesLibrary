import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOption, AddBookType } from "../types/book";

// Agrupa livros por código
function groupBooksByCode(books: BookOption[]) {
  const groups: Record<string, BookOption[]> = {};
  books.forEach(book => {
    if (!groups[book.code]) groups[book.code] = [];
    groups[book.code].push(book);
  });
  return groups;
}

const LANGUAGE_MAP: Record<number, string> = {
  1: "pt",
  2: "en",
  3: "es",
  4: "var"
};

interface BookSearchListProps {
  books: BookOption[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectBook: (book: BookOption, type?: AddBookType) => void;
  onAddNewBook?: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
  mode?: "add" | "remove"; 
}

export default function BookSearchList({
  books,
  isLoading,
  search,
  onSearchChange,
  onSelectBook,
  onAddNewBook,
  onPrevious,
  onCancel,
  mode = "add" 
}: BookSearchListProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const grouped = groupBooksByCode(books);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">
        {mode === "remove"
          ? "Selecione o livro para remover"
          : "Verifique se o livro já existe no acervo"}
      </h2>
      <Input
        type="text"
        placeholder="Buscar por nome do livro"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />

      {mode === "add" && (
        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            {books.length > 0 
              ? `Encontramos ${books.length} livro(s). Se nenhum desses for o que procura:`
              : "Nenhum livro encontrado nesta subárea."}
          </p>
          <Button 
            onClick={onAddNewBook} 
            className="w-full mt-2 bg-cm-green hover:bg-cm-green/90"
          >
            Não encontrei o livro
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="text-center p-6">
          <p>Carregando livros...</p>
        </div>
      )}

      {!isLoading && Object.keys(grouped).length > 0 && (
        <div className="space-y-3 mt-4">
          <h3 className="font-medium">
            {mode === "remove" ? "Livros disponíveis para remoção:" : "Livros disponíveis:"}
          </h3>
          {Object.entries(grouped).map(([code, exemplares]) => (
            <div key={code} className="border rounded p-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <b>{exemplares[0].title}</b>
                  {exemplares[0].authors && <> – {exemplares[0].authors}</>}
                  {exemplares[0].edition && <> (Edição: {exemplares[0].edition})</>}
                  {exemplares[0].volume && <> Vol. {exemplares[0].volume}</>}
                </div>
                {mode === "remove" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenGroup(openGroup === code ? null : code)}
                  >
                    {openGroup === code ? "Fechar Exemplares" : "Ver Exemplares"}
                  </Button>
                )}
                {mode === "add" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onSelectBook(exemplares[0], "exemplar")}
                    >
                      Adicionar Novo Exemplar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectBook(exemplares[0], "volume")}
                    >
                      Adicionar Novo Volume
                    </Button>
                  </div>
                )}
              </div>
              {mode === "remove" && openGroup === code && (
                <div className="mt-2 space-y-2">
                  {exemplares.map(exemplar => (
                    <div key={exemplar.id} className="flex items-center justify-between border rounded px-2 py-1">
                      <div>
                        <span className="font-medium">Exemplar {exemplar.exemplar}</span>
                        {exemplar.language && <> | Idioma: {LANGUAGE_MAP[Number(exemplar.language)] || exemplar.language}</>}
                        {exemplar.edition && <> | Edição: {exemplar.edition}</>}
                        {exemplar.volume && <> | Volume: {exemplar.volume}</>}
                        {exemplar.subtitle && <> | {exemplar.subtitle}</>}
                      </div>
                      <Button
                        size="sm"
                        className="bg-red-500 text-white"
                        onClick={() => onSelectBook(exemplar)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={onPrevious}>Voltar</Button>
        {onCancel && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
      </div>
    </div>
  );
}