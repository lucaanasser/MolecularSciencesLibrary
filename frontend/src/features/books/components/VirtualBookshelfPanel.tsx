import { useState } from "react";
import useBookSearch from "../hooks/useBookList";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

// Defina as áreas/prateleiras
const shelves = {
  "Física": "Física e Matemática",
  "Química": "Química e Bioquímica",
  "Biologia": "Biologia e Biotecnologia",
  "Matemática": "Matemática",
  "Computação": "Computação e Tecnologia",
  "Variados": "Interdisciplinar"
};

const shelfOrder = Object.keys(shelves);

const BOOK_COLORS = [
  "bg-cm-red",
  "bg-cm-orange",
  "bg-cm-yellow",
  "bg-cm-green",
  "bg-cm-blue",
  "bg-cm-purple"
];

// Função para escolher cor baseada no id do livro (ou outro campo único)
function getBookColor(bookId: number) {
  return BOOK_COLORS[bookId % BOOK_COLORS.length];
}

const VirtualBookshelf: React.FC = () => {
  const [selectedShelf, setSelectedShelf] = useState<string>(shelfOrder[0]);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  // Busca todos os livros (sem filtro)
  const { books, isLoading } = useBookSearch("", "", true);

  // Agrupa livros por área
  const booksByShelf = shelfOrder.reduce((acc, area) => {
    acc[area] = books.filter(book => book.area === area);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="w-full py-8">
      <h2 className="text-3xl font-bebas text-center mb-8">Estante Virtual</h2>
      
      {/* Shelf Selector */}
      <div className="flex justify-center gap-2 mb-8">
        {shelfOrder.map(area => (
          <Button
            key={area}
            onClick={() => setSelectedShelf(area)}
            variant={selectedShelf === area ? "default" : "outline"}
            className={selectedShelf === area ? "bg-cm-blue" : ""}
          >
            {shelves[area]}
          </Button>
        ))}
      </div>
      
      {/* Display current shelf */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bebas">
          Estante: {shelves[selectedShelf]}
        </h3>
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bebas mb-2">{selectedBook.title}</h3>
            <div className="mb-4 text-gray-600">
              <p>Autor: {selectedBook.authors}</p>
              <p>Código: {selectedBook.code}</p>
              <p>Área: {selectedBook.area}</p>
              <p>Subárea: {selectedBook.subarea}</p>
              <p className={`font-semibold ${selectedBook.available ? "text-cm-green" : "text-cm-red"}`}>
                {selectedBook.available ? "Disponível" : "Emprestado"}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBook(null)}
                className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookshelves */}
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="text-center py-8">Carregando livros...</div>
        ) : (
          <div className="shelf">
            <div className="flex flex-wrap justify-center mb-1 gap-1">
              {booksByShelf[selectedShelf]?.map((book) => (
                <TooltipProvider key={book.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`book-spine ${getBookColor(book.id)} cursor-pointer`}
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualBookshelf;
