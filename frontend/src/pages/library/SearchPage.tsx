import AcademicSearchPage from "@/pages/academic/AcademicSearchPage";

/**
 * Página de busca da biblioteca - Reutiliza o componente Molecoogle
 * com modo fixado em "livros" e sem botões de troca de modo.
 */
const SearchPage = () => {
  return <AcademicSearchPage fixedMode="livros" hideModeSwitcher />;
};

export default SearchPage;
