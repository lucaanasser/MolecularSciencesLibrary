import { useState, useEffect } from "react";
import { BookOption } from "../types/book";

const API_URL = '/api';

export default function useBookSearch(
  category: string,
  subcategory: string,
  enabled = false,
  onError?: (error: Error) => void
) {
  const [books, setBooks] = useState<BookOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!enabled || !category || !subcategory) {
      return;
    }

    setIsLoading(true);
    setBooks([]);
    
    fetch(`${API_URL}/books?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setBooks(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("API Error:", error);
        if (onError) onError(error);
        setBooks([]);
        setIsLoading(false);
      });
  }, [category, subcategory, enabled, onError]);

  // Calculate filtered books based on search term
  const filteredBooks = books.filter(
    b => !search || (b.title && b.title.toLowerCase().includes(search.toLowerCase()))
  );

  return {
    books,
    filteredBooks,
    isLoading,
    search,
    setSearch,
  };
}