import { searchResultsProps } from "@/features/_books";
import { SearchResultsPage } from "@/features/search";

export default function LibrarySearchResultsPage() {
  return <SearchResultsPage {...searchResultsProps} />;
}