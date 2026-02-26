import * as React from "react";
import { BookshelfRenderer, ShelfConfig, VirtualShelf, VirtualBookshelfService, useVirtualBookshelf } from ".";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

const VirtualBookshelf: React.FC = () => {
  const isMobile = useIsMobile();

  const {
    bookshelves,
    shelvesConfig,
    loading,
    error,
    reload: fetchData,
    current,
    handlePrev,
    handleNext,
  } = useVirtualBookshelf();
  
  const userData = localStorage.getItem('user');
  const isAdmin = userData ? JSON.parse(userData).role === 'admin' : false;

  if (loading) return <div className="content-container">Carregando estantes...</div>;
  if (error) return <div>Erro: {error}</div>;

  if (isMobile) {
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
