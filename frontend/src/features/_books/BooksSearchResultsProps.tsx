import { FieldConfig } from "../search";
import { searchProps, filtersProps } from ".";
import { BooksService } from "@/services/BooksService";

// Campos do resultado
const resultsFields: FieldConfig[] = [
  { key: "title", type: "main", linkTo: (result) => `/biblioteca/livro/${result.code}`},
  { key: "subtitle", type: "main" },
  { key: "code", type: "secondary" },
  { key: "authors", type: "secondary", className: "text-gray-600" },
];

const searchResultsProps = {
  resultsService: (query: string, filters: any) => BooksService.searchBooks({q: query, ...filters}),
  filterGroupsConfig: filtersProps,
  resultsFields,
  searchProps,
};

export default searchResultsProps;