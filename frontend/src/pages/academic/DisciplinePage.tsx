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
  TrendingUp,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  ThumbsUp,
  ChevronLeft,
  Award,
  Target,
  Lightbulb,
  BarChart3,
  GraduationCap,
  School,
  FileText,
  Info,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFullDiscipline, type FullDiscipline } from "@/services/DisciplinesService";
import {
  getEvaluationsByDiscipline,
  getAggregatedRatings,
  getMyEvaluationForDiscipline,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  toggleLike,
  type Evaluation,
  type AggregatedRatings,
} from "@/services/DisciplineEvaluationsService";

// Tipos
interface FormRatings {
  geral: number | null;
  dificuldade: number | null;
  carga_trabalho: number | null;
  professores: number | null;
  clareza: number | null;
  utilidade: number | null;
  organizacao: number | null;
}

const DisciplinePage: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "avaliacoes">("info");
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Estados de dados
  const [disciplina, setDisciplina] = useState<FullDiscipline | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [aggregatedRatings, setAggregatedRatings] = useState<AggregatedRatings | null>(null);
  const [myEvaluation, setMyEvaluation] = useState<Evaluation | null>(null);
  
  // Estados de carregamento
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados do formulário
  const [formRatings, setFormRatings] = useState<FormRatings>({
    geral: null,
    dificuldade: null,
    carga_trabalho: null,
    professores: null,
    clareza: null,
    utilidade: null,
    organizacao: null,
  });
  const [formComentario, setFormComentario] = useState("");
  const [formIsAnonymous, setFormIsAnonymous] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Verificar se está logado
  const isLoggedIn = !!localStorage.getItem("token");

  // Carregar dados da disciplina
  const loadDiscipline = useCallback(async () => {
    if (!codigo) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getFullDiscipline(codigo);
      if (!data) {
        setError("Disciplina não encontrada");
        return;
      }
      setDisciplina(data);
    } catch (err) {
      logger.error("Erro ao carregar disciplina:", err);
      setError("Erro ao carregar disciplina");
    } finally {
      setIsLoading(false);
    }
  }, [codigo]);

  // Carregar avaliações
  const loadEvaluations = useCallback(async () => {
    if (!codigo) return;
    
    setIsLoadingEvaluations(true);
    
    try {
      const [evals, stats] = await Promise.all([
        getEvaluationsByDiscipline(codigo),
        getAggregatedRatings(codigo),
      ]);
      
      setEvaluations(evals);
      setAggregatedRatings(stats);
      
      // Buscar avaliação do usuário se logado
      if (isLoggedIn) {
        try {
          const myEval = await getMyEvaluationForDiscipline(codigo);
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
  }, [codigo, isLoggedIn]);

  // Carregar dados ao montar
  useEffect(() => {
    loadDiscipline();
    loadEvaluations();
  }, [loadDiscipline, loadEvaluations]);

  // Preencher formulário com avaliação existente
  const fillFormWithExisting = useCallback((eval_: Evaluation) => {
    setFormRatings({
      geral: eval_.rating_geral,
      dificuldade: eval_.rating_dificuldade,
      carga_trabalho: eval_.rating_carga_trabalho,
      professores: eval_.rating_professores,
      clareza: eval_.rating_clareza,
      utilidade: eval_.rating_utilidade,
      organizacao: eval_.rating_organizacao,
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
      dificuldade: null,
      carga_trabalho: null,
      professores: null,
      clareza: null,
      utilidade: null,
      organizacao: null,
    });
    setFormComentario("");
    setFormIsAnonymous(false);
    setIsEditMode(false);
    setShowReviewForm(false);
  };

  // Submeter avaliação
  const handleSubmitEvaluation = async () => {
    if (!codigo) return;
    
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
        await updateEvaluation(myEvaluation.id, {
          ratingGeral: formRatings.geral,
          ratingDificuldade: formRatings.dificuldade,
          ratingCargaTrabalho: formRatings.carga_trabalho,
          ratingProfessores: formRatings.professores,
          ratingClareza: formRatings.clareza,
          ratingUtilidade: formRatings.utilidade,
          ratingOrganizacao: formRatings.organizacao,
          comentario: formComentario.trim() || undefined,
          isAnonymous: formIsAnonymous,
        });
      } else {
        await createEvaluation({
          disciplineCodigo: codigo,
          ratingGeral: formRatings.geral,
          ratingDificuldade: formRatings.dificuldade,
          ratingCargaTrabalho: formRatings.carga_trabalho,
          ratingProfessores: formRatings.professores,
          ratingClareza: formRatings.clareza,
          ratingUtilidade: formRatings.utilidade,
          ratingOrganizacao: formRatings.organizacao,
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
      await deleteEvaluation(myEvaluation.id);
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
      const result = await toggleLike(evaluationId);
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
    dificuldade: aggregatedRatings.media_dificuldade || 0,
    carga_trabalho: aggregatedRatings.media_carga_trabalho || 0,
    professores: aggregatedRatings.media_professores || 0,
    clareza: aggregatedRatings.media_clareza || 0,
    utilidade: aggregatedRatings.media_utilidade || 0,
    organizacao: aggregatedRatings.media_organizacao || 0,
  } : null;

  const totalAvaliacoes = aggregatedRatings?.total_avaliacoes || 0;

  const criterios = [
    { key: "dificuldade" as const, label: "Dificuldade", icon: TrendingUp, color: "cm-red" },
    { key: "carga_trabalho" as const, label: "Carga de Trabalho", icon: BarChart3, color: "cm-orange" },
    { key: "professores" as const, label: "Professores", icon: Users, color: "cm-blue" },
    { key: "clareza" as const, label: "Clareza", icon: Lightbulb, color: "cm-yellow" },
    { key: "utilidade" as const, label: "Utilidade", icon: Target, color: "cm-green" },
    { key: "organizacao" as const, label: "Organização", icon: Award, color: "library-purple" },
  ];

  const tabs = [
    { id: "info" as const, label: "Informações", shortLabel: "Info", icon: Info },
    { id: "avaliacoes" as const, label: "Avaliações", shortLabel: "Avaliações", icon: MessageSquare },
  ];

  const StarRating = ({ rating, size = "sm", interactive = false, onChange }: { 
    rating: number | null; 
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onChange?: (value: number) => void;
  }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const handleClick = (starValue: number, isHalf: boolean) => {
      if (!interactive || !onChange) return;
      const value = isHalf ? starValue - 0.5 : starValue;
      onChange(value);
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = rating !== null && star <= Math.floor(rating);
          const isHalf = rating !== null && star === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <div 
              key={star} 
              className={cn("relative", interactive && "cursor-pointer")}
              onClick={() => interactive && handleClick(star, false)}
            >
              {/* Metade esquerda (clicável para meia estrela) */}
              {interactive && (
                <div 
                  className="absolute left-0 top-0 w-1/2 h-full z-10"
                  onClick={(e) => { e.stopPropagation(); handleClick(star, true); }}
                />
              )}
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled || isHalf ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                  interactive && "hover:text-yellow-400"
                )}
                style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              />
              {/* Estrela vazia por trás da meia */}
              {isHalf && (
                <Star
                  className={cn(sizeClasses[size], "absolute top-0 left-0 text-gray-300")}
                  style={{ clipPath: "inset(0 0 0 50%)" }}
                />
              )}
            </div>
          );
        })}
        {rating !== null && <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-academic-blue" />
        </div>
        
      </div>
    );
  }

  // Error state
  if (error || !disciplina) {
    return (
      <div className="min-h-screen flex flex-col">
        
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-600">{error || "Disciplina não encontrada"}</p>
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
            onClick={() => navigate("/academico/buscar")}
            className="mb-4 text-gray-600 hover:text-academic-blue -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar à busca
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
            {/* Ícone */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              disciplina.is_postgrad ? 'bg-purple-600' : 'bg-academic-blue'
            }`}>
              {disciplina.is_postgrad ? (
                <School className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              ) : (
                <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-academic-blue/10 text-academic-blue font-mono text-sm rounded-lg font-semibold">
                  {disciplina.codigo}
                </span>
                <span className={`px-3 py-1 text-sm rounded-lg font-semibold ${
                  disciplina.is_postgrad 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {disciplina.is_postgrad ? 'Pós-Graduação' : 'Graduação'}
                </span>
                {disciplina.unidade && <span className="text-sm text-gray-500">{disciplina.unidade}</span>}
                {disciplina.campus && <span className="text-sm text-gray-400">• {disciplina.campus}</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bebas text-gray-900">{disciplina.nome}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {disciplina.creditos_aula} créditos aula
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {disciplina.creditos_trabalho} créditos trabalho
                </span>
              </div>
            </div>
          </div>

          {/* Layout Principal */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar - Avaliações Resumidas */}
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
                        className="flex-1 bg-academic-blue hover:bg-academic-blue/90 text-white rounded-xl font-bold py-3"
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
                      className="w-full bg-academic-blue hover:bg-academic-blue/90 text-white rounded-xl font-bold py-3"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Avaliar Disciplina
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full rounded-xl font-bold py-3 border-academic-blue text-academic-blue hover:bg-academic-blue/5"
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
                          ? "text-white border-academic-blue bg-academic-blue"
                          : "text-gray-600 border-transparent hover:text-academic-blue hover:bg-gray-50"
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
                  <div className="space-y-6">
                    {/* Ementa */}
                    {disciplina.ementa && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-3">Ementa</h2>
                        <p className="text-gray-600 leading-relaxed">{disciplina.ementa}</p>
                      </motion.div>
                    )}

                    {/* Objetivos */}
                    {disciplina.objetivos && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-3">Objetivos</h2>
                        <p className="text-gray-600 leading-relaxed">{disciplina.objetivos}</p>
                      </motion.div>
                    )}

                    {/* Conteúdo Programático */}
                    {disciplina.conteudo_programatico && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <h2 className="text-xl sm:text-2xl font-bebas text-gray-900 mb-3">Conteúdo Programático</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{disciplina.conteudo_programatico}</p>
                      </motion.div>
                    )}

                    {/* Sem informações */}
                    {!disciplina.ementa && !disciplina.objetivos && !disciplina.conteudo_programatico && (
                      <p className="text-gray-500 text-center py-8">
                        Informações detalhadas não disponíveis para esta disciplina.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "avaliacoes" && (
                  <div className="space-y-6">
                    {/* Formulário de Avaliação */}
                    {showReviewForm && isLoggedIn && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 sm:p-6 bg-academic-blue/5 rounded-xl border border-academic-blue/20"
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
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
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
                            placeholder="Compartilhe sua experiência com a disciplina..."
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
                            className="bg-academic-blue hover:bg-academic-blue/90"
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
                        className="w-full border-dashed border-academic-blue text-academic-blue hover:bg-academic-blue/5"
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
                                ? "bg-academic-blue/5 border-academic-blue/20" 
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
                                          <span className="text-xs ml-2 text-academic-blue">(você)</span>
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {evaluation.turma_codigo && `Turma ${evaluation.turma_codigo}`}
                                        {evaluation.semestre && ` • ${evaluation.semestre}`}
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
                                      ? "text-academic-blue font-medium"
                                      : "text-gray-500 hover:text-academic-blue"
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
                        <p className="text-sm">Seja o primeiro a avaliar esta disciplina!</p>
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

export default DisciplinePage;
