import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOption, AddBookType } from "@/features/books/types/book";

/**
 * Lista de busca e seleção de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

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
  onAddNewVolume?: (book: BookOption) => void;
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
  onAddNewVolume,
  onPrevious,
  onCancel,
  mode = "add" 
}: BookSearchListProps) {
  // Log de início de renderização
  console.log("🔵 [BookSearchList] Renderizando lista de busca de livros");
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
        onChange={e => {
          console.log("🟢 [BookSearchList] Termo de busca alterado:", e.target.value);
          onSearchChange(e.target.value);
        }}
      />

      {mode === "add" && (
        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            {books.length > 0 
              ? `Encontramos ${books.length} livro(s). Se nenhum desses for o que procura:`
              : "Nenhum livro encontrado nesta subárea."}
          </p>
          <Button 
            onClick={() => {
              console.log("🟢 [BookSearchList] Adicionar novo livro clicado");
              onAddNewBook && onAddNewBook();
            }} 
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
                    onClick={() => {
                      console.log("🟢 [BookSearchList] Ver exemplares clicado:", code);
                      setOpenGroup(openGroup === code ? null : code);
                    }}
                  >
                    {openGroup === code ? "Fechar Exemplares" : "Ver Exemplares"}
                  </Button>
                )}
                {mode === "add" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        console.log("🟢 [BookSearchList] Adicionar novo exemplar clicado:", exemplares[0]);
                        onSelectBook(exemplares[0], "exemplar");
                      }}
                      className="bg-cm-blue text-white px-2 py-1 rounded"
                    >
                      Adicionar Novo Exemplar
                    </button>
                    <button
                      onClick={() => {
                        console.log("🟢 [BookSearchList] Adicionar novo volume clicado:", exemplares[0]);
                        if (onAddNewVolume) {
                          onAddNewVolume(exemplares[0]);
                        } else {
                          onSelectBook(exemplares[0], "volume");
                        }
                      }}
                      className="bg-cm-green text-white px-2 py-1 rounded"
                    >
                      Adicionar Novo Volume
                    </button>
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
                        onClick={() => {
                          console.log("🟢 [BookSearchList] Remover exemplar clicado:", exemplar);
                          onSelectBook(exemplar);
                        }}
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
        <Button variant="outline" onClick={() => {
          console.warn("🟡 [BookSearchList] Voltar clicado");
          onPrevious();
        }}>Voltar</Button>
        {onCancel && <Button variant="outline" onClick={() => {
          console.warn("🟡 [BookSearchList] Cancelar clicado");
          onCancel();
        }}>Cancelar</Button>}
      </div>
    </div>
  );
}