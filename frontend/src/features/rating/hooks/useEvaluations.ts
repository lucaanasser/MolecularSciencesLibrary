import { useState, useCallback, useEffect, useRef } from "react";
import { logger } from "@/utils/logger";

export interface BaseEval {
  id: number;
  helpful_count: number;
  user_has_voted?: boolean;
  is_own_evaluation?: boolean;
}

export interface UseEvaluationsConfig<TEval extends BaseEval, TStats> {
  entityKey: string | number | null | undefined;
  isLoggedIn: boolean;
  initialFormRatings: Record<string, number | null>;
  fetchAll: () => Promise<TEval[]>;
  fetchStats: () => Promise<TStats>;
  fetchMine: () => Promise<TEval | null>;
  createEval: (
    ratings: Record<string, number | null>,
    comentario: string,
    isAnonymous: boolean
  ) => Promise<void>;
  updateEval: (
    id: number,
    ratings: Record<string, number | null>,
    comentario: string,
    isAnonymous: boolean
  ) => Promise<void>;
  deleteEval: (id: number) => Promise<void>;
  toggleLike: (id: number) => Promise<{ liked: boolean }>;
  parseFormRatings: (eval_: TEval) => Record<string, number | null>;
}

export function useEvaluations<TEval extends BaseEval, TStats>({
  entityKey,
  isLoggedIn,
  initialFormRatings,
  fetchAll,
  fetchStats,
  fetchMine,
  createEval,
  updateEval,
  deleteEval,
  toggleLike,
  parseFormRatings,
}: UseEvaluationsConfig<TEval, TStats>) {
  // Use refs to always have latest service functions without adding them to dependency arrays
  const svcRef = useRef({
    fetchAll,
    fetchStats,
    fetchMine,
    createEval,
    updateEval,
    deleteEval,
    toggleLike,
    parseFormRatings,
  });
  useEffect(() => {
    svcRef.current = {
      fetchAll,
      fetchStats,
      fetchMine,
      createEval,
      updateEval,
      deleteEval,
      toggleLike,
      parseFormRatings,
    };
  });

  const [evaluations, setEvaluations] = useState<TEval[]>([]);
  const [aggregatedRatings, setAggregatedRatings] = useState<TStats | null>(null);
  const [myEvaluation, setMyEvaluation] = useState<TEval | null>(null);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formRatings, setFormRatings] = useState<Record<string, number | null>>(initialFormRatings);
  const [formComentario, setFormComentario] = useState("");
  const [formIsAnonymous, setFormIsAnonymous] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const loadEvaluations = useCallback(async () => {
    if (!entityKey) return;
    setIsLoadingEvaluations(true);
    try {
      const [evals, stats] = await Promise.all([
        svcRef.current.fetchAll(),
        svcRef.current.fetchStats(),
      ]);
      setEvaluations(evals);
      setAggregatedRatings(stats);
      if (isLoggedIn) {
        try {
          const mine = await svcRef.current.fetchMine();
          setMyEvaluation(mine);
        } catch {
          setMyEvaluation(null);
        }
      }
    } catch (err) {
      logger.error("Erro ao carregar avaliações:", err);
    } finally {
      setIsLoadingEvaluations(false);
    }
  }, [entityKey, isLoggedIn]);

  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  const fillFormWithExisting = useCallback((eval_: TEval) => {
    setFormRatings(svcRef.current.parseFormRatings(eval_));
    setFormComentario((eval_ as Record<string, unknown>).comentario as string ?? "");
    setFormIsAnonymous((eval_ as Record<string, unknown>).is_anonymous as boolean ?? false);
    setIsEditMode(true);
    setShowReviewForm(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormRatings(initialFormRatings);
    setFormComentario("");
    setFormIsAnonymous(false);
    setIsEditMode(false);
    setShowReviewForm(false);
  }, [initialFormRatings]);

  const handleSubmit = useCallback(async () => {
    const hasRating = Object.values(formRatings).some((r) => r !== null);
    const hasComment = formComentario.trim().length > 0;
    if (!hasRating && !hasComment) {
      alert("Por favor, avalie com estrelas ou deixe um comentário");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode && myEvaluation) {
        await svcRef.current.updateEval(
          myEvaluation.id,
          formRatings,
          formComentario.trim(),
          formIsAnonymous
        );
      } else {
        await svcRef.current.createEval(formRatings, formComentario.trim(), formIsAnonymous);
      }
      resetForm();
      await loadEvaluations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao salvar avaliação");
    } finally {
      setIsSubmitting(false);
    }
  }, [formRatings, formComentario, formIsAnonymous, isEditMode, myEvaluation, resetForm, loadEvaluations]);

  const handleDelete = useCallback(async () => {
    if (!myEvaluation || !confirm("Tem certeza que deseja excluir sua avaliação?")) return;
    try {
      await svcRef.current.deleteEval(myEvaluation.id);
      setMyEvaluation(null);
      resetForm();
      await loadEvaluations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir avaliação");
    }
  }, [myEvaluation, resetForm, loadEvaluations]);

  const handleToggleLike = useCallback(
    async (evaluationId: number) => {
      if (!isLoggedIn) {
        alert("Faça login para curtir avaliações");
        return;
      }
      try {
        const result = await svcRef.current.toggleLike(evaluationId);
        setEvaluations((prev) =>
          prev.map((e) =>
            e.id === evaluationId
              ? {
                  ...e,
                  helpful_count: result.liked ? e.helpful_count + 1 : e.helpful_count - 1,
                  user_has_voted: result.liked,
                }
              : e
          )
        );
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Erro ao processar like");
      }
    },
    [isLoggedIn]
  );

  return {
    evaluations,
    aggregatedRatings,
    myEvaluation,
    isLoadingEvaluations,
    isSubmitting,
    formRatings,
    formComentario,
    formIsAnonymous,
    isEditMode,
    showReviewForm,
    setFormRatings,
    setFormComentario,
    setFormIsAnonymous,
    setShowReviewForm,
    fillFormWithExisting,
    resetForm,
    handleSubmit,
    handleDelete,
    handleToggleLike,
    reload: loadEvaluations,
  };
}
