import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Componente de avaliação por estrelas reutilizável.
 * 
 * Suporta:
 * - Modo display (apenas visualização)
 * - Modo interativo (clicável para selecionar rating)
 * - Meias estrelas (0.5, 1.5, 2.5, etc.)
 * - 3 tamanhos: sm, md, lg
 * 
 * Usado em: DisciplinePage, BookPage, e outros lugares que precisam de ratings
 */

interface StarRatingProps {
  /** Rating atual (0.5 a 5.0, ou null) */
  rating: number | null;
  /** Tamanho das estrelas */
  size?: "sm" | "md" | "lg";
  /** Se true, permite clicar para alterar o rating */
  interactive?: boolean;
  /** Callback quando rating muda (somente modo interativo) */
  onChange?: (value: number) => void;
  /** Se true, exibe o valor numérico ao lado das estrelas */
  showValue?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = "sm",
  interactive = false,
  onChange,
  showValue = true,
  className,
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
    <div className={cn("flex items-center gap-0.5", className)}>
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
      {showValue && rating !== null && (
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
