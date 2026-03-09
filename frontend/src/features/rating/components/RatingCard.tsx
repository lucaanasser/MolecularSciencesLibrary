import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Star } from "lucide-react";
import StarRating from "./StarRating";

export interface RatingCriterio {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface RatingCardProps {
  aggregatedRatings: Record<string, number> | null;
  totalAvaliacoes: number;
  myEvaluation: { id: number } | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  criterios: RatingCriterio[];
  onLogin: () => void;
  onOpenForm: (myEvaluation: { id: number } | null) => void;
  onDelete: () => void;
}

export default function RatingCard({
  aggregatedRatings,
  totalAvaliacoes,
  myEvaluation,
  isLoading,
  isLoggedIn,
  criterios,
  onLogin,
  onOpenForm,
  onDelete,
}: RatingCardProps) {
  return (
    <div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-2">Avaliação Geral</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          ) : aggregatedRatings && totalAvaliacoes > 0 ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-bold text-gray-900">{aggregatedRatings.geral?.toFixed(1)}</span>
              <div className="flex flex-col items-start">
                <StarRating rating={aggregatedRatings.geral} size="md" />
                <span className="text-xs text-gray-400 mt-1">{totalAvaliacoes} avaliações</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Nenhuma avaliação ainda</p>
          )}
        </div>
        {aggregatedRatings && totalAvaliacoes > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {criterios.map((criterio) => {
              const Icon = criterio.icon;
              const valor = aggregatedRatings[criterio.key] ?? 0;
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
                    <span className="text-sm font-medium text-gray-900 w-6 text-right">{valor?.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Botões de ação */}
      <div className="mt-4">
        {isLoggedIn ? (
          myEvaluation ? (
            <div className="flex gap-2">
              <Button onClick={() => onOpenForm(myEvaluation)} variant="primary">
                <Edit className="w-4 h-4 mr-2" />
                Editar Avaliação
              </Button>
              <Button onClick={onDelete} variant="destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => onOpenForm(null)} variant="wide" className="primary-bg">
              <Star className="w-4 h-4 mr-2" />
              Avaliar
            </Button>
          )
        ) : (
          <Button onClick={onLogin} variant="wide" className="primary-bg">
            Faça login para avaliar
          </Button>
        )}
      </div>
    </div>
  );
}