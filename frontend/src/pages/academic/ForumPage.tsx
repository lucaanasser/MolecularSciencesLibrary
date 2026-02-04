import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import ForumHeader from "@/features/forum/components/ForumHeader";
import ForumFilters, { SortOption } from "@/features/forum/components/ForumFilters";
import ForumSidebar from "@/features/forum/components/ForumSidebar";
import QuestionCard from "@/features/forum/components/QuestionCard";
import { Plus, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import * as ForumService from "@/services/ForumService";

type Question = ForumService.Question;

/**
 * Página principal do Fórum - Stack UnderFlow
 * Uma paródia do Stack Overflow para dúvidas acadêmicas
 */
const ForumPage: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortOption>("recente");
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Buscar perguntas da API
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await ForumService.getQuestions({
          sortBy,
          search: searchQuery || undefined,
          tag: selectedTag || undefined,
        });
        setQuestions(data.questions);
      } catch (err) {
        logger.error("Erro ao carregar perguntas:", err);
        setError("Erro ao carregar perguntas. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [sortBy, searchQuery, selectedTag]);

  // Handler para selecionar tag
  const handleTagClick = (tagName: string) => {
    setSelectedTag(tagName === selectedTag ? null : tagName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <ForumHeader />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar perguntas, tags, conteúdo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Ask Question Button */}
            <div className="mb-4 flex justify-end">
              <Link to="/forum/nova-pergunta">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-academic-blue hover:bg-cyan-600 text-white px-6 py-2.5 rounded-md font-medium flex items-center gap-2 shadow-md transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Fazer Pergunta
                </motion.button>
              </Link>
            </div>

            {/* Filters */}
            <ForumFilters
              currentSort={sortBy}
              onSortChange={setSortBy}
              questionCount={questions.length}
            />

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-academic-blue" />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Selected Tag Badge */}
            {selectedTag && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">Filtrando por:</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 hover:bg-cyan-200"
                >
                  {selectedTag}
                  <span className="font-bold">×</span>
                </button>
              </div>
            )}

            {/* Questions List */}
            <div className="mt-4 space-y-3">
              {!loading && !error && questions.length > 0 ? (
                questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              ) : !loading && !error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-lg p-12 text-center"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhuma pergunta encontrada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tente ajustar os filtros ou fazer uma nova busca
                  </p>
                  <Link to="/forum/nova-pergunta">
                    <button className="bg-academic-blue hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium transition-colors">
                      Seja o primeiro a perguntar!
                    </button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-4">
              <ForumSidebar onTagClick={handleTagClick} selectedTag={selectedTag} />
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default ForumPage;
