import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookSearch from "@/features/books/components/BookSearchPanel";

// Log de início de renderização da página de busca
console.log("🔵 [SearchPage] Renderizando página de busca de livros");

const SearchPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bebas mb-8">Catálogo de Livros</h1>
          <BookSearch />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
