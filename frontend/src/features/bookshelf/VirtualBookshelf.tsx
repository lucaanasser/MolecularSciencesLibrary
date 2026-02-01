import React, { useState, useEffect } from "react";
import BookshelfRenderer from "@/features/bookshelf/BookshelfRenderer";
import ShelfConfig from "@/features/bookshelf/ShelfConfig";
import VirtualBookshelfServiceNew from "@/services/VirtualBookshelfServiceNew";
import { Book, VirtualShelf } from "@/types/VirtualBookshelf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

const NUM_BOOKSHELVES = 4; // número de estantes
const SHELVES_PER_BOOKSHELF = 6; // número de prateleiras por estante

const VirtualBookshelf: React.FC = () => {
  const [bookshelves, setBookshelves] = useState<Book[][][]>([]);
  const [shelvesConfig, setShelvesConfig] = useState<VirtualShelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar se é admin
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === 'admin');
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar configurações das prateleiras
      const config = await VirtualBookshelfServiceNew.getShelvesConfig();
      setShelvesConfig(config);

      // Buscar livros de todas as prateleiras
      const allShelves: Book[][][] = [];
      for (let shelfNumber = 1; shelfNumber <= NUM_BOOKSHELVES; shelfNumber++) {
        const shelves: Book[][] = [];
        for (let shelfRow = 1; shelfRow <= SHELVES_PER_BOOKSHELF; shelfRow++) {
          const books = await VirtualBookshelfServiceNew.getBooksByShelf(shelfNumber, shelfRow);
          shelves.push(books);
        }
        allShelves.push(shelves);
      }
      setBookshelves(allShelves);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar estantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrev = () => setCurrent((prev) => (prev > 0 ? prev - 1 : prev));
  const handleNext = () => setCurrent((prev) => (prev < bookshelves.length - 1 ? prev + 1 : prev));

  if (loading) return <div>Carregando estantes...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="content-container flex flex-col justify-center items-center">
      <div className="flex items-center gap-4 mb-4">
        <h2 style={{ textAlign: "center", marginTop: 16 }}>
          Estante {current + 1}
        </h2>
        {isAdmin && (
          <Button
            variant={showConfig ? "default" : "secondary"}
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showConfig ? 'Ocultar' : 'Configurar'}
          </Button>
        )}
      </div>

      {isAdmin && showConfig && (
        <div className="w-full max-w-5xl mb-4 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-3">Configurar Prateleiras - Estante {current + 1}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure o código inicial de cada prateleira. O código final é calculado automaticamente.
          </p>
          {[1, 2, 3, 4, 5, 6].map(row => {
            const config = shelvesConfig.find(s => s.shelf_number === current + 1 && s.shelf_row === row);
            return (
              <ShelfConfig
                key={`${current + 1}-${row}`}
                shelfNumber={current + 1}
                shelfRow={row}
                currentStartCode={config?.book_code_start || undefined}
                currentEndCode={config?.book_code_end || config?.calculated_book_code_end || undefined}
                onUpdate={fetchData}
              />
            );
          })}
        </div>
      )}

      <div className="w-full max-w-5xl flex justify-center items-center">
        <Button
          onClick={handlePrev}
          disabled={current === 0}
          variant="ghost"
          size="icon"
          className="mr-2"
          aria-label="Estante anterior"
          style={{ opacity: current === 0 ? 0.4 : 1 }}
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
        <div className="flex-1">
          {/* Renderiza as prateleiras da estante atual */}
          <BookshelfRenderer key={current} booksByShelf={bookshelves[current]} />
        </div>
        <Button
          onClick={handleNext}
          disabled={current === bookshelves.length - 1}
          variant="ghost"
          size="icon"
          className="ml-2"
          aria-label="Próxima estante"
          style={{ opacity: current === bookshelves.length - 1 ? 0.4 : 1 }}
        >
          <ChevronRight className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
};

export default VirtualBookshelf;
