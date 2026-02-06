import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Discipline } from "@/types/discipline";

interface DisciplineResult extends Discipline {
  avaliacao?: number | null;
}

interface DisciplineResultsListProps {
  results: DisciplineResult[];
  searchQuery: string;
}

/**
 * Lista de resultados de disciplinas estilo Google
 * Links azuis com título, código, unidade e avaliação
 */
export const DisciplineResultsList: React.FC<DisciplineResultsListProps> = ({
  results,
  searchQuery,
}) => {
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    // Escapa caracteres especiais de regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={i} className="font-bold">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-4">
      {results.map((disc) => (
        <div key={disc.codigo} className="pb-4 border-b border-gray-200 last:border-0">
          {/* Link principal estilo Google */}
          <Link
            to={`/academico/disciplina/${disc.codigo}`}
            className="text-xl text-[#1a0dab] hover:underline visited:text-[#681da8] font-normal"
          >
            {highlightMatch(`${disc.codigo} - ${disc.nome}`, searchQuery)}
          </Link>

          {/* Informações secundárias */}
          <div className="flex items-center gap-3 mt-1 text-sm">
            {/* Unidade e Campus */}
            <div className="text-gray-600">
              {disc.unidade && <span>{disc.unidade}</span>}
              {disc.campus && (
                <span className="text-gray-500 ml-2">• {disc.campus}</span>
              )}
            </div>

            {/* Créditos */}
            {(disc.creditos_aula > 0 || disc.creditos_trabalho > 0) && (
              <div className="text-gray-500">
                {disc.creditos_aula}-{disc.creditos_trabalho}
              </div>
            )}

            {/* Avaliação */}
            {disc.avaliacao && (
              <div className="flex items-center gap-1 text-amber-600">
                <Star size={14} fill="currentColor" />
                <span className="font-medium">{disc.avaliacao.toFixed(1)}</span>
              </div>
            )}

            {/* Badges */}
            {disc.is_postgrad && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                Pós-grad
              </span>
            )}
            {disc.has_valid_classes && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                Com turmas
              </span>
            )}
          </div>

          {/* Ementa (preview) */}
          {disc.ementa && (
            <p className="text-sm text-gray-700 mt-1 line-clamp-2">
              {disc.ementa}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
