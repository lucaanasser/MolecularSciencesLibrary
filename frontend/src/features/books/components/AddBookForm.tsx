import { useState } from "react";
import useStep from "@/features/books/hooks/useStep";
import useAreaSelection from "@/features/books/hooks/useAreaSelection";
import useBookSearch from "@/features/books/hooks/useFetchSearch";
import useAddBook from "@/features/books/hooks/useAddBook";
import AreaSelection from "@/features/books/components/AreaSelection";
import BookSearchList from "@/features/books/components/BookListForm";
import LanguageSelection from "@/features/books/components/LanguageSelection";
import BookDetailsForm from "@/features/books/components/BookDetailsForm";
import { AddBookType, BookOption } from "@/features/books/types/book";

interface AddBookFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  onError?: (error: Error) => void;
}

export default function AddBookForm({ onCancel, onSuccess, onError }: AddBookFormProps) {
  // Wizard steps: 1=area, 2=pergunta, 3=idioma, 4=form
  const { step, setStep } = useStep(1);

  // Seleção do usuário (área/subárea)
  const {
    category,
    setCategory,
    subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes
  } = useAreaSelection(onError);

  const [selectedBook, setSelectedBook] = useState<BookOption | null>(null);
  const [addType, setAddType] = useState<AddBookType>(null);
  const [language, setLanguage] = useState<number | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [edition, setEdition] = useState("");
  const [volume, setVolume] = useState("");

  const isExemplar = addType === "exemplar" && selectedBook;

  // Custom hooks
  const { filteredBooks, isLoading, search, setSearch } = useBookSearch(
    category,
    subcategory,
    step === 2,
    onError
  );
  const { addBook, isSubmitting } = useAddBook();

  const handleSelectBook = (book: BookOption, type: AddBookType) => {
    setSelectedBook(book);
    setAddType(type);
    // Populate form fields with book data
    if (book) {
      setTitle(book.title || "");
      setAuthors(book.authors || ""); 
      setSubtitle(book.subtitle || "");
      setEdition(book.edition || "");
      setVolume(book.volume || "");
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    const realVolume =
      addType === "exemplar" && selectedBook
        ? selectedBook.volume
        : volume || "1";

    const actualTitle = isExemplar ? (title || selectedBook?.title || "") : title;
    const actualSubtitle = isExemplar ? (subtitle || selectedBook?.subtitle || "") : subtitle;
    const actualAuthors = isExemplar ? (authors || selectedBook?.authors || "") : authors;
    const actualEdition = isExemplar ? (edition || selectedBook?.edition || "") : edition;

    const bookData: any = {
      title: actualTitle,
      subtitle: actualSubtitle,
      authors: actualAuthors,
      edition: actualEdition,
      area: category,
      subarea: subcategory,
      language,
      volume: realVolume,
      isNewVolume: addType === "volume"
    };

    if (addType === "exemplar" && selectedBook) {
      bookData.selectedBook = { code: selectedBook.code };
    }

    if (addType === "volume" && selectedBook) {
      bookData.selectedBook = { code: selectedBook.code };
      bookData.newVolume = volume;
    }

    const result = await addBook(bookData);

    if (result.success) {
      onSuccess();
    } else if (onError && result.error) {
      onError(result.error);
    }
  };

  switch (step) {
    case 1:
      return (
        <AreaSelection
          areaCodes={areaCodes}
          subareaCodes={subareaCodes}
          category={category}
          subcategory={subcategory}
          onCategoryChange={setCategory}
          onSubcategoryChange={setSubcategory}
          onNext={() => setStep(2)}
          onCancel={onCancel}
        />
      );

    case 2:
      return (
        <BookSearchList
          books={filteredBooks}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onSelectBook={handleSelectBook}
          onAddNewBook={() => {
            setAddType("novo");
            setStep(3);
          }}
          onPrevious={() => setStep(1)}
          onCancel={onCancel}
          mode="add" 
        />
      );

    case 3:
      return (
        <LanguageSelection
          onLanguageSelect={(lang) => {
            setLanguage(lang);
            setStep(4);
          }}
          onPrevious={() => setStep(2)}
        />
      );

    case 4:
      return (
        <BookDetailsForm
          title={title}
          subtitle={subtitle} 
          authors={authors}
          edition={edition}
          volume={volume}
          isExemplar={Boolean(isExemplar)}
          selectedBook={selectedBook}
          onTitleChange={setTitle}
          onSubtitleChange={setSubtitle} 
          onAuthorsChange={setAuthors}
          onEditionChange={setEdition}
          onVolumeChange={setVolume}
          onSubmit={handleSubmit}
          onPrevious={() => setStep(3)}
          isSubmitting={isSubmitting}
        />
      );

    default:
      return null;
  }
}