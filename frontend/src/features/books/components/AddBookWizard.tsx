import { useState } from "react";
import useStep from "@/features/books/hooks/useStep";
import useAreaSelection from "@/features/books/hooks/useAreaSelection";
import useBookSearch from "@/features/books/hooks/useBookList";
import useAddBook from "@/features/books/hooks/useCreatBook";
import { AddBookType, BookOption } from "@/features/books/types/book";
import BookAreaStep from "@/features/books/components/steps/BookAreaStep";
import BookSearchStep from "@/features/books/components/steps/BookSearchStep";
import BookLanguageStep from "@/features/books/components/steps/BookLanguageStep";
import BookDetailsStep from "@/features/books/components/steps/BookDetailsStep";

interface AddBookFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  onError?: (error: Error) => void;
}

export default function AddBookForm({ onCancel, onSuccess, onError }: AddBookFormProps) {
  const { step, setStep } = useStep(1);

  const {
    category,
    setCategory,
    subcategory,
    setSubcategory,
    areaCodes,
    subareaCodes
  } = useAreaSelection(onError);

  const [selectedBook, setSelectedBook] = useState<BookOption | null>(null);
  const [addType, setAddType] = useState<AddBookType | null>(null);
  const [language, setLanguage] = useState<number | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [edition, setEdition] = useState("");
  const [volume, setVolume] = useState("");

  // Novo: controla se o campo volume está travado
  const [isVolumeLocked, setIsVolumeLocked] = useState(false);

  // Custom hooks
  const { filteredBooks, isLoading, search, setSearch } = useBookSearch(
    category,
    subcategory,
    step === 2,
    onError
  );
  const { addBook, isSubmitting } = useAddBook();

  // Handler para adicionar novo exemplar
  const handleAddExemplar = (book: BookOption) => {
    setSelectedBook(book);
    setAddType("exemplar");
    setTitle(book.title || "");
    setAuthors(book.authors || "");
    setSubtitle(book.subtitle || "");
    setEdition(book.edition || "");
    setVolume(book.volume || "");
    setIsVolumeLocked(true); // trava o campo volume
    setStep(3);
  };

  // Handler para adicionar novo volume
  const handleAddNewVolume = (book: BookOption) => {
    setSelectedBook(book);
    setAddType("volume");
    setTitle(book.title || "");
    setAuthors(book.authors || "");
    setSubtitle(book.subtitle || "");
    setEdition(book.edition || "");
    setVolume(""); // Limpa para permitir edição
    setIsVolumeLocked(false); // libera o campo volume
    setStep(3);
  };

  // Handler para adicionar novo livro
  const handleAddNewBook = () => {
    setAddType("novo");
    setSelectedBook(null);
    setTitle("");
    setSubtitle("");
    setAuthors("");
    setEdition("");
    setVolume("");
    setIsVolumeLocked(false); // libera o campo volume
    setStep(3);
  };

  const handleSelectBook = (book: BookOption, type?: AddBookType) => {
    setSelectedBook(book);
    setAddType(type || "exemplar");
    setTitle(book.title || "");
    setAuthors(book.authors || "");
    setSubtitle(book.subtitle || "");
    setEdition(book.edition || "");
    setVolume(type === "volume" ? "" : book.volume || "");
    setIsVolumeLocked(type !== "volume"); // trava volume se não for volume
    setStep(3);
  };

  const handleSubmit = async () => {
    // Para novo exemplar, volume é herdado do livro selecionado
    // Para novo volume, volume é o digitado
    // Para novo livro, volume é o digitado ou 1
    const realVolume =
      addType === "exemplar" && selectedBook
        ? selectedBook.volume
        : volume || "1";

    const actualTitle = addType === "exemplar" && selectedBook ? (title || selectedBook.title || "") : title;
    const actualSubtitle = addType === "exemplar" && selectedBook ? (subtitle || selectedBook.subtitle || "") : subtitle;
    const actualAuthors = addType === "exemplar" && selectedBook ? (authors || selectedBook.authors || "") : authors;
    const actualEdition = addType === "exemplar" && selectedBook ? (edition || selectedBook.edition || "") : edition;

    const bookData: any = {
      title: actualTitle,
      subtitle: actualSubtitle,
      authors: actualAuthors,
      edition: actualEdition,
      area: category,
      subarea: subcategory,
      language,
      volume: realVolume,
      isNewVolume: addType === "volume",
      addType
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
        <BookAreaStep
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
        <BookSearchStep
          books={filteredBooks}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onSelectBook={handleSelectBook}
          onAddNewBook={handleAddNewBook}
          onAddNewVolume={handleAddNewVolume}
          onPrevious={() => setStep(1)}
          onCancel={onCancel}
          mode="add"
        />
      );

    case 3:
      return (
        <BookLanguageStep
          onLanguageSelect={(lang) => {
            setLanguage(lang);
            setStep(4);
          }}
          onPrevious={() => setStep(2)}
        />
      );

    case 4:
      return (
        <BookDetailsStep
          title={title}
          subtitle={subtitle}
          authors={authors}
          edition={edition}
          volume={volume}
          isExemplar={addType === "exemplar"}
          addType={addType || ""}
          selectedBook={selectedBook}
          onTitleChange={setTitle}
          onSubtitleChange={setSubtitle}
          onAuthorsChange={setAuthors}
          onEditionChange={setEdition}
          onVolumeChange={setVolume}
          onSubmit={handleSubmit}
          onPrevious={() => setStep(3)}
          isSubmitting={isSubmitting}
          isVolumeLocked={isVolumeLocked} // passa nova prop
        />
      );

    default:
      return null;
  }
}