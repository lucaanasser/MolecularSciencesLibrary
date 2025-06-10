import { useEffect, useState } from "react";
import useOrderedBooks from "../../hooks/useVirtualBookShelfOrder";
import { Button } from "@/components/ui/button";
import { VirtualShelf } from "@/types/VirtualBookshelf";
import VirtualBookshelfService from "@/services/VirtualBookshelfService";
import BookDetailsModal from "../BookDetailsModal";
import ShelfRenderer from "./ShelfRenderer";
import { useLocation } from "react-router-dom";
import { Pencil } from "lucide-react";

// Defina as estantes e prateleiras
const NUM_SHELVES = 4; // estantes
const NUM_ROWS = 6;    // prateleiras por estante
const shelfNumbers = Array.from({ length: NUM_SHELVES }, (_, i) => i + 1);
const rowNumbers = Array.from({ length: NUM_ROWS }, (_, i) => i + 1); // prateleiras por estante

/**
 * Painel de estante virtual de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const VirtualBookshelf = () => {
  console.log("🔵 [VirtualBookshelf] Renderizando painel da estante virtual");

  // Hooks e estado
  const { books, isLoading, error, refreshBooks } = useOrderedBooks();
  const [selectedShelf, setSelectedShelf] = useState("1");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [shelvesConfig, setShelvesConfig] = useState<VirtualShelf[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [configError, setConfigError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const highlightCode = params.get("highlight");

  // Detecta se é admin
  useEffect(() => {
    setIsPageLoaded(false);
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    setIsAdmin(user?.role === "admin");
    setIsPageLoaded(true);
  }, []);

  // Carrega configuração das prateleiras
  useEffect(() => {
    if (!isPageLoaded) return;
    loadShelvesConfig();
  }, [isPageLoaded]);

  const loadShelvesConfig = async () => {
    try {
      const config = await VirtualBookshelfService.getShelvesConfig();
      setShelvesConfig(config);
    } catch (error) {
      console.error("🔴 [VirtualBookshelf] Erro ao carregar configuração:", error);
      setShelvesConfig([]);
    }
  };

  const handleConfigUpdate = () => {
    loadShelvesConfig();
    refreshBooks();
  };

  const handleError = (error: string) => {
    setConfigError(error);
    setTimeout(() => setConfigError(""), 5000);
  };



  return (
    <div className="w-full py-8">
      <h2 className="text-3xl font-bebas text-center mb-8">Estante Virtual</h2>
      
      {/* Mensagens de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {configError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {configError}
        </div>
      )}

      {/* Seletor de estantes + botão de edição para admin */}
      <div className="flex justify-center gap-2 mb-8">
        {shelfNumbers.map(num => (
          <Button
            key={num}
            onClick={() => setSelectedShelf(num.toString())}
            variant={selectedShelf === num.toString() ? "default" : "outline"}
            className={selectedShelf === num.toString() ? "bg-cm-blue" : ""}
          >
            Estante {num}
          </Button>
        ))}
        {isAdmin && (
          <Button
            variant={editMode ? "default" : "outline"}
            className={`ml-4 ${editMode ? "bg-cm-orange" : ""}`}
            onClick={() => setEditMode(e => !e)}
            title={editMode ? "Sair do modo edição" : "Entrar no modo edição"}
          >
            <Pencil className="h-4 w-4 mr-2" />
            {editMode ? "Sair do modo edição" : "Editar prateleiras"}
          </Button>
        )}
      </div>

      {/* Display da estante atual */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bebas">
          Estante: {selectedShelf}
        </h3>
      </div>

      {/* Exibição das prateleiras */}
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="text-center py-8">Carregando livros...</div>
        ) : (
          <div>
            {/* Renderiza prateleiras baseado no modo de edição */}
            {(editMode && isAdmin
              ? rowNumbers.map(rowNum => {
                  // Busca shelf config para esta prateleira ou cria temporária
                  const shelf = shelvesConfig.find(
                    s => s.shelf_number.toString() === selectedShelf && s.shelf_row === rowNum
                  ) || {
                    id: rowNum, // Use rowNum como id temporário
                    shelf_number: Number(selectedShelf),
                    shelf_row: rowNum,
                    book_code_start: null,
                    book_code_end: null,
                    is_last_shelf: false,
                  };
                  
                  return (
                    <ShelfRenderer
                      key={`${selectedShelf}-${rowNum}`}
                      shelf={shelf}
                      books={books}
                      shelvesConfig={shelvesConfig}
                      isAdmin={isAdmin}
                      editMode={editMode}
                      loading={isLoading}
                      highlightCode={highlightCode}
                      onConfigUpdate={handleConfigUpdate}
                      onError={handleError}
                      onBookSelect={setSelectedBook}
                    />
                  );
                })
              : shelvesConfig
                  .filter(s => s.shelf_number.toString() === selectedShelf)
                  .sort((a, b) => a.shelf_row - b.shelf_row)
                  .map((shelf) => (
                    <ShelfRenderer
                      key={`${shelf.shelf_number}-${shelf.shelf_row}`}
                      shelf={shelf}
                      books={books}
                      shelvesConfig={shelvesConfig}
                      isAdmin={isAdmin}
                      editMode={editMode}
                      loading={isLoading}
                      highlightCode={highlightCode}
                      onConfigUpdate={handleConfigUpdate}
                      onError={handleError}
                      onBookSelect={setSelectedBook}
                    />
                  ))
            )}
            {/* Aviso se não há prateleiras configuradas */}
            {!editMode && shelvesConfig.filter(s => s.shelf_number.toString() === selectedShelf).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Esta estante ainda não foi configurada.</p>
                {isAdmin && (
                  <p className="text-sm mt-2">Use o modo edição para definir códigos iniciais das prateleiras.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalhes do livro */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          showAvailabilityText={true}
          showVirtualShelfButton={false}
        />
      )}
    </div>
  );
};

export default VirtualBookshelf;
