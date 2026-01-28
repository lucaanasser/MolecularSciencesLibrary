import { BookOption, AddBookType } from "@/features/books/types/book";
import BookList from "@/features/books/components/lists/BookSearchList";

/**
 * Componente de busca e seleção de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export interface BookSearchStepProps {
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

export default function BookSearchStep({
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
}: BookSearchStepProps) {
  // Log de início de renderização
  console.log("🔵 [BookSearchStep] Renderizando busca de livros");
  return (
    <BookList
      books={books}
      isLoading={isLoading}
      search={search}
      onSearchChange={value => {
        console.log("🟢 [BookSearchStep] Termo de busca alterado:", value);
        onSearchChange(value);
      }}
      onSelectBook={(book, type) => {
        console.log("🟢 [BookSearchStep] Livro selecionado:", book, "Tipo:", type);
        onSelectBook(book, type);
      }}
      onAddNewBook={() => {
        console.log("🟢 [BookSearchStep] Adicionar novo livro clicado");
        onAddNewBook && onAddNewBook();
      }}
      onAddNewVolume={book => {
        console.log("🟢 [BookSearchStep] Adicionar novo volume clicado para livro:", book);
        onAddNewVolume && onAddNewVolume(book);
      }}
      onPrevious={() => {
        console.warn("🟡 [BookSearchStep] Voltar clicado");
        onPrevious();
      }}
      onCancel={onCancel ? () => {
        console.warn("🟡 [BookSearchStep] Cancelar clicado");
        onCancel();
      } : undefined}
      mode={mode}
    />
  );
}