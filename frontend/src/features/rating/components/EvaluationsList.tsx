import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Star } from "lucide-react";
import EvaluationCard, { type EvaluationData } from "./EvaluationCard";

interface EvaluationsListProps {
  evaluations: EvaluationData[];
  isLoading: boolean;
  isLoggedIn: boolean;
  myEvaluation: { id: number } | null;
  showReviewForm: boolean;
  accentColor?: string;
  emptyMessage?: string;
  onShowForm: () => void;
  onToggleLike: (id: number) => void;
}

export const EvaluationsList: React.FC<EvaluationsListProps> = ({
  evaluations,
  isLoading,
  isLoggedIn,
  myEvaluation,
  showReviewForm,
  accentColor = "library-purple",
  emptyMessage = "Nenhuma avaliação ainda.\nSeja o primeiro a avaliar!",
  onShowForm,
  onToggleLike,
}) => {
  return (
    <div className="space-y-4">

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {!isLoading && evaluations.length > 0 && (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <EvaluationCard
              key={evaluation.id}
              evaluation={evaluation}
              onToggleLike={onToggleLike}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}

      {!isLoading && evaluations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          {emptyMessage.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "text-sm" : ""}>
              {line}
            </p>
          ))}
        </div>
      )}

      {!showReviewForm && isLoggedIn && !myEvaluation && (
        <Button
          onClick={onShowForm}
          className={`w-full border-dashed border-${accentColor} text-${accentColor} hover:bg-${accentColor}/5`}
          style={{ borderColor: accentColor, color: accentColor }}
        >
          <Star className="w-4 h-4 mr-2" />
          Escrever uma avaliação
        </Button>
      )}

    </div>
  );
};
