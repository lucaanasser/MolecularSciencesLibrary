import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Info, GraduationCap, School } from "lucide-react";
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
import { useEvaluations, RatingCard, EvaluationsTab } from "@/features/rating";
import ResultPage from "@/features/result-page/ResultPage";
import { PageLoadingState, PageErrorState } from "@/features/result-page";
import {
  DisciplineInfoSection,
  DisciplineHeader,
  useDisciplinePage,
  DISC_INITIAL_RATINGS,
  DISC_CRITERIOS_FORM,
  DISC_CRITERIOS_CARD,
} from "@/features/discipline-page";

// ─── Component ────────────────────────────────────────────────────────────────

const DisciplinePage: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "avaliacoes">("info");
  const isLoggedIn = !!localStorage.getItem("token");

  const { disciplina, isLoading, error } = useDisciplinePage(codigo);

  // ─── Evaluation hook ──────────────────────────────────────────────────────

  const evalState = useEvaluations<Evaluation, AggregatedRatings>({
    entityKey: codigo,
    isLoggedIn,
    initialFormRatings: DISC_INITIAL_RATINGS,
    fetchAll: useCallback(
      () => (codigo ? getEvaluationsByDiscipline(codigo) : Promise.resolve([])),
      [codigo]
    ),
    fetchStats: useCallback(
      () =>
        codigo
          ? getAggregatedRatings(codigo)
          : Promise.resolve(null as unknown as AggregatedRatings),
      [codigo]
    ),
    fetchMine: useCallback(
      () => (codigo ? getMyEvaluationForDiscipline(codigo) : Promise.resolve(null)),
      [codigo]
    ),
    createEval: useCallback(
      async (ratings, comentario, isAnonymous) => {
        await createEvaluation({
          disciplineCodigo: codigo!,
          ratingGeral: ratings.geral,
          ratingDificuldade: ratings.dificuldade,
          ratingCargaTrabalho: ratings.carga_trabalho,
          ratingProfessores: ratings.professores,
          ratingClareza: ratings.clareza,
          ratingUtilidade: ratings.utilidade,
          ratingOrganizacao: ratings.organizacao,
          comentario: comentario || undefined,
          isAnonymous,
        });
      },
      [codigo]
    ),
    updateEval: useCallback(
      async (id, ratings, comentario, isAnonymous) => {
        await updateEvaluation(id, {
          ratingGeral: ratings.geral,
          ratingDificuldade: ratings.dificuldade,
          ratingCargaTrabalho: ratings.carga_trabalho,
          ratingProfessores: ratings.professores,
          ratingClareza: ratings.clareza,
          ratingUtilidade: ratings.utilidade,
          ratingOrganizacao: ratings.organizacao,
          comentario: comentario || undefined,
          isAnonymous,
        });
      },
      []
    ),
    deleteEval: deleteEvaluation,
    toggleLike,
    parseFormRatings: useCallback(
      (e: Evaluation) => ({
        geral: e.rating_geral,
        dificuldade: e.rating_dificuldade,
        carga_trabalho: e.rating_carga_trabalho,
        professores: e.rating_professores,
        clareza: e.rating_clareza,
        utilidade: e.rating_utilidade,
        organizacao: e.rating_organizacao,
      }),
      []
    ),
  });

  // ─── Derived ──────────────────────────────────────────────────────────────

  const aggregatedForCard = evalState.aggregatedRatings
    ? {
        geral: evalState.aggregatedRatings.media_geral ?? 0,
        dificuldade: evalState.aggregatedRatings.media_dificuldade ?? 0,
        carga_trabalho: evalState.aggregatedRatings.media_carga_trabalho ?? 0,
        professores: evalState.aggregatedRatings.media_professores ?? 0,
        clareza: evalState.aggregatedRatings.media_clareza ?? 0,
        utilidade: evalState.aggregatedRatings.media_utilidade ?? 0,
        organizacao: evalState.aggregatedRatings.media_organizacao ?? 0,
      }
    : null;

  const totalAvaliacoes = evalState.aggregatedRatings?.total_avaliacoes ?? 0;
  const highlightColor = disciplina?.is_postgrad ? "purple-600" : "academic-blue";

  const tabs = [
    { id: "info" as const, label: "Informações", shortLabel: "Info", icon: Info },
    {
      id: "avaliacoes" as const,
      label: "Avaliações",
      shortLabel: "Avaliações",
      icon: MessageSquare,
      badge: (isActive: boolean) =>
        totalAvaliacoes > 0 ? (
          <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
            {totalAvaliacoes}
          </span>
        ) : null,
    },
  ];

  const sidebar = (
    <RatingCard
      aggregatedRatings={aggregatedForCard}
      totalAvaliacoes={totalAvaliacoes}
      myEvaluation={evalState.myEvaluation}
      isLoading={evalState.isLoadingEvaluations}
      isLoggedIn={isLoggedIn}
      criterios={DISC_CRITERIOS_CARD}
      onLogin={() => navigate("/login")}
      onOpenForm={(myEval) => {
        if (myEval) evalState.fillFormWithExisting(myEval as Evaluation);
        else evalState.setShowReviewForm(true);
        setActiveTab("avaliacoes");
      }}
      onDelete={evalState.handleDelete}
    />
  );

  const tabContents = [
    disciplina ? (
      <DisciplineInfoSection key="info" disciplina={disciplina} />
    ) : null,
    <EvaluationsTab
      key="avaliacoes"
      evalState={evalState}
      isLoggedIn={isLoggedIn}
      criterios={DISC_CRITERIOS_FORM}
      accentColor={highlightColor}
      placeholder="Compartilhe sua experiência com a disciplina..."
      emptyMessage={"Nenhuma avaliação ainda.\nSeja o primeiro a avaliar esta disciplina!"}
    />,
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) return <PageLoadingState color="academic-blue" />;
  if (error || !disciplina) return <PageErrorState message={error ?? "Disciplina não encontrada"} onBack={() => navigate(-1)} />;

  return (
    <ResultPage
      icon={
        disciplina.is_postgrad
          ? <School className="h-full w-full" />
          : <GraduationCap className="h-full w-full" />
      }
      iconBgColor={highlightColor}
      headerInfo={<DisciplineHeader disciplina={disciplina} />}
      highlightColor={highlightColor}
      tabs={tabs}
      tabContents={tabContents}
      onBack={() => navigate("/academico/buscar")}
      sidebar={sidebar}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as "info" | "avaliacoes")}
    />
  );
};

export default DisciplinePage;
