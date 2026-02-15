import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import ActionBar from "@/features/admin/components/ActionBar";
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import { BooksService } from "@/services/BooksService";
import { Book } from "@/types/new_book";
import BookFormFields from "@/features/admin/features/books/BookFormFields";

const AddBookForm: React.FC<TabComponentProps> = ({ onSuccess, onError, onBack }) => {
  // Estados dos campos do formulário
  const [showManualForm, setShowManualForm] = useState(false);
  const [editableBook, setEditableBookData] = useState<Book>({
    id: undefined,
    code:undefined,
    area: undefined,
    subarea: undefined,
    title: "",
    subtitle: "",
    authors: "",
    edition: undefined,
    volume: undefined,
    language: undefined,
    status: "disponível",
  });
  const [loading, setIsLoading] = useState(false);

  // Estados de busca de livros
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBookcode, setSelectedBookcode] = useState<string | null>(null);

  // Função para buscar livros
  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchResults([]);
    setSelectedBookcode(null);
    try {
      const results = await BooksService.searchBooks({ q: query });
      setSearchResults(results);
      if (results.length === 0) {
        onError("Nenhum livro encontrado. Você pode adicioná-lo manualmente.");
        setShowManualForm(true);
      }
    } catch (err: any) {
      setSearchResults([]);
      onError(err.message || "Erro ao buscar livros.");
    }
  }, [query, onError]);

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Previne múltiplos envios
    setIsLoading(true);
    try {
      await BooksService.addBook(editableBook, selectedBookcode);
      onSuccess("Livro adicionado com sucesso!");
    } catch (err: any) {
      onError(err.message || "Não foi possível adicionar o livro.");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização condicional
  const showInput = !selectedBookcode && searchResults.length === 0 && !showManualForm;
  const showList = !selectedBookcode && searchResults.length > 0 && !showManualForm;

  return (
    <div>
      {/* Busca */}
      {showInput && (
        <div>
          <p>Antes de adicionar, confira se o livro já existe na biblioteca:</p>
          <form onSubmit={handleSearch}>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              required
              placeholder="Digite título, autor ou o código do livro"
            />
            <ActionBar
              onConfirm={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              onCancel={onBack}
              confirmLabel="Buscar"
            />
          </form>
        </div>
      )}

      {/* Lista de resultados */}
      {showList && (
        <div>
          <p className="mb-2">
            Verifique se o livro a ser adicionado já existe no catálogo.
          </p>
          <p className="text-cm-red prose-xs leading-tight mb-0">
            **Se um livro com mesmo autor e título estiver listado, mesmo que seja de outro volume, selecione-o. 
            Você poderá alterar campos no próximo passo, mas isso garante que o novo exemplar seja vinculado ao mesmo registro do catálogo, evitando duplicatas e mantendo o acervo organizado.
          </p>
          <ul>
            {searchResults.map(book => (
              <li key={book.id} className="py-2 flex items-center justify-between">
                <button
                  className="w-full px-4 py-2 rounded-xl hover:bg-gray-100 text-left"
                  onClick={() => {
                    setSelectedBookcode(book.code);
                    const { code, id, status, ...rest } = book 
                    setEditableBookData({ // cria uma cópia editável do livro selecionado
                      ...rest,
                      code: undefined,
                      id: undefined,
                      status:"disponível"
                    });
                  }}
                >
                  <div className="flex flex-row gap-2 prose-sm">
                    <span>{book.code}:</span>
                    <span><b>{book.title}</b>,</span>
                    <span className="text-gray-700">{book.authors}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <ActionBar
            onConfirm={() => setShowManualForm(true)}
            confirmColor="bg-cm-red"
            confirmLabel="Adicionar manualmente"
            onCancel={() => { setSearchResults([]); setQuery(""); }}
          />
        </div>
      )}

      {/* Preenchimento a partir de livro existente */}
      {selectedBookcode && (
        <form onSubmit={handleSubmit}>
          <p>Aqui estão os dados do livro selecionado. Você pode editar as informações desejadas:</p>
          <BookFormFields
            book={editableBook}
            setBook={b => setEditableBookData(prev => ({ ...prev, ...b }))}
            disabledFields={{
              area: true,
              subarea: true,
            }}
          />
          <ActionBar
            onConfirm={() => handleSubmit}
            onCancel={() => setSelectedBookcode(null)}
            confirmLabel="Adicionar exemplar"
            loading={loading}
          />
        </form>
      )}

      {/* Formulário manual */}
      {showManualForm && (
        <form onSubmit={handleSubmit}>
          <p>
            Parece que o livro não foi encontrado no catálogo.
            Preencha os dados manualmente para inseri-lo no acervo:
          </p>
          <BookFormFields
            book={editableBook}
            setBook={b => setEditableBookData(prev => ({ ...prev, ...b }))}
          />
          <ActionBar
            onConfirm={() => handleSubmit}
            onCancel={() => setShowManualForm(false)}
            confirmLabel="Adicionar livro"
            loading={loading}
          />
        </form>
      )}
    </div>
  );
};

export default AddBookForm;