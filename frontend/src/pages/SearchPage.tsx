import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookSearch from "@/features/books/components/BookSearchPanel";

const SearchPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2>Catálogo de Livros</h2>
          <BookSearch />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
