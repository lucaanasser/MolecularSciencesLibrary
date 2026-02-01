import React from "react";
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import StarRating from "./StarRating";

/**
 * Card de exibição de avaliação reutilizável.
 * 
 * Usado em: DisciplinePage, BookPage para exibir avaliações de usuários
 * 
 * Características:
 * - Avatar com inicial do usuário ou "?" para anônimos
 * - Nome do usuário (ou "Anônimo")
 * - Rating em estrelas
 * - Comentário (opcional)
 * - Botão de like com contador
 * - Destaque visual para avaliação própria
 */

export interface EvaluationData {
  id: number;
  rating_geral: number | null;
  comentario: string | null;
  is_anonymous: boolean;
  helpful_count: number;
  created_at: string;
  user_name?: string;
  is_own_evaluation?: boolean;
  user_has_voted?: boolean;
  // Campos opcionais para contexto (turma, semestre, etc.)
  turma_codigo?: string | null;
  semestre?: string | null;
}

interface EvaluationCardProps {
  /** Dados da avaliação */
  evaluation: EvaluationData;
  /** Callback quando clicar no botão de like */
  onToggleLike: (evaluationId: number) => void;
  /** Cor de destaque (para avaliações próprias) - default: academic-blue */
  accentColor?: string;
  /** Se o botão de like está desabilitado */
  likeDisabled?: boolean;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({
  evaluation,
  onToggleLike,
  accentColor = "academic-blue",
  likeDisabled = false,
}) => {
  const isOwn = evaluation.is_own_evaluation;
  const hasVoted = evaluation.user_has_voted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border",
        isOwn 
          ? `bg-${accentColor}/5 border-${accentColor}/20` 
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
                  {isOwn && (
                    <span className={`text-xs ml-2 text-${accentColor}`}>(você)</span>
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
          onClick={() => onToggleLike(evaluation.id)}
          disabled={isOwn || likeDisabled}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            isOwn || likeDisabled
              ? "text-gray-300 cursor-not-allowed"
              : hasVoted
                ? `text-${accentColor} font-medium`
                : `text-gray-500 hover:text-${accentColor}`
          )}
        >
          <ThumbsUp className={cn("w-4 h-4", hasVoted && "fill-current")} />
          <span>{evaluation.helpful_count} acharam útil</span>
        </button>
        <span className="text-xs text-gray-400">
          {new Date(evaluation.created_at).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </motion.div>
  );
};

export default EvaluationCard;
