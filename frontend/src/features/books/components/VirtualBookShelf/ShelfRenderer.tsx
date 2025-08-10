import React, { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VirtualShelf } from "@/types/VirtualBookshelf";
import VirtualBookshelfAdminEditor from "./VirtualBookshelfAdminEditor";
import { Pencil } from "lucide-react";

interface ShelfRendererProps {
  shelf: VirtualShelf;
  books: any[];
  shelvesConfig: VirtualShelf[];
  isAdmin: boolean;
  editMode: boolean;
  loading: boolean;
  highlightCode: string | null;
  onConfigUpdate: () => void;
  onError: (error: string) => void;
  onBookSelect: (book: any) => void;
  maxBooks?: number;
}

/**
 * Componente responsável por renderizar uma única prateleira
 * Gerencia a exibição de livros e controles administrativos
 */
const ShelfRenderer: React.FC<ShelfRendererProps> = ({
  shelf,
  books,
  shelvesConfig,
  isAdmin,
  editMode,
  loading,
  highlightCode,
  onConfigUpdate,
  onError,
  onBookSelect,
  maxBooks = 40
}) => {
  const [editing, setEditing] = useState(false);
  
  // Função para obter cor do livro baseada na área
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

  // Determina quais livros pertencem a esta prateleira baseado em códigos START
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

  const shelfBooks = getBooksForShelf(shelf, shelvesConfig, books).slice(0, maxBooks);

  // Estado para controlar destaque passageiro
  const [highlightedBook, setHighlightedBook] = useState<string | null>(null);

  // Ativa animação de pulso quando highlightCode muda
  useEffect(() => {
    if (highlightCode) {
      setHighlightedBook(highlightCode);
      const timeout = setTimeout(() => setHighlightedBook(null), 1800); // 1.8s
      return () => clearTimeout(timeout);
    }
  }, [highlightCode]);

  return (
    <div className="mb-12 px-2">
      {/* Linha da prateleira */}
      <div className="relative w-full h-[100px] flex items-end pt-8">
        {/* Se está editando, mostra editor inline */}
        {isAdmin && editMode && editing ? (
          <div className="flex w-full items-center justify-between bg-white border rounded px-4 py-2 shadow z-10">
            <VirtualBookshelfAdminEditor
              shelf={shelf}
              loading={loading}
              onConfigUpdate={() => { setEditing(false); onConfigUpdate(); }}
              onError={onError}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            {/* Livros */}
            <div className="flex flex-wrap gap-1 items-end" style={{zIndex:2, flex: 1}}>
              {shelfBooks.length > 0 ? (
                shelfBooks.map((book) => (
                  <TooltipProvider key={book.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`book-spine ${getBookColor(book)} cursor-pointer mb-6${isAdmin && editMode ? " relative z-0" : ""} ${highlightedBook === book.code ? "pulse-highlight" : ""}`}
                          onClick={() => onBookSelect(book)}
                          title={book.title}
                          style={{ minWidth: 16, minHeight: 70 }}
                        ></div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="z-50">
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
                <div className="text-gray-400 text-sm italic mb-6">
                  {shelf.book_code_start ? "Nenhum livro nesta prateleira" : "Prateleira vazia"}
                </div>
              )}
            </div>
            {/* Botão editar no canto direito */}
            {isAdmin && editMode && (
              <button
                className="ml-2 p-1 rounded hover:bg-gray-100 border"
                onClick={() => setEditing(true)}
                title="Editar prateleira"
                style={{zIndex:3}}
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </>
        )}
        {/* Linha da prateleira visual */}
        <div className="absolute left-0 bottom-0 w-full h-[3px] bg-gray-700 rounded" style={{zIndex:1}}></div>
      </div>
    </div>
  );
};

export default ShelfRenderer;
