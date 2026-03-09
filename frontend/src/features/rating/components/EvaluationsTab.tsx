import React from "react";
import { EvaluationForm } from "./EvaluationForm";
import { EvaluationsList } from "./EvaluationsList";
import type { EvaluationData } from "./EvaluationCard";

interface EvalTabState {
  showReviewForm: boolean;
  formRatings: Record<string, number | null>;
  formComentario: string;
  formIsAnonymous: boolean;
  isEditMode: boolean;
  isSubmitting: boolean;
  isLoadingEvaluations: boolean;
  evaluations: EvaluationData[];
  myEvaluation: { id: number } | null;
  setFormRatings: React.Dispatch<React.SetStateAction<Record<string, number | null>>>;
  setFormComentario: (v: string) => void;
  setFormIsAnonymous: (v: boolean) => void;
  setShowReviewForm: (v: boolean) => void;
  handleSubmit: () => void;
  resetForm: () => void;
  handleToggleLike: (id: number) => void;
  [key: string]: unknown;
}

interface EvaluationsTabProps {
  evalState: EvalTabState;
  isLoggedIn: boolean;
  criterios: Array<{ key: string; label: string }>;
  accentColor: string;
  placeholder: string;
  emptyMessage: string;
}

export const EvaluationsTab: React.FC<EvaluationsTabProps> = ({
  evalState,
  isLoggedIn,
  criterios,
  accentColor,
  placeholder,
  emptyMessage,
}) => (
  <div className="space-y-6">
    {evalState.showReviewForm && isLoggedIn && (
      <EvaluationForm
        criterios={criterios}
        formRatings={evalState.formRatings}
        formComentario={evalState.formComentario}
        formIsAnonymous={evalState.formIsAnonymous}
        isEditMode={evalState.isEditMode}
        isSubmitting={evalState.isSubmitting}
        accentColor={accentColor}
        placeholder={placeholder}
        onRatingChange={(key, val) =>
          evalState.setFormRatings((prev) => ({ ...prev, [key]: val }))
        }
        onComentarioChange={evalState.setFormComentario}
        onAnonymousChange={evalState.setFormIsAnonymous}
        onSubmit={evalState.handleSubmit}
        onCancel={evalState.resetForm}
      />
    )}
    <EvaluationsList
      evaluations={evalState.evaluations}
      isLoading={evalState.isLoadingEvaluations}
      isLoggedIn={isLoggedIn}
      myEvaluation={evalState.myEvaluation}
      showReviewForm={evalState.showReviewForm}
      accentColor={accentColor}
      emptyMessage={emptyMessage}
      onShowForm={() => evalState.setShowReviewForm(true)}
      onToggleLike={evalState.handleToggleLike}
    />
  </div>
);
