import { useEffect, useState } from "react";
import useOrderedBooks from "../../hooks/useVirtualBookShelfOrder";
import { Button } from "@/components/ui/button";
import { VirtualShelf } from "@/types/VirtualBookshelf";
import VirtualBookshelfService from "@/services/VirtualBookshelfService";
import BookDetailsModal from "../BookDetailsModal";
import ShelfRenderer from "./ShelfRenderer";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import useBookOptions from "../../hooks/useBookOptions"; // novo

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
  const { subareaCodes } = useBookOptions(); // obter mapeamentos
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
    <div className="w-full py-6 px-2">
      {/* Header de navegação entre estantes - menor e com menos espaçamento */}
      <div className="flex justify-center items-center gap-2 mb-8">
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

      {/* Container flexível para as estantes lado a lado com scroll horizontal */}
      <div
        className="overflow-x-auto w-full"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="flex flex-row flex-nowrap gap-6 px-1"
        >
          {shelfNumbers.map((shelfNum) => (
            <div
              key={shelfNum}
              className="bg-white p-4 flex flex-col gap-2 min-w-[340px] w-[95vw] sm:min-w-[480px] sm:w-[480px] lg:min-w-[520px] lg:w-[520px] xl:min-w-[600px] xl:w-[600px]"
            >
            <div className="mb-2 text-center font-bold text-lg">Estante {shelfNum}</div>
            <div className="flex flex-col gap-0.1">
              {(editMode && isAdmin
                ? rowNumbers.map(rowNum => {
                    const shelf = shelvesConfig.find(
                      (s: VirtualShelf) => s.shelf_number === shelfNum && s.shelf_row === rowNum
                    ) || {
                      id: rowNum,
                      shelf_number: shelfNum,
                      shelf_row: rowNum,
                      book_code_start: null,
                      book_code_end: null,
                      is_last_shelf: false,
                    } as VirtualShelf;
                    return (
                      <ShelfRenderer
                        key={`${shelfNum}-${rowNum}`}
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
                    .filter((s: VirtualShelf) => s.shelf_number === shelfNum)
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
            </div>
            {/* Botão para adicionar prateleira individual (admin) */}
            {isAdmin && editMode && (() => {
              const prateleirasNaEstante = shelvesConfig.filter(s => s.shelf_number === shelfNum).length;
              if (prateleirasNaEstante < NUM_ROWS) {
                return (
                  <div className="flex justify-center mt-2">
                    <Button onClick={handleAddShelfRow} variant="outline" className="text-xs py-1 px-2">
                      + Adicionar prateleira à estante {shelfNum}
                    </Button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
            ))}
        </div>
      </div>

      {/* Modal de detalhes do livro */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          showAvailabilityText={true}
          showVirtualShelfButton={false}
          subareaCodes={subareaCodes}
        />
      )}
    </div>
  );
};

export default VirtualBookshelf;
