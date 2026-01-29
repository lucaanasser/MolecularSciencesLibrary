
import Navigation from "@/components/Header";
// import Footer from "@/components/Footer";
import BookSearch from "@/features/books/components/panels/BookSearchPanel";
import { PageContainer } from "@/lib/PageContainer";


const SearchPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex-grow">
        <PageContainer>
          <h2>Catálogo de Livros</h2>
          <BookSearch />
        </PageContainer>
      </div>
      {/* Footer removido, agora está no layout global */}
    </div>
  );
};

export default SearchPage;
