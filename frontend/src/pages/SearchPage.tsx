import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookSearch from "@/features/books/components/BookSearchPanel";

const SearchPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-cm-bg">
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
