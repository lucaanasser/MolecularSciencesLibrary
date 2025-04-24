import { useState } from "react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

// Define book type
interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  category: string;
  subcategory?: string;
  available: boolean;
  color: string;
}

// Mock data for demonstration
const generateMockBooks = (count: number): Book[] => {
  const categories = ["Física", "Química", "Biologia", "Matemática", "Computação", "Variados"];
  const subcategories = ["Bioquímica", "Cálculo", "Física Geral", "Orgânica", "Álgebra", "Algoritmos"];
  const colors = ["bg-cm-red", "bg-cm-orange", "bg-cm-yellow", "bg-cm-green", "bg-cm-blue", "bg-gray-600"];
  const authors = [
    "Marie Curie", "Albert Einstein", "Rosalind Franklin", "Stephen Hawking", 
    "Ada Lovelace", "Isaac Newton", "Jane Goodall", "Niels Bohr"
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `book-${i + 1}`,
    title: `Livro ${i + 1}`,
    author: authors[Math.floor(Math.random() * authors.length)],
    year: 1980 + Math.floor(Math.random() * 43), // Random year between 1980 and 2023
    category: categories[Math.floor(Math.random() * categories.length)],
    subcategory: subcategories[Math.floor(Math.random() * subcategories.length)],
    available: Math.random() > 0.3, // 70% chance of being available
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
};

// Component for a single bookshelf (which contains multiple shelves)
const VirtualBookshelf: React.FC = () => {
  const [selectedShelf, setSelectedShelf] = useState<number>(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const shelves = {
    1: "Física e Matemática",
    2: "Química e Bioquímica",
    3: "Biologia e Biotecnologia",
    4: "Computação e Tecnologia",
    5: "Interdisciplinar"
  };

  // Generate 5 shelves with 20 books each
  const shelvesData = Array.from({ length: 5 }, (_, i) => {
    return {
      id: `shelf-${i + 1}`,
      books: generateMockBooks(20)
    };
  });

  return (
    <div className="w-full py-8">
      <h2 className="text-3xl font-bebas text-center mb-8">Estante Virtual</h2>
      
      {/* Shelf Selector */}
      <div className="flex justify-center gap-2 mb-8">
        {Object.entries(shelves).map(([number, name]) => (
          <Button
            key={number}
            onClick={() => setSelectedShelf(Number(number))}
            variant={selectedShelf === Number(number) ? "default" : "outline"}
            className={`${
              selectedShelf === Number(number) ? "bg-cm-blue" : ""
            }`}
          >
            {name}
          </Button>
        ))}
      </div>
      
      {/* Display current shelf number and name */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bebas">
          Estante {selectedShelf}: {shelves[selectedShelf as keyof typeof shelves]}
        </h3>
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bebas mb-2">{selectedBook.title}</h3>
            <div className="mb-4 text-gray-600">
              <p>Autor: {selectedBook.author}</p>
              <p>Ano: {selectedBook.year}</p>
              <p>Categoria: {selectedBook.category}</p>
              {selectedBook.subcategory && (
                <p>Subcategoria: {selectedBook.subcategory}</p>
              )}
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
        {shelvesData.map((shelf) => (
          <div key={shelf.id} className="shelf">
            <div className="flex justify-center mb-1">
              {shelf.books.map((book) => (
                <TooltipProvider key={book.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`book-spine ${book.color}`}
                        onClick={() => handleBookClick(book)}
                      ></div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="text-xs">
                        <p className="font-semibold">{book.author}</p>
                        <p>{book.year}</p>
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
        ))}
      </div>
    </div>
  );
};

export default VirtualBookshelf;
