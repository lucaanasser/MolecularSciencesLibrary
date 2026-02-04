import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import useRemoveBook from "@/features/admin/features/books/hooks/useRemoveBook";

/**
 * Formulário simplificado para remoção de livro por código de barras.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
interface RemoveBookFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  onError?: (error: Error) => void;
}

interface Book {
  id: number;
  title: string;
  authors: string;
  edition: string;
  volume: string;
  area: string;
  subarea: string;
  publisher: string;
  year: number;
}

export default function RemoveBookForm({ onCancel, onSuccess, onError }: RemoveBookFormProps) {
  const [barcode, setBarcode] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const { removeBook, isSubmitting } = useRemoveBook();

  const handleSearch = async () => {
    if (!barcode.trim()) {
      setSearchError("Digite um código de barras");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    console.log("🔵 [RemoveBookForm] Buscando livro por código de barras:", barcode);

    try {
      const response = await fetch(`/api/books/${barcode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setSearchError("Livro não encontrado");
        } else {
          setSearchError("Erro ao buscar livro");
        }
        console.error("🔴 [RemoveBookForm] Erro ao buscar livro:", response.statusText);
        return;
      }

      const book = await response.json();
      console.log("🟢 [RemoveBookForm] Livro encontrado:", book);
      setSelectedBook(book);
    } catch (error) {
      console.error("🔴 [RemoveBookForm] Erro ao buscar livro:", error);
      setSearchError("Erro ao buscar livro");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveBook = async () => {
    if (selectedBook) {
      console.log("🔵 [RemoveBookForm] Removendo livro:", selectedBook);
      const result = await removeBook(selectedBook.id.toString());
      if (result.success) {
        console.log("🟢 [RemoveBookForm] Livro removido com sucesso");
        onSuccess();
      } else if (onError && result.error) {
        console.error("🔴 [RemoveBookForm] Erro ao remover livro:", result.error);
        onError(new Error(result.error)); 
      }
    }
  };

  const handleReset = () => {
    setBarcode("");
    setSelectedBook(null);
    setSearchError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !selectedBook) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Remover Livro</h2>
        <p className="text-gray-600">Digite o código de barras do livro que deseja remover do acervo</p>
      </div>

      {!selectedBook ? (
        <div className="">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Digite o código de barras (ex: 9780134685991)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
                className="text-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !barcode.trim()}
              className="bg-cm-blue hover:bg-cm-blue/90 px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>

          {searchError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {searchError}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Informações do Livro</h3>
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Buscar outro livro"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">Código:</span>
                <span className="col-span-2 text-gray-800">{selectedBook.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">Título:</span>
                <span className="col-span-2 text-gray-800">{selectedBook.title}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">Autores:</span>
                <span className="col-span-2 text-gray-800">{selectedBook.authors}</span>
              </div>
              {selectedBook.edition && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium text-gray-600">Edição:</span>
                  <span className="col-span-2 text-gray-800">{selectedBook.edition}</span>
                </div>
              )}
              {selectedBook.volume && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium text-gray-600">Volume:</span>
                  <span className="col-span-2 text-gray-800">{selectedBook.volume}</span>
                </div>
              )}
              {selectedBook.publisher && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium text-gray-600">Editora:</span>
                  <span className="col-span-2 text-gray-800">{selectedBook.publisher}</span>
                </div>
              )}
              {selectedBook.year && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium text-gray-600">Ano:</span>
                  <span className="col-span-2 text-gray-800">{selectedBook.year}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">
              ⚠️ Atenção: Esta ação é permanente e não pode ser desfeita.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="primary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Buscar Outro
            </Button>
            <Button
              variant="primary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRemoveBook}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Removendo..." : "Confirmar Remoção"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}