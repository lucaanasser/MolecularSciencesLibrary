
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookSearch from "@/features/books/components/BookSearchPanel";
import { PageContainer } from "@/lib/PageContainer";


const SearchPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow">
        <PageContainer>
          <h2>Catálogo de Livros</h2>
          <BookSearch />
        </PageContainer>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
