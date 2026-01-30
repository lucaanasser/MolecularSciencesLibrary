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
              {exemplares.map(exemplar => {
                let statusColor = "text-gray-500";
                if (exemplar.status === "disponível") statusColor = "text-green-600";
                else if (exemplar.status === "reservado") statusColor = "text-[#641161]";
                else if (exemplar.status === "atrasado") statusColor = "text-red-600";
                else if (exemplar.status === "emprestado") statusColor = "text-yellow-500";
                return (
                  <div key={exemplar.id} className="flex items-center justify-between py-1">
                    <div>
                      <b>{exemplar.title}</b>
                      {exemplar.authors && <> – {exemplar.authors}</>}
                      {exemplar.edition && <> (Edição: {exemplar.edition})</>}
                      {exemplar.volume && <> Vol. {exemplar.volume}</>}
                      <span className={`ml-2 font-semibold ${statusColor}`}>{exemplar.status}</span>
                    </div>
                    {mode === "add" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectBook(exemplar, "exemplar")}
                          className="bg-cm-blue text-white px-2 py-1 rounded"
                        >
                          Adicionar Novo Exemplar
                        </button>
                        <button
                          onClick={() => onAddNewVolume ? onAddNewVolume(exemplar) : onSelectBook(exemplar, "volume")}
                          className="bg-cm-green text-white px-2 py-1 rounded"
                        >
                          Adicionar Novo Volume
                        </button>
                        {exemplar.status === "atrasado" && (
                          <button
                            onClick={() => {
                              fetch(`/api/notifications/nudge`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ user_id: exemplar.student_id, book_title: exemplar.title })
                              })
                                .then(res => res.json())
                                .then(() => {
                                  alert("Cutucada enviada!");
                                })
                                .catch(() => alert("Erro ao enviar cutucada"));
                            }}
                            className="bg-red-600 text-white px-2 py-1 rounded font-bold"
                          >
                            Cutucar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <Button variant="default" onClick={() => {
          console.warn("🟡 [BookSearchList] Voltar clicado");
          onPrevious();
        }}>Voltar</Button>
        {onCancel && <Button variant="default" onClick={() => {
          console.warn("🟡 [BookSearchList] Cancelar clicado");
          onCancel();
        }}>Cancelar</Button>}
      </div>
    </div>
  );
}