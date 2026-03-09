import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, MessageSquare, Info } from "lucide-react";
import {
  getBookEvaluations,
  getBookAggregatedRatings,
  getMyBookEvaluation,
  createBookEvaluation,
  updateBookEvaluation,
  deleteBookEvaluation,
  toggleBookEvaluationLike,
  type BookEvaluation,
  type BookAggregatedRatings,
} from "@/services/BookEvaluationsService";
import { useEvaluations, RatingCard, EvaluationsTab } from "@/features/rating";
import ResultPage from "@/features/result-page/ResultPage";
import { PageLoadingState, PageErrorState } from "@/features/result-page";
import {
  BookInfoSection,
  useBookPage,
  BOOK_INITIAL_RATINGS,
  BOOK_CRITERIOS_FORM,
  BOOK_CRITERIOS_CARD,
} from "@/features/library-book";
import { AREA_COLORS } from "@/constants";


// ─── Component ────────────────────────────────────────────────────────────────

const BookPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "avaliacoes">("info");
  const isLoggedIn = !!localStorage.getItem("token");

  const { books, book, loanByBook, isLoading, error } = useBookPage(code);
  const bookId = book?.id ?? null;
  
  // ─── Evaluation hook ──────────────────────────────────────────────────────

  const evalState = useEvaluations<BookEvaluation, BookAggregatedRatings>({
    entityKey: bookId,
    isLoggedIn,
    initialFormRatings: BOOK_INITIAL_RATINGS,
    fetchAll: useCallback(
      () => (bookId ? getBookEvaluations(bookId) : Promise.resolve([])),
      [bookId]
    ),
    fetchStats: useCallback(
      () =>
        bookId
          ? getBookAggregatedRatings(bookId)
          : Promise.resolve(null as unknown as BookAggregatedRatings),
      [bookId]
    ),
    fetchMine: useCallback(
      () => (bookId ? getMyBookEvaluation(bookId) : Promise.resolve(null)),
      [bookId]
    ),
    createEval: useCallback(
      async (ratings, comentario, isAnonymous) => {
        await createBookEvaluation({
          bookId: bookId!,
          ratingGeral: ratings.geral,
          ratingQualidade: ratings.qualidade,
          ratingLegibilidade: ratings.legibilidade,
          ratingUtilidade: ratings.utilidade,
          ratingPrecisao: ratings.precisao,
          comentario: comentario || undefined,
          isAnonymous,
        });
      },
      [bookId]
    ),
    updateEval: useCallback(
      async (_id, ratings, comentario, isAnonymous) => {
        await updateBookEvaluation(_id, {
          ratingGeral: ratings.geral,
          ratingQualidade: ratings.qualidade,
          ratingLegibilidade: ratings.legibilidade,
          ratingUtilidade: ratings.utilidade,
          ratingPrecisao: ratings.precisao,
          comentario: comentario || undefined,
          isAnonymous,
        });
      },
      []
    ),
    deleteEval: deleteBookEvaluation,
    toggleLike: toggleBookEvaluationLike,
    parseFormRatings: useCallback(
      (e: BookEvaluation) => ({
        geral: e.rating_geral,
        qualidade: e.rating_qualidade,
        legibilidade: e.rating_legibilidade,
        utilidade: e.rating_utilidade,
        precisao: e.rating_precisao,
      }),
      []
    ),
  });

  // ─── Derived ──────────────────────────────────────────────────────────────

  const aggregatedForCard = evalState.aggregatedRatings
    ? {
        geral: evalState.aggregatedRatings.media_geral ?? 0,
        qualidade: evalState.aggregatedRatings.media_qualidade ?? 0,
        legibilidade: evalState.aggregatedRatings.media_legibilidade ?? 0,
        utilidade: evalState.aggregatedRatings.media_utilidade ?? 0,
        precisao: evalState.aggregatedRatings.media_precisao ?? 0,
      }
    : null;

  const tabs = [
    { id: "info" as const, label: "Informações", shortLabel: "Info", icon: Info },
    { id: "avaliacoes" as const, label: "Avaliações", shortLabel: "Avaliações", icon: MessageSquare },
  ];

    const accentColor = AREA_COLORS[book?.area];

  const sidebar = (
    <RatingCard
      aggregatedRatings={aggregatedForCard}
      totalAvaliacoes={evalState.aggregatedRatings?.total_avaliacoes ?? 0}
      myEvaluation={evalState.myEvaluation}
      isLoading={evalState.isLoadingEvaluations}
      isLoggedIn={isLoggedIn}
      criterios={BOOK_CRITERIOS_CARD}
      accentColor={accentColor}
      onLogin={() => navigate("/login")}
      onOpenForm={(myEval) => {
        if (myEval) evalState.fillFormWithExisting(myEval as BookEvaluation);
        else evalState.setShowReviewForm(true);
        setActiveTab("avaliacoes");
      }}
      onDelete={evalState.handleDelete}
    />
  );

  const headerInfo = book ? (
    <>
      <h3 className="my-0">
        {book.title}
        {book.subtitle && <span className="text-gray-600">: {book.subtitle}</span>}
      </h3>
      <p className="my-0">{book.authors}</p>
      <span className="px-3 py-1 text-white font-mono text-sm rounded-lg font-semibold" style={{ backgroundColor: AREA_COLORS[book.area], opacity: 0.7 }}>
        {book.code}
      </span>
    </>
  ) : null;

  const tabContents = [
    book ? (
      <BookInfoSection key="info" book={book} books={books} loanByBook={loanByBook} />
    ) : null,
    <EvaluationsTab
      key="avaliacoes"
      evalState={evalState}
      isLoggedIn={isLoggedIn}
      criterios={BOOK_CRITERIOS_FORM}
      accentColor={accentColor}
      placeholder="Compartilhe sua opinião sobre o livro..."
      emptyMessage={"Nenhuma avaliação ainda.\nSeja o primeiro a avaliar este livro!"}
    />,
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) return <PageLoadingState color={accentColor} />;
  if (error || !book) return <PageErrorState message={error ?? "Livro não encontrado"} onBack={() => navigate(-1)} />;

  return (
    <ResultPage
      icon={<BookOpen className="h-full w-full" />}
      headerInfo={headerInfo}
      highlightColor={accentColor}
      tabs={tabs}
      tabContents={tabContents}
      onBack={() => navigate(-1)}
      sidebar={sidebar}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as "info" | "avaliacoes")}
    />
  );
};

export default BookPage;
