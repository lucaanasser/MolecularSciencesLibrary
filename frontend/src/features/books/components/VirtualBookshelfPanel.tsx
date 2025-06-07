import { useEffect, useState } from "react";
import useOrderedBooks from "../hooks/useVirtualBookShelfOrder";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { VirtualShelf } from "@/types/VirtualBookshelf";
import VirtualBookshelfService from "@/services/VirtualBookshelfService";
import ShelfConfigEditor from "./ShelfConfigEditor";
import BookDetailsModal from "./BookDetailsModal";
import { useLocation } from "react-router-dom";

// Defina as estantes e prateleiras
const NUM_SHELVES = 4; // estantes
const NUM_ROWS = 6;    // prateleiras por estante
const shelfNumbers = Array.from({ length: NUM_SHELVES }, (_, i) => i + 1);

const BOOK_COLORS = [
  "bg-cm-red",
  "bg-cm-orange", 
  "bg-cm-yellow",
  "bg-cm-green",
  "bg-cm-blue",
  "bg-cm-purple"
];

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
  const [configMode, setConfigMode] = useState(false);
  const [configError, setConfigError] = useState("");

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

  const getBookColor = (book: any) => {
    // Se o livro está emprestado (ou seja, não está disponível), pinta de cinza
    if (!book.available) return "bg-gray-400";
    // Caso contrário, usa a cor da área
    switch ((book.area || "").toUpperCase()) {
      case "BIO": return "bg-cm-green";
      case "QUI": return "bg-cm-yellow";
      case "MAT": return "bg-cm-red";
      case "FIS": return "bg-cm-orange";
      case "COMP": return "bg-cm-blue";
      case "VAR": return "bg-cm-purple";
      default: return "bg-gray-200";
    }
  };

  // Nova lógica: determina quais livros pertencem a uma prateleira baseado em códigos START
  const getBooksForShelf = (shelf: VirtualShelf, allShelves: VirtualShelf[], books: any[]) => {
    // Se não tem código inicial definido, não mostra livros
    if (!shelf.book_code_start) return [];
    
    // Encontra próxima prateleira na mesma estante para determinar fim
    const shelvesInBookcase = allShelves
      .filter(s => s.shelf_number === shelf.shelf_number && s.book_code_start)
      .sort((a, b) => a.shelf_row - b.shelf_row);
    
    const currentIndex = shelvesInBookcase.findIndex(s => 
      s.shelf_row === shelf.shelf_row
    );
    
    const nextShelf = currentIndex < shelvesInBookcase.length - 1 
      ? shelvesInBookcase[currentIndex + 1] 
      : null;
    
    const startCode = shelf.book_code_start;
    // Se há próxima prateleira, usa seu código inicial como limite
    // Se é última prateleira, usa seu código final definido manualmente
    const endCode = nextShelf 
      ? getPreviousCode(nextShelf.book_code_start!)
      : (shelf.book_code_end || shelf.calculated_book_code_end);
    
    if (!endCode) return [];
    
    // Filtra livros que pertencem a esta prateleira
    return books.filter(book => {
      return book.code >= startCode && book.code <= endCode;
    });
  };

  // Função auxiliar para calcular código anterior (similar ao backend)
  const getPreviousCode = (code: string): string => {
    const parts = code.split('-');
    if (parts.length !== 2) return code;
    
    const [prefix, numberPart] = parts;
    const numberMatch = numberPart.match(/^(\d+)\.(\d+)$/);
    
    if (!numberMatch) return code;
    
    let [, major, minor] = numberMatch;
    let majorNum = parseInt(major, 10);
    let minorNum = parseInt(minor, 10);
    
    if (minorNum > 1) {
      minorNum--;
    } else if (majorNum > 1) {
      majorNum--;
      minorNum = 99; // Assume que vai até 99
    } else {
      return code; // Não pode decrementar mais
    }
    
    const paddedMajor = majorNum.toString().padStart(major.length, '0');
    const paddedMinor = minorNum.toString().padStart(minor.length, '0');
    
    return `${prefix}-${paddedMajor}.${paddedMinor}`;
  };

  const handleConfigUpdate = () => {
    loadShelvesConfig();
    refreshBooks();
  };

  const handleConfigError = (error: string) => {
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

      {/* Admin: Configuração de prateleiras */}
      {isPageLoaded && isAdmin && (
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={() => setConfigMode(!configMode)}
              variant={configMode ? "default" : "outline"}
            >
              {configMode ? "Ocultar Configuração" : "Configurar Prateleiras"}
            </Button>
          </div>

          {configMode && (
            <ShelfConfigEditor
              shelves={shelvesConfig}
              onUpdate={handleConfigUpdate}
              onError={handleConfigError}
            />
          )}
        </div>
      )}

      {/* Seletor de estantes */}
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
          <div className="shelf">
            {shelvesConfig
              .filter(s => s.shelf_number.toString() === selectedShelf)
              .sort((a, b) => a.shelf_row - b.shelf_row)
              .map((shelf, idx) => {
                const shelfBooks = getBooksForShelf(shelf, shelvesConfig, books);
                
                // Só mostra prateleiras que têm configuração de código inicial
                if (!shelf.book_code_start) return null;
                
                return (
                  <div key={`${shelf.shelf_number}-${shelf.shelf_row}`} className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="font-semibold">Prateleira {shelf.shelf_row}</div>
                      <div className="text-xs text-gray-600">
                        <span className="bg-blue-100 px-2 py-1 rounded mr-2">
                          Início: {shelf.book_code_start}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Fim: {shelf.calculated_book_code_end || shelf.book_code_end || 'Auto'}
                        </span>
                        {shelf.is_last_shelf && (
                          <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded ml-2">
                            🔚 Última
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-start mb-1 gap-1 min-h-[64px] bg-gray-50 p-2 rounded border">
                      {shelfBooks.length > 0 ? (
                        shelfBooks.map((book) => (
                          <TooltipProvider key={book.id} delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`book-spine ${getBookColor(book)} cursor-pointer ${highlightCode === book.code ? "ring-4 ring-cm-blue scale-110 z-10" : ""}`}
                                  onClick={() => setSelectedBook(book)}
                                  title={book.title}
                                  style={{ minWidth: 16, minHeight: 60 }}
                                ></div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs">
                                  <p className="font-semibold">{book.title}</p>
                                  <p>{book.authors}</p>
                                  <p>{book.code}</p>
                                  <p className={book.available ? "text-green-600" : "text-red-600"}>
                                    {book.available ? "Disponível" : "Emprestado"}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))
                      ) : (
                        <div className="text-gray-400 text-sm italic">
                          Nenhum livro nesta prateleira
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            
            {/* Aviso se não há prateleiras configuradas */}
            {shelvesConfig.filter(s => s.shelf_number.toString() === selectedShelf).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Esta estante ainda não foi configurada.</p>
                {isAdmin && (
                  <p className="text-sm mt-2">Use o botão "Configurar Prateleiras" para definir códigos iniciais.</p>
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
