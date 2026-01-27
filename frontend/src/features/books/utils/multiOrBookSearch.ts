import useBookList from "../hooks/useBookList";
import { BookOption } from "../types/book";

export async function multiOrBookSearch({
  category,
  subcategory,
  status,
  language,
  search
}: {
  category: string[];
  subcategory: string[];
  status: string[];
  language: string[];
  search: string;
}): Promise<BookOption[]> {
  // Gera todas as combinações possíveis de filtros (cartesiano)
  const filterArrays = [category.length ? category : [""], subcategory.length ? subcategory : [""], status.length ? status : [""], language.length ? language : [""]];
  const combinations = cartesianProduct(filterArrays);
  const results: BookOption[] = [];
  for (const [cat, sub, stat, lang] of combinations) {
    const filters = {
      category: cat,
      subcategory: sub,
      status: stat,
      language: lang,
      search
    };
    // Chama a API para cada combinação
    const { books } = await useBookList(filters, true);
    results.push(...books);
  }
  // Remove duplicatas por id
  const unique = Object.values(results.reduce((acc, book) => {
    acc[book.id] = book;
    return acc;
  }, {} as Record<string, BookOption>));
  return unique;
}

function cartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]] as string[][]);
}
