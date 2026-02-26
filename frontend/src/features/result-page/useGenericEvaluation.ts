import { useState, useCallback } from "react";

interface UseGenericEvaluationParams<TAggregated, TEvaluation> {
  entityId: number;
  isLoggedIn: boolean;
  getAggregatedRatings: (id: number) => Promise<TAggregated>;
  getEvaluations: (id: number) => Promise<TEvaluation[]>;
  getMyEvaluation: (id: number) => Promise<TEvaluation>;
  createEvaluation: (data: any) => Promise<any>;
  updateEvaluation: (id: number, data: any) => Promise<any>;
  deleteEvaluation: (id: number) => Promise<any>;
  toggleLike: (id: number) => Promise<{ liked: boolean }>;
}

export default function useGenericEvaluation<TAggregated, TEvaluation>({
  entityId,
  isLoggedIn,
  getAggregatedRatings,
  getEvaluations,
  getMyEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  toggleLike,
}: UseGenericEvaluationParams<TAggregated, TEvaluation>) {
  const [evaluations, setEvaluations] = useState<TEvaluation[]>([]);
  const [aggregatedRatings, setAggregatedRatings] = useState<TAggregated | null>(null);
  const [myEvaluation, setMyEvaluation] = useState<TEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar avaliações e médias
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [evals, stats] = await Promise.all([
        getEvaluations(entityId),
        getAggregatedRatings(entityId),
      ]);
      setEvaluations(evals);
      setAggregatedRatings(stats);
      if (isLoggedIn) {
        try {
          const myEval = await getMyEvaluation(entityId);
          setMyEvaluation(myEval);
        } catch {
          setMyEvaluation(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [entityId, isLoggedIn, getEvaluations, getAggregatedRatings, getMyEvaluation]);

  // Criar avaliação
  const handleCreate = useCallback(
    async (data: any) => {
      setIsSubmitting(true);
      try {
        await createEvaluation(data);
        await loadAll();
      } finally {
        setIsSubmitting(false);
      }
    },
    [createEvaluation, loadAll]
  );

  // Editar avaliação
  const handleUpdate = useCallback(
    async (id: number, data: any) => {
      setIsSubmitting(true);
      try {
        await updateEvaluation(id, data);
        await loadAll();
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateEvaluation, loadAll]
  );

  // Deletar avaliação
  const handleDelete = useCallback(
    async (id: number) => {
      setIsSubmitting(true);
      try {
        await deleteEvaluation(id);
        await loadAll();
      } finally {
        setIsSubmitting(false);
      }
    },
    [deleteEvaluation, loadAll]
  );

  // Curtir avaliação
  const handleToggleLike = useCallback(
    async (id: number) => {
      await toggleLike(id);
      await loadAll();
    },
    [toggleLike, loadAll]
  );

  return {
    evaluations,
    aggregatedRatings,
    myEvaluation,
    isLoading,
    isSubmitting,
    loadAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleLike,
  };
}