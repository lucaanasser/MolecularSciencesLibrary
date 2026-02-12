import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import type { UserSearchResult } from "@/services/OldUsersService";

interface UserResultsListProps {
  results: UserSearchResult[];
  searchQuery: string;
}

/**
 * Lista de resultados de usuários estilo Google
 * Links azuis com avatar, nome, NUSP e turma
 */
export const UserResultsList: React.FC<UserResultsListProps> = ({
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
      {results.map((user) => (
        <div key={user.id} className="pb-4 border-b border-gray-200 last:border-0 flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 mt-1">
            {user.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-library-purple/10 flex items-center justify-center">
                <span className="text-library-purple font-semibold text-lg">
                  {user.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Informações do usuário */}
          <div className="flex-1 min-w-0">
            {/* Link principal estilo Google */}
            <Link
              to={`/perfil/${user.id}`}
              className="text-xl text-[#1a0dab] hover:underline visited:text-[#681da8] font-normal"
            >
              {highlightMatch(user.name, searchQuery)}
            </Link>

            {/* Informações secundárias */}
            <div className="flex flex-col gap-1 mt-1">
              {/* Turma */}
              {user.class && (
                <div className="text-sm text-gray-600">
                  <Users size={14} className="inline mr-1" />
                  {user.class}
                </div>
              )}

              {/* Tags do perfil */}
              {user.tags && user.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.tags.slice(0, 5).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 bg-academic-blue/10 text-academic-blue rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {user.tags.length > 5 && (
                    <span className="text-xs text-gray-500">+{user.tags.length - 5}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
