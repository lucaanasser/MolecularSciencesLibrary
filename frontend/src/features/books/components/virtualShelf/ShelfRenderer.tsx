import React, { useState, useEffect } from "react";
import { getResolvedSubarea } from "@/utils/bookUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VirtualShelf } from "@/types/VirtualBookshelf";
import VirtualBookshelfAdminEditor from "./VirtualBookshelfAdminEditor";
import { Pencil } from "lucide-react";

interface ShelfRendererProps {
  subareaCodes?: Record<string, Record<string, string | number>>;
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
  maxBooks = 40,
  subareaCodes
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
      case "CMP": return "bg-cm-blue";
      case "VAR": return "bg-library-purple";
      default: return "bg-gray-200";
    }
  };

  // Parsing e comparação de códigos (compatível com "BIO-03.02 v.1" e "BIO-03.02-v1")
  const parseBookCode = (code: string) => {
    if (!code) return { area: '', sub: 0, seq: 0, vol: 0 };
    const normalized = String(code).trim().replace(/\s+/g, ' ');
    const mainMatch = normalized.match(/^([A-Za-z]{3})-(\d{2})\.(\d{2})/);
    if (!mainMatch) return { area: normalized, sub: 0, seq: 0, vol: 0 };
    const area = mainMatch[1].toUpperCase();
    const sub = parseInt(mainMatch[2], 10) || 0;
    const seq = parseInt(mainMatch[3], 10) || 0;
    const volMatch = normalized.match(/(?:^|[\s-])v\.?([0-9]+)\s*$/i);
    const vol = volMatch ? parseInt(volMatch[1], 10) || 0 : 0;
    return { area, sub, seq, vol };
  };

  const compareBookCodes = (a: string, b: string) => {
    const A = parseBookCode(a);
    const B = parseBookCode(b);
    const areaOrder = ['BIO','QUI','FIS','MAT','CMP','VAR'];
    const ia = areaOrder.indexOf(A.area);
    const ib = areaOrder.indexOf(B.area);
    if (ia !== ib) return ia - ib;
    if (A.sub !== B.sub) return A.sub - B.sub;
    if (A.seq !== B.seq) return A.seq - B.seq;
    return A.vol - B.vol;
  };

  const isCodeInRange = (code: string, start: string, end: string) => {
    return compareBookCodes(code, start) >= 0 && compareBookCodes(code, end) <= 0;
  };

  // Sempre determina os livros da prateleira usando book_code_start e book_code_end definidos manualmente
  const getBooksForShelf = (shelf: VirtualShelf, _allShelves: VirtualShelf[], books: any[]) => {
    if (!shelf.book_code_start || !shelf.book_code_end) return [];
    const startCode = shelf.book_code_start;
    const endCode = shelf.book_code_end;
    return books.filter(book => isCodeInRange(book.code, startCode, endCode));
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

  // Estado para controlar destaque fixo ao clicar
  const [highlightedBook, setHighlightedBook] = useState<string | null>(null);

  // Remove destaque ao clicar fora
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Se o clique não foi em um book-spine
      if (!(e.target as HTMLElement).classList.contains('book-spine')) {
        setHighlightedBook(null);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (highlightCode) {
      setHighlightedBook(highlightCode);
    }
  }, [highlightCode]);

  return (
    <div className="mb-3 px-2">
      <div className="relative w-[90%] h-[100px] flex items-end pt-8 pl-4 mx-auto">
        {isAdmin && editMode && editing ? (
          <div className="flex w-full items-center justify-between bg-white rounded px-4 py-2 shadow z-10">
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
            <div className="flex items-end w-full" style={{zIndex:2, flex: 1}}>
              {shelfBooks.length > 0 ? (
                shelfBooks.map((book) => (
                  <TooltipProvider key={book.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`book-spine ${getBookColor(book)} cursor-pointer mb-1${isAdmin && editMode ? " relative z-0" : ""} ${highlightedBook === book.code ? "-translate-y-2" : ""}`}
                          onClick={() => setHighlightedBook(book.code)}
                          onMouseEnter={() => setHighlightedBook(null)}
                          title={book.title}
                          style={{
                            width: 16,
                            minWidth: 12,
                            height: 70,
                            maxWidth: 24,
                            transition: 'transform 0.2s',
                          }}
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
                          {book.area && book.subarea && subareaCodes && (
                            <p className="text-gray-500">{getResolvedSubarea(book.area, book.subarea, subareaCodes)}</p>
                          )}
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
