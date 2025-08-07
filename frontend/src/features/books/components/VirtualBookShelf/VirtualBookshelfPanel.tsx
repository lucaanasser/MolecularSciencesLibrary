import { useEffect, useState } from "react";
import useOrderedBooks from "../../hooks/useVirtualBookShelfOrder";
import { Button } from "@/components/ui/button";
import { VirtualShelf } from "@/types/VirtualBookshelf";
import VirtualBookshelfService from "@/services/VirtualBookshelfService";
import BookDetailsModal from "../BookDetailsModal";
import ShelfRenderer from "./ShelfRenderer";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

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
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"left" | "right">("right");

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

  // Função para trocar de estante com animação de roleta
  const handleShelfChange = (direction: "prev" | "next") => {
    if (
      (direction === "prev" && selectedShelf === "1") ||
      (direction === "next" && selectedShelf === NUM_SHELVES.toString())
    ) {
      return;
    }
    setTransitionDirection(direction === "prev" ? "left" : "right");
    setTransitioning(true);
    setTimeout(() => {
      setSelectedShelf(prev => {
        const current = parseInt(prev, 10);
        if (direction === "prev") {
          return current > 1 ? (current - 1).toString() : prev;
        } else {
          return current < NUM_SHELVES ? (current + 1).toString() : prev;
        }
      });
      setTimeout(() => setTransitioning(false), 50); // Pequeno delay para suavizar
    }, 250); // Reduzido para animação mais fluida
  };

  // NOVO: Adicionar estante
  const handleAddShelfNumber = async () => {
    try {
      // Adiciona todas as prateleiras da nova estante (vazias)
      for (let row = 1; row <= NUM_ROWS; row++) {
        await VirtualBookshelfService.addShelf({
          shelf_number: shelfNumbers.length + 1,
          shelf_row: row,
          book_code_start: null,
          book_code_end: null,
          is_last_shelf: false,
        });
      }
      setSelectedShelf((shelfNumbers.length + 1).toString());
      handleConfigUpdate();
    } catch (error) {
      handleError(error instanceof Error ? error.message : "Erro ao adicionar estante");
    }
  };

  // NOVO: Adicionar prateleira individual à estante atual
  const handleAddShelfRow = async () => {
    try {
      // Descobre o menor shelf_row ainda não usado
      const usedRows = shelvesConfig
        .filter(s => s.shelf_number.toString() === selectedShelf)
        .map(s => s.shelf_row);
      const nextRow = Array.from({ length: NUM_ROWS }, (_, i) => i + 1).find(r => !usedRows.includes(r));
      if (!nextRow) return;
      await VirtualBookshelfService.addShelf({
        shelf_number: Number(selectedShelf),
        shelf_row: nextRow,
        book_code_start: null,
        book_code_end: null,
        is_last_shelf: false,
      });
      handleConfigUpdate();
    } catch (error) {
      handleError(error instanceof Error ? error.message : "Erro ao adicionar prateleira");
    }
  };

  return (
    <div className="w-full py-6 px-4">
      {/* Header de navegação entre estantes - menor e com menos espaçamento */}
      <div className="flex justify-center items-center gap-2 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShelfChange("prev")}
          disabled={selectedShelf === "1" || transitioning}
          className="h-9 w-9"
          aria-label="Estante anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <span
          className="font-bebas select-none text-2xl sm:text-3xl font-bold min-w-[100px] text-center transition-all duration-200"
          style={{
            opacity: transitioning ? 0.7 : 1,
            letterSpacing: "0.04em",
            transition: "opacity 0.2s"
          }}
        >
          Estante {selectedShelf}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShelfChange("next")}
          disabled={selectedShelf === NUM_SHELVES.toString() || transitioning}
          className="h-9 w-9"
          aria-label="Próxima estante"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
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

      {/* Botão para adicionar nova estante (admin). */}
      {isAdmin && editMode && Number(selectedShelf) === shelfNumbers.length && (
        <div className="flex justify-center mb-4">
          <Button onClick={handleAddShelfNumber} variant="outline">
            + Adicionar nova estante
          </Button>
        </div>
      )}

      {/* Exibição das prateleiras com transição de roleta */}
      <div className="max-w-5xl mx-auto mt-20 px-6 py-8 relative">
        <div
          className="transition-all duration-500 ease-out"
          style={{
            transform: transitioning
              ? transitionDirection === "right"
                ? "translateX(100%) scale(0.95)"
                : "translateX(-100%) scale(0.95)"
              : "translateX(0%) scale(1)",
            opacity: transitioning ? 0 : 1,
            filter: transitioning ? "blur(2px)" : "blur(0px)",
            pointerEvents: transitioning ? "none" : "auto",
          }}
        >
          {isLoading ? (
            <div className="text-center py-8">Carregando livros...</div>
          ) : (
            <div>
              {/* Renderiza prateleiras baseado no modo de edição */}
              {(editMode && isAdmin
                ? rowNumbers.map(rowNum => {
                    // Busca shelf config para esta prateleira ou cria temporária
                    const shelf = shelvesConfig.find(
                      (s: VirtualShelf) => s.shelf_number.toString() === selectedShelf && s.shelf_row === rowNum
                    ) || {
                      id: rowNum, // Use rowNum como id temporário
                      shelf_number: Number(selectedShelf),
                      shelf_row: rowNum,
                      book_code_start: null,
                      book_code_end: null,
                      is_last_shelf: false,
                    } as VirtualShelf;
                    
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
                    .filter((s: VirtualShelf) => s.shelf_number.toString() === selectedShelf)
                    .sort((a, b) => a.shelf_row - b.shelf_row)
                    .map((shelf: VirtualShelf) => (
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

              {/* Botão para adicionar prateleira individual (admin) */}
              {isAdmin && editMode && (
                (() => {
                  const prateleirasNaEstante = shelvesConfig.filter(s => s.shelf_number.toString() === selectedShelf).length;
                  if (prateleirasNaEstante < NUM_ROWS) {
                    return (
                      <div className="flex justify-center mt-4">
                        <Button onClick={handleAddShelfRow} variant="outline">
                          + Adicionar prateleira à estante {selectedShelf}
                        </Button>
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </div>
          )}
        </div>
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
