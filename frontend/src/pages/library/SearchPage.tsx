import BookSearch from "@/features/books/components/panels/BookSearchPanel";

const SearchPage = () => {
  return (
    <div className="content-container">
        <h2>Catálogo de Livros</h2>
        <BookSearch />
    </div>
  );
};

export default SearchPage;
