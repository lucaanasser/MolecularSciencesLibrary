import { useState } from "react";
import { BookOption } from "@/features/books/types/book";

export default function useBookLabelSession() {
  const [books, setBooks] = useState<BookOption[]>([]);
  const [spineType, setSpineType] = useState<'normal' | 'fina'>('normal');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const addBook = (book: BookOption) => {
    setBooks((prev) => [...prev, book]);
  };

  const clearBooks = () => {
    setBooks([]);
    setPdfUrl(null);
  };

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/books/labels/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ books, spineType }),
      });
      if (!response.ok) throw new Error("Erro ao gerar PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    books,
    addBook,
    clearBooks,
    spineType,
    setSpineType,
    pdfUrl,
    generatePdf,
    isGenerating,
  };
}
