import React, { useState, useEffect, useCallback } from "react";
import { logger } from "@/utils/logger";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  BookOpen,
  Star,
  Users,
  MessageSquare,
  ThumbsUp,
  ChevronLeft,
  Award,
  Target,
  FileText,
  Info,
  Loader2,
  AlertCircle,
  Globe,
  Hash,
  BookMarked,
  Layers,
  CheckCircle,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getBookById } from "@/services/SearchService";
import { Book } from "@/types/book";
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
import StarRating from "@/components/rating/StarRating";
import ResultPage from "@/features/result-page/ResultPage";
import { BooksService } from "@/services/BooksService";

interface FormRatings {
  geral: number | null;
  qualidade: number | null;
  legibilidade: number | null;
  utilidade: number | null;
  precisao: number | null;
}

const BookPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [books, setBooks] = useState<Book[]>([]);

  const loadBooks = useCallback(async () => {
    if (!code) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await BooksService.getBooksByCode(code);
      if (!data || data.length === 0) {
        setError("Nenhum exemplar encontrado para este código");
        return;
      }
      setBooks(data);
      setBook(data[0]);
    } catch (err) {
      logger.error("Erro ao carregar exemplares:", err);
      setError("Erro ao carregar exemplares");
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "avaliacoes">("info");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Estados de dados
  const [book, setBook] = useState<Book | null>(null);
  const [evaluations, setEvaluations] = useState<BookEvaluation[]>([]);
  const [aggregatedRatings, setAggregatedRatings] = useState<BookAggregatedRatings | null>(null);
  const [myEvaluation, setMyEvaluation] = useState<BookEvaluation | null>(null);

  // Estados de carregamento
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário
  const [formRatings, setFormRatings] = useState<FormRatings>({
    geral: null,
    qualidade: null,
    legibilidade: null,
    utilidade: null,
    precisao: null,
  });
  const [formComentario, setFormComentario] = useState("");
  const [formIsAnonymous, setFormIsAnonymous] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Verificar se está logado
  const isLoggedIn = !!localStorage.getItem("token");
  const bookId = id ? parseInt(id) : null;

  // Carregar avaliações
  const loadEvaluations = useCallback(async () => {
    if (!bookId) return;
    setIsLoadingEvaluations(true);
    try {
      const [evals, stats] = await Promise.all([
        getBookEvaluations(bookId),
        getBookAggregatedRatings(bookId),
      ]);
      setEvaluations(evals);
      setAggregatedRatings(stats);
      if (isLoggedIn) {
        try {
          const myEval = await getMyBookEvaluation(bookId);
          setMyEvaluation(myEval);
        } catch {
          setMyEvaluation(null);
        }
      }
    } catch (err) {
      logger.error("Erro ao carregar avaliações:", err);
    } finally {
      setIsLoadingEvaluations(false);
    }
  }, [bookId, isLoggedIn]);

  useEffect(() => {
    loadBooks();
    loadEvaluations();
  }, [loadBooks, loadEvaluations]);

  // Preencher formulário com avaliação existente
  const fillFormWithExisting = useCallback((eval_: BookEvaluation) => {
    setFormRatings({
      geral: eval_.rating_geral,
      qualidade: eval_.rating_qualidade,
      legibilidade: eval_.rating_legibilidade,
      utilidade: eval_.rating_utilidade,
      precisao: eval_.rating_precisao,
    });
    setFormComentario(eval_.comentario || "");
    setFormIsAnonymous(eval_.is_anonymous);
    setIsEditMode(true);
    setShowReviewForm(true);
    setActiveTab("avaliacoes");
  }, []);

  // Limpar formulário
  const resetForm = () => {
    setFormRatings({
      geral: null,
      qualidade: null,
      legibilidade: null,
      utilidade: null,
      precisao: null,
    });
    setFormComentario("");
    setFormIsAnonymous(false);
    setIsEditMode(false);
    setShowReviewForm(false);
  };

  // Submeter avaliação
  const handleSubmitEvaluation = async () => {
    if (!bookId) return;
    const hasRating = Object.values(formRatings).some(r => r !== null);
    const hasComment = formComentario.trim().length > 0;
    if (!hasRating && !hasComment) {
      alert("Por favor, avalie com estrelas ou deixe um comentário");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode && myEvaluation) {
        await updateBookEvaluation(myEvaluation.id, {
          ratingGeral: formRatings.geral,
          ratingQualidade: formRatings.qualidade,
          ratingLegibilidade: formRatings.legibilidade,
          ratingUtilidade: formRatings.utilidade,
          ratingPrecisao: formRatings.precisao,
          comentario: formComentario.trim() || undefined,
          isAnonymous: formIsAnonymous,
        });
      } else {
        await createBookEvaluation({
          bookId,
          ratingGeral: formRatings.geral,
          ratingQualidade: formRatings.qualidade,
          ratingLegibilidade: formRatings.legibilidade,
          ratingUtilidade: formRatings.utilidade,
          ratingPrecisao: formRatings.precisao,
          comentario: formComentario.trim() || undefined,
          isAnonymous: formIsAnonymous,
        });
      }
      resetForm();
      await loadEvaluations();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar avaliação";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletar avaliação
  const handleDeleteEvaluation = async () => {
    if (!myEvaluation || !confirm("Tem certeza que deseja excluir sua avaliação?")) return;
    try {
      await deleteBookEvaluation(myEvaluation.id);
      setMyEvaluation(null);
      resetForm();
      await loadEvaluations();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir avaliação";
      alert(message);
    }
  };

  // Toggle like
  const handleToggleLike = async (evaluationId: number) => {
    if (!isLoggedIn) {
      alert("Faça login para curtir avaliações");
      return;
    }
    try {
      const result = await toggleBookEvaluationLike(evaluationId);
      setEvaluations(prev => prev.map(e => {
        if (e.id === evaluationId) {
          return {
            ...e,
            helpful_count: result.liked ? e.helpful_count + 1 : e.helpful_count - 1,
            user_has_voted: result.liked,
          };
        }
        return e;
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar like";
      alert(message);
    }
  };

  // Médias para exibição
  const mediaAvaliacoes = aggregatedRatings ? {
    geral: aggregatedRatings.media_geral || 0,
    qualidade: aggregatedRatings.media_qualidade || 0,
    legibilidade: aggregatedRatings.media_legibilidade || 0,
    utilidade: aggregatedRatings.media_utilidade || 0,
    precisao: aggregatedRatings.media_precisao || 0,
  } : null;

  const totalAvaliacoes = aggregatedRatings?.total_avaliacoes || 0;

  const criterios = [
    { key: "qualidade" as const, label: "Qualidade do Conteúdo", icon: Award, color: "library-purple" },
    { key: "legibilidade" as const, label: "Legibilidade", icon: FileText, color: "cm-blue" },
    { key: "utilidade" as const, label: "Utilidade", icon: Target, color: "cm-green" },
    { key: "precisao" as const, label: "Precisão", icon: CheckCircle, color: "cm-orange" },
  ];

  const formatDonator = (name?: string, tag?: string): string => {
    if (!name) return "";
    if (!tag) return name;
    if (tag === "Prof.") return `Prof. ${name}`;
    return `${name} ${tag}`;
  };

  const donatorDisplay = (() => {
    const found = books.find(b => b.donator_name);
    return found ? formatDonator(found.donator_name, found.donator_tag) : "";
  })();

  const tabs = [
    { id: "info" as const, label: "Informações", shortLabel: "Info", icon: Info },
    { id: "avaliacoes" as const, label: "Avaliações", shortLabel: "Avaliações", icon: MessageSquare },
  ];

  // Props para o RatingCard
  const ratingCardProps = {
    isLoading: isLoadingEvaluations,
    mediaAvaliacoes,
    totalAvaliacoes,
    criterios,
    isLoggedIn,
    myEvaluation,
    onEdit: myEvaluation ? () => fillFormWithExisting(myEvaluation) : () => {},
    onDelete: handleDeleteEvaluation,
    onCreate: () => {
      setActiveTab("avaliacoes");
      setShowReviewForm(true);
    },
    onLogin: () => navigate("/login"),
  };

  // Header info para o ResultPage
  const headerInfo = (
    <>
      <h3 className="my-0">
        {book?.title}
        {book?.subtitle && <span className="text-gray-600">: {book.subtitle}</span>}
      </h3>
      <p className="my-0">{book?.authors}</p>
      <span className="px-3 py-1 secondary-bg text-white font-mono text-sm rounded-lg font-semibold">
        {book?.code}
      </span>
    </>
  );

  // Conteúdo das abas
  const tabContents = [
    // Aba Informações
    <div key="info">
      <ul className="flex flex-col gap-1 text-gray-700">
        <li className="flex items-center gap-2">
          <Users className="w-4 h-4 text-library-purple" />
          <span className="font-medium">Autores:</span>
          <span className="truncate">{book?.authors}</span>
        </li>
        {book?.edition && (
          <li className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-library-purple" />
            <span className="font-medium">Edição:</span>
            <span>{book.edition}ª</span>
          </li>
        )}
        {book?.volume && (
          <li className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-library-purple" />
            <span className="font-medium">Volume:</span>
            <span>{book.volume}</span>
          </li>
        )}
        <li className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-library-purple" />
          <span className="font-medium">Idioma:</span>
          <span>{book?.language}</span>
        </li>
        <li className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-library-purple" />
          <span className="font-medium">Área:</span>
          <span>{book?.area}</span>
        </li>
        <li className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-library-purple" />
          <span className="font-medium">Subárea:</span>
          <span>{book?.subarea}</span>
        </li>
        {donatorDisplay && (
          <li className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-library-purple" />
            <span className="font-medium">Doador:</span>
            <span className="font-semibold text-library-purple">{donatorDisplay}</span>
          </li>
        )}
      </ul>
      <h4 className="mt-6 mb-2 font-semibold text-gray-900">Exemplares</h4>
      <table className="w-full text-sm border rounded-lg bg-white">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1 text-left">ID</th>
            <th className="px-2 py-1 text-left">Volume</th>
            <th className="px-2 py-1 text-left">Exemplar</th>
            <th className="px-2 py-1 text-left">Status</th>
            <th className="px-2 py-1 text-left">Disponível</th>
          </tr>
        </thead>
        <tbody>
          {books.map((exemplar) => (
            <tr key={exemplar.id} className="border-t">
              <td className="px-2 py-1">{exemplar.id}</td>
              <td className="px-2 py-1">{exemplar.volume ?? "-"}</td>
              <td className="px-2 py-1">{exemplar.exemplar ?? "-"}</td>
              <td className="px-2 py-1">{exemplar.status}</td>
              <td className="px-2 py-1">{exemplar.available ? "Sim" : "Não"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    // Aba Avaliações
    <div key="avaliacoes" className="space-y-6">
      {/* Formulário de Avaliação */}
      {showReviewForm && isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 sm:p-6 bg-library-purple/5 rounded-xl border border-library-purple/20"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isEditMode ? "Editar Avaliação" : "Sua Avaliação"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Avalie com estrelas (anônimo) e/ou deixe um comentário
          </p>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-gray-200 sm:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Avaliação Geral
                </Label>
                <StarRating
                  rating={formRatings.geral}
                  size="lg"
                  interactive
                  onChange={(v) => setFormRatings(prev => ({ ...prev, geral: v }))}
                />
              </div>
              {criterios.map((criterio) => (
                <div key={criterio.key} className="p-3 bg-white rounded-lg border border-gray-200">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    {criterio.label}
                  </Label>
                  <StarRating
                    rating={formRatings[criterio.key]}
                    size="md"
                    interactive
                    onChange={(v) => setFormRatings(prev => ({ ...prev, [criterio.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Comentário (opcional)
            </Label>
            <Textarea
              value={formComentario}
              onChange={(e) => setFormComentario(e.target.value)}
              placeholder="Compartilhe sua opinião sobre o livro..."
              rows={4}
              className="resize-none"
            />
          </div>
          {formComentario.trim() && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <Switch
                id="anonymous"
                checked={formIsAnonymous}
                onCheckedChange={setFormIsAnonymous}
              />
              <Label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
                Publicar comentário como anônimo
              </Label>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmitEvaluation}
              disabled={isSubmitting}
              className="bg-library-purple hover:bg-library-purple/90"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditMode ? "Salvar Alterações" : "Publicar Avaliação"}
            </Button>
            <Button onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}

      {!showReviewForm && isLoggedIn && !myEvaluation && (
        <Button
          onClick={() => setShowReviewForm(true)}
          className="w-full border-dashed border-library-purple text-library-purple hover:bg-library-purple/5"
        >
          <Star className="w-4 h-4 mr-2" />
          Escrever uma avaliação
        </Button>
      )}

      {isLoadingEvaluations && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {!isLoadingEvaluations && evaluations.length > 0 && (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <motion.div
              key={evaluation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl border",
                evaluation.is_own_evaluation
                  ? "bg-library-purple/5 border-library-purple/20"
                  : "bg-gray-50 border-gray-100"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {evaluation.comentario ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-library-purple/10 flex items-center justify-center">
                        <span className="text-library-purple font-semibold">
                          {evaluation.is_anonymous ? "?" : (evaluation.user_name?.charAt(0) || "?")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {evaluation.is_anonymous ? "Anônimo" : evaluation.user_name}
                          {evaluation.is_own_evaluation && (
                            <span className="text-xs ml-2 text-library-purple">(você)</span>
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Avaliação anônima</p>
                  )}
                </div>
                {evaluation.rating_geral && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={evaluation.rating_geral} size="sm" />
                  </div>
                )}
              </div>
              {evaluation.comentario && (
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {evaluation.comentario}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleToggleLike(evaluation.id)}
                  disabled={evaluation.is_own_evaluation}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-colors",
                    evaluation.is_own_evaluation
                      ? "text-gray-300 cursor-not-allowed"
                      : evaluation.user_has_voted
                        ? "text-library-purple font-medium"
                        : "text-gray-500 hover:text-library-purple"
                  )}
                >
                  <ThumbsUp className={cn("w-4 h-4", evaluation.user_has_voted && "fill-current")} />
                  <span>{evaluation.helpful_count} acharam útil</span>
                </button>
                <span className="text-xs text-gray-400">
                  {new Date(evaluation.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoadingEvaluations && evaluations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhuma avaliação ainda.</p>
          <p className="text-sm">Seja o primeiro a avaliar este livro!</p>
        </div>
      )}
    </div>,
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-library-purple" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-600">{error || "Livro não encontrado"}</p>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ResultPage
      icon={<BookOpen className="h-full w-full" />}
      headerInfo={headerInfo}
      highlightColor="library-purple"
      tabs={tabs}
      tabContents={tabContents}
      onBack={() => navigate(-1)}
      ratingCardProps={ratingCardProps}
    />
  );
};

export default BookPage;