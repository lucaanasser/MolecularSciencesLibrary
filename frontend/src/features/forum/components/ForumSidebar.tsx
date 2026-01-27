import React, { useState, useEffect } from "react";
import { TrendingUp, Star, MessageSquare, Award, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import * as ForumService from "@/services/ForumService";

interface ForumSidebarProps {
  onTagClick?: (tagName: string) => void;
  selectedTag?: string | null;
}

const ForumSidebar: React.FC<ForumSidebarProps> = ({ onTagClick, selectedTag }) => {
  const [popularTags, setPopularTags] = useState<ForumService.Tag[]>([]);
  const [topContributors, setTopContributors] = useState<ForumService.TopContributor[]>([]);
  const [stats, setStats] = useState<ForumService.GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [tagsData, contributorsData, statsData] = await Promise.all([
          ForumService.getPopularTags(),
          ForumService.getTopContributors(),
          ForumService.getGlobalStats(),
        ]);
        
        setPopularTags(tagsData);
        setTopContributors(contributorsData);
        setStats(statsData);
      } catch (error) {
        console.error("Erro ao carregar dados da sidebar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-academic-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stack UnderFlow Tips */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
      >
        <div className="flex items-start gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-yellow-900">Dicas do Stack UnderFlow</h3>
        </div>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• Pesquise antes de perguntar (mas sabemos que você não vai)</li>
          <li>• Seja específico no título (ou não, a gente entende)</li>
          <li>• Marque a melhor resposta (se tiver alguma)</li>
          <li>• Vote nas respostas úteis (karma é real)</li>
        </ul>
      </motion.div>

      {/* Popular Tags */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-lg p-4"
      >
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-academic-blue" />
          Tags Populares
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => onTagClick?.(tag.nome)}
              className={`text-xs px-2 py-1 rounded transition-colors border ${
                selectedTag === tag.nome
                  ? "bg-cyan-600 text-white border-cyan-600"
                  : "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
              }`}
            >
              {tag.nome}
              <span className={`ml-1 ${selectedTag === tag.nome ? "text-cyan-100" : "text-cyan-600"}`}>
                ×{tag.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Top Contributors */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-lg p-4"
      >
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-academic-blue" />
          Top Contributors
        </h3>
        <div className="space-y-3">
          {topContributors.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between text-sm hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-400 text-xs w-4">
                  {index + 1}.
                </span>
                <span className="text-blue-600 font-medium">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs">
                  {user.pontos.toLocaleString()}
                </span>
                {user.pontos >= 100 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(Math.floor(user.pontos / 100), 5) }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 text-yellow-500 fill-yellow-500"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-gray-200 rounded-lg p-4"
      >
        <h3 className="font-bold text-gray-900 mb-3">Estatísticas</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Perguntas:</span>
            <span className="font-semibold text-gray-900">
              {stats?.total_questions.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Respostas:</span>
            <span className="font-semibold text-gray-900">
              {stats?.total_answers.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Usuários ativos:</span>
            <span className="font-semibold text-gray-900">
              {stats?.active_users.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de resposta:</span>
            <span className="font-semibold text-green-600">
              {stats?.response_rate ? `${Math.round(stats.response_rate)}%` : "0%"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForumSidebar;
