import React, { useState, useEffect, useCallback } from "react";
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
  Lightbulb,
  FileText,
  Info,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  Globe,
  Hash,
  BookMarked,
  Layers,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getBookById, type Book } from "@/services/SearchService";
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
import StarRating from "@/components/common/StarRating";

// Tipos
interface FormRatings {
  geral: number | null;
  qualidade: number | null;
  legibilidade: number | null;
  utilidade: number | null;
  precisao: number | null;
}

// Mapeamento de idiomas
const languageMap: Record<number, string> = {
  1: "Português",
  2: "Inglês",
  3: "Espanhol",
  4: "Francês",
  5: "Alemão",
  6: "Italiano",
  7: "Outro",
};

const BookPage: React.FC = () => {
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

  // Carregar dados do livro
  const loadBook = useCallback(async () => {
    if (!bookId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getBookById(bookId);
      if (!data) {
        setError("Livro não encontrado");
        return;
      }
      setBook(data);
    } catch (err) {
      console.error("Erro ao carregar livro:", err);
      setError("Erro ao carregar livro");
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

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
      
      // Buscar avaliação do usuário se logado
      if (isLoggedIn) {
        try {
          const myEval = await getMyBookEvaluation(bookId);
          setMyEvaluation(myEval);
        } catch {
          setMyEvaluation(null);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    } finally {
      setIsLoadingEvaluations(false);
    }
  }, [bookId, isLoggedIn]);

  // Carregar dados ao montar
  useEffect(() => {
    loadBook();
    loadEvaluations();
  }, [loadBook, loadEvaluations]);

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
    
    // Validar: pelo menos um rating ou comentário
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
      // Atualizar lista local
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

  // Critérios de avaliação para livros (apenas 4 critérios, mais condensado)
  const criterios = [
    { key: "qualidade" as const, label: "Qualidade do Conteúdo", icon: Award, color: "library-purple" },
    { key: "legibilidade" as const, label: "Legibilidade", icon: FileText, color: "cm-blue" },
    { key: "utilidade" as const, label: "Utilidade", icon: Target, color: "cm-green" },
    { key: "precisao" as const, label: "Precisão", icon: CheckCircle, color: "cm-orange" },
  ];

  const tabs = [
    { id: "info" as const, label: "Informações", shortLabel: "Info", icon: Info },
    { id: "avaliacoes" as const, label: "Avaliações", shortLabel: "Avaliações", icon: MessageSquare },
  ];

  // Determinar status do livro
  const getStatusInfo = () => {
    if (!book) return { label: "Desconhecido", color: "gray" };
    if (book.is_reserved) return { label: "Reserva Didática", color: "yellow" };
    if (book.overdue) return { label: "Atrasado", color: "red" };
    if (!book.available) return { label: "Emprestado", color: "orange" };
    return { label: "Disponível", color: "green" };
  };

  const statusInfo = getStatusInfo();

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
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow bg-default-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Botão Voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-library-purple -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>

          {/* Header - Mais condensado que disciplinas */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
            {/* Ícone */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center flex-shrink-0 bg-library-purple">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            
            {/* Info Principal */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-library-purple/10 text-library-purple font-mono text-sm rounded-lg font-semibold">
                  {book.code}
                </span>
                <span className={cn(
                  "px-3 py-1 text-sm rounded-lg font-semibold",
                  statusInfo.color === "green" && "bg-green-100 text-green-700",
                  statusInfo.color === "yellow" && "bg-yellow-100 text-yellow-700",
                  statusInfo.color === "orange" && "bg-orange-100 text-orange-700",
                  statusInfo.color === "red" && "bg-red-100 text-red-700",
                  statusInfo.color === "gray" && "bg-gray-100 text-gray-700",
                )}>
                  {statusInfo.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bebas text-gray-900 leading-tight">
                {book.title}
                {book.subtitle && <span className="text-gray-500 font-normal">: {book.subtitle}</span>}
              </h1>
              <p className="text-gray-600 mt-1">{book.authors}</p>
            </div>
          </div>

          {/* Layout Principal */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar - Avaliações e Info Rápida */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Card Avaliação Geral */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-500 mb-2">Avaliação Geral</p>
                    {isLoadingEvaluations ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    ) : mediaAvaliacoes && totalAvaliacoes > 0 ? (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-5xl font-bold text-gray-900">{mediaAvaliacoes.geral.toFixed(1)}</span>
                        <div className="flex flex-col items-start">
                          <StarRating rating={mediaAvaliacoes.geral} size="md" />
                          <span className="text-xs text-gray-400 mt-1">{totalAvaliacoes} avaliações</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Nenhuma avaliação ainda</p>
                    )}
                  </div>
                  
                  {mediaAvaliacoes && totalAvaliacoes > 0 && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      {criterios.map((criterio) => {
                        const Icon = criterio.icon;
                        const valor = mediaAvaliacoes[criterio.key];
                        return (
                          <div key={criterio.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg bg-${criterio.color}/10 flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 text-${criterio.color}`} />
                              </div>
                              <span className="text-sm text-gray-700">{criterio.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`bg-${criterio.color} rounded-full h-1.5`}
                                  style={{ width: `${(valor / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-6 text-right">{valor.toFixed(1)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Botão Avaliar */}
                {isLoggedIn ? (
                  myEvaluation ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => fillFormWithExisting(myEvaluation)}
                        className="flex-1 bg-library-purple hover:bg-library-purple/90 text-white rounded-xl font-bold py-3"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Avaliação
                      </Button>
                      <Button
                        onClick={handleDeleteEvaluation}
                        className="rounded-xl py-3 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setActiveTab("avaliacoes");
                        setShowReviewForm(true);
                      }}
                      className="w-full bg-library-purple hover:bg-library-purple/90 text-white rounded-xl font-bold py-3"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Avaliar Livro
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full rounded-xl font-bold py-3 border-library-purple text-library-purple hover:bg-library-purple/5"
                  >
                    Faça login para avaliar
                  </Button>
                )}
              </div>
            </aside>

            {/* Conteúdo Principal */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-gray-200 mb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 flex items-center gap-2 rounded-t-xl",
                        activeTab === tab.id
                          ? "text-white border-library-purple bg-library-purple"
                          : "text-gray-600 border-transparent hover:text-library-purple hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      {tab.id === "avaliacoes" && (
                        <span className={cn(
                          "ml-1 px-2 py-0.5 text-xs rounded-full",
                          activeTab === tab.id ? "bg-white/20" : "bg-gray-100"
                        )}>
                          {totalAvaliacoes}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="border border-gray-200 border-t-0 rounded-b-2xl bg-white shadow-sm p-4 sm:p-6">
                {activeTab === "info" && (
                  <div className="space-y-4">
                    {/* Grid de informações condensadas */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {/* Autores */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-library-purple" />
                          <span className="text-sm font-semibold text-gray-700">Autores</span>
                        </div>
                        <p className="text-gray-900">{book.authors}</p>
                      </div>

                      {/* Edição */}
                      {book.edition && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <BookMarked className="w-4 h-4 text-library-purple" />
                            <span className="text-sm font-semibold text-gray-700">Edição</span>
                          </div>
                          <p className="text-gray-900">{book.edition}ª edição</p>
                        </div>
                      )}

                      {/* Volume */}
                      {book.volume && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4 text-library-purple" />
                            <span className="text-sm font-semibold text-gray-700">Volume</span>
                          </div>
                          <p className="text-gray-900">Volume {book.volume}</p>
                        </div>
                      )}

                      {/* Idioma */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4 text-library-purple" />
                          <span className="text-sm font-semibold text-gray-700">Idioma</span>
                        </div>
                        <p className="text-gray-900">
                          {typeof book.language === 'number' 
                            ? languageMap[book.language] || "Desconhecido"
                            : book.language}
                        </p>
                      </div>

                      {/* Área */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-library-purple" />
                          <span className="text-sm font-semibold text-gray-700">Área</span>
                        </div>
                        <p className="text-gray-900">{book.area}</p>
                      </div>

                      {/* Subárea */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-4 h-4 text-library-purple" />
                          <span className="text-sm font-semibold text-gray-700">Subárea</span>
                        </div>
                        <p className="text-gray-900">{book.subarea}</p>
                      </div>
                    </motion.div>

                    {/* Status detalhado */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={cn(
                        "p-4 rounded-xl border",
                        statusInfo.color === "green" && "bg-green-50 border-green-200",
                        statusInfo.color === "yellow" && "bg-yellow-50 border-yellow-200",
                        statusInfo.color === "orange" && "bg-orange-50 border-orange-200",
                        statusInfo.color === "red" && "bg-red-50 border-red-200",
                      )}
                    >
                      <p className={cn(
                        "font-semibold",
                        statusInfo.color === "green" && "text-green-700",
                        statusInfo.color === "yellow" && "text-yellow-700",
                        statusInfo.color === "orange" && "text-orange-700",
                        statusInfo.color === "red" && "text-red-700",
                      )}>
                        Status: {statusInfo.label}
                      </p>
                      {book.due_date && !book.available && (
                        <p className="text-sm text-gray-600 mt-1">
                          Previsão de devolução: {new Date(book.due_date).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </motion.div>
                  </div>
                )}

                {activeTab === "avaliacoes" && (
                  <div className="space-y-6">
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
                        
                        {/* Ratings */}
                        <div className="space-y-4 mb-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Rating Geral */}
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
                        
                        {/* Comentário */}
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
                        
                        {/* Anônimo */}
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

                    {/* Loading avaliações */}
                    {isLoadingEvaluations && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    )}

                    {/* Lista de Reviews */}
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

                    {/* Nenhuma avaliação */}
                    {!isLoadingEvaluations && evaluations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Nenhuma avaliação ainda.</p>
                        <p className="text-sm">Seja o primeiro a avaliar este livro!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
