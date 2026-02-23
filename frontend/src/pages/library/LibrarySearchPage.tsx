import { searchProps, AreasExplorerTags } from "@/features/_books";
import { SearchPage } from "@/features/search";

// Página de busca da biblioteca
export default function LibrarySearchPage() {
  return (
    <div className="flex flex-col">
      <SearchPage {...searchProps} />
      <AreasExplorerTags onTagClick={(label) => console.log(label)} /> {/*TODO: implementar navegação para página de resultados filtrados por área*/}
    </div>
  );
}