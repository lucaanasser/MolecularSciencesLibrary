import React from "react";
import { TrendingUp, Star, MessageSquare, Award, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const ForumSidebar: React.FC = () => {
  const popularTags = [
    { name: "créditos", count: 42 },
    { name: "projeto-avançado", count: 38 },
    { name: "orientador", count: 31 },
    { name: "formatura", count: 28 },
    { name: "iniciação-científica", count: 24 },
    { name: "grade-curricular", count: 20 },
    { name: "optativas", count: 18 },
    { name: "tcc", count: 15 },
  ];

  const topContributors = [
    { name: "Ana Silva", pontos: 2834, badges: 3 },
    { name: "Carlos Mendes", pontos: 1952, badges: 2 },
    { name: "Beatriz Costa", pontos: 1723, badges: 2 },
    { name: "João Santos", pontos: 1456, badges: 1 },
    { name: "Maria Oliveira", pontos: 1203, badges: 1 },
  ];

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
          <TrendingUp className="w-5 h-5 text-cm-academic" />
          Tags Populares
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, index) => (
            <button
              key={index}
              className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded hover:bg-cyan-100 transition-colors border border-cyan-200"
            >
              {tag.name}
              <span className="ml-1 text-cyan-600">×{tag.count}</span>
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
          <Award className="w-5 h-5 text-cm-academic" />
          Top Contributors
        </h3>
        <div className="space-y-3">
          {topContributors.map((user, index) => (
            <div
              key={index}
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
                {user.badges > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: user.badges }).map((_, i) => (
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
            <span className="font-semibold text-gray-900">1,234</span>
          </div>
          <div className="flex justify-between">
            <span>Respostas:</span>
            <span className="font-semibold text-gray-900">3,456</span>
          </div>
          <div className="flex justify-between">
            <span>Usuários ativos:</span>
            <span className="font-semibold text-gray-900">567</span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de resposta:</span>
            <span className="font-semibold text-green-600">87%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForumSidebar;
