import React, { useState, useEffect } from "react";
import BookshelfRenderer from "@/features/bookshelf/components/BookshelfRenderer";
import ShelfConfig from "@/features/bookshelf/utils/ShelfConfig";
import VirtualBookshelfServiceNew from "@/features/bookshelf/services/VirtualBookshelfService";
import { VirtualShelf } from "@/features/bookshelf/types/virtualbookshelf";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Monitor } from "lucide-react";

const NUM_BOOKSHELVES = 4; // número de estantes
const SHELVES_PER_BOOKSHELF = 6; // número de prateleiras por estante
const MIN_SCREEN_WIDTH = 800; // largura mínima para exibir a estante

const VirtualBookshelf: React.FC = () => {
  const [bookshelves, setBookshelves] = useState<Book[][][]>([]);
  const [shelvesConfig, setShelvesConfig] = useState<VirtualShelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScreenWide, setIsScreenWide] = useState(window.innerWidth >= MIN_SCREEN_WIDTH);

  useEffect(() => {
    const handleResize = () => {
      setIsScreenWide(window.innerWidth >= MIN_SCREEN_WIDTH);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  if (loading) return <div className="content-container">Carregando estantes...</div>;
  if (error) return <div>Erro: {error}</div>;

  if (!isScreenWide) {
    return (
      <div className="content-container flex flex-col justify-center items-center text-center min-h-[calc(100vh-150px)]">
        <Monitor className="h-16 w-16 mb-4" />
        <h2>Tela muito pequena</h2>
        <p>
          A estante virtual precisa de uma tela com pelo menos 800px de largura para ser exibida corretamente.
        </p>
      </div>
    );
  }

  return (
    <div className="content-container flex flex-col justify-center items-center">
      <div className="flex items-center gap-4">
        <h2 style={{ textAlign: "center", marginTop: 16 }}>
          Estante {current + 1}
        </h2>
        {isAdmin && (
          <ShelfConfig
            shelfNumber={current + 1}
            shelvesConfig={shelvesConfig}
            onUpdate={fetchData}
          />
        )}
      </div>

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
