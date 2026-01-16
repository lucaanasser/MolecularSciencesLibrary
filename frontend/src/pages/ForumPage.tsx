import React, { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ForumHeader from "@/features/forum/components/ForumHeader";
import ForumFilters, { SortOption } from "@/features/forum/components/ForumFilters";
import ForumSidebar from "@/features/forum/components/ForumSidebar";
import QuestionCard, { Question } from "@/features/forum/components/QuestionCard";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Página principal do Fórum - Stack UnderFlow
 * Uma paródia do Stack Overflow para dúvidas acadêmicas
 */
const ForumPage: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortOption>("recente");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - substituir por dados da API no futuro
  const mockQuestions: Question[] = [
    {
      id: 1,
      titulo: "Quantos créditos preciso para formar?",
      conteudo: "Estou no 3º ano e ainda não entendi direito quantos créditos preciso completar. Alguém pode explicar de forma clara? Vi no Júpiter mas está confuso...",
      autor: "João Silva",
      autorId: 123,
      views: 234,
      respostas: 5,
      votos: 12,
      tags: ["créditos", "formatura", "júpiter"],
      temResposta: true,
      dataCriacao: "há 2 horas",
    },
    {
      id: 2,
      titulo: "Como encontrar um orientador para o TCC?",
      conteudo: "Estou no último ano e preciso encontrar um orientador para o TCC. Qual a melhor forma de abordar um professor? Tem algum template de email?",
      autor: "Maria Santos",
      autorId: 456,
      views: 189,
      respostas: 8,
      votos: 23,
      tags: ["orientador", "tcc", "projeto-avançado"],
      temResposta: true,
      dataCriacao: "há 5 horas",
    },
    {
      id: 3,
      titulo: "Modelo de projeto de MAC0499 (avançado)",
      conteudo: "Alguém tem um exemplo de projeto de avançado aprovado? Quero ter uma ideia de como estruturar o meu. Qualquer área serve!",
      autor: "Carlos Mendes",
      autorId: 789,
      views: 456,
      respostas: 0,
      votos: 8,
      tags: ["projeto-avançado", "mac0499", "modelos"],
      temResposta: false,
      dataCriacao: "há 1 dia",
    },
    {
      id: 4,
      titulo: "Iniciação científica conta como crédito?",
      conteudo: "Estou fazendo IC há 6 meses e queria saber se isso conta como crédito-aula ou crédito-trabalho para a formatura. Alguém sabe?",
      autor: "Ana Costa",
      autorId: 101,
      views: 123,
      respostas: 3,
      votos: 15,
      tags: ["créditos", "iniciação-científica", "formatura"],
      temResposta: true,
      dataCriacao: "há 2 dias",
    },
    {
      id: 5,
      titulo: "Optativas recomendadas para quem gosta de ML",
      conteudo: "Quero me aprofundar em Machine Learning. Quais optativas vocês recomendam? Já fiz MAC0460.",
      autor: "Pedro Almeida",
      autorId: 202,
      views: 567,
      respostas: 12,
      votos: 31,
      tags: ["optativas", "machine-learning", "recomendações"],
      temResposta: true,
      dataCriacao: "há 3 dias",
    },
    {
      id: 6,
      titulo: "Grade curricular mudou? Como isso me afeta?",
      conteudo: "Entrei em 2023 e vi que a grade mudou em 2024. Isso afeta quem já estava matriculado? Posso seguir a nova grade se eu quiser?",
      autor: "Beatriz Lima",
      autorId: 303,
      views: 89,
      respostas: 2,
      votos: 6,
      tags: ["grade-curricular", "formatura"],
      temResposta: false,
      dataCriacao: "há 4 dias",
    },
    {
      id: 7,
      titulo: "Como funciona o sistema de pré-requisitos?",
      conteudo: "Não consigo me matricular em MAC0338 mas já fiz todas as disciplinas listadas como pré-requisito. O que pode estar acontecendo?",
      autor: "Lucas Ferreira",
      autorId: 404,
      views: 178,
      respostas: 6,
      votos: 9,
      tags: ["pré-requisitos", "matrícula", "júpiter"],
      temResposta: true,
      dataCriacao: "há 5 dias",
    },
    {
      id: 8,
      titulo: "Vale a pena fazer intercâmbio?",
      conteudo: "Estou pensando em fazer intercâmbio no 4º ano. Alguém tem experiência? Como funciona a validação de créditos?",
      autor: "Camila Rodrigues",
      autorId: 505,
      views: 234,
      respostas: 15,
      votos: 42,
      tags: ["intercâmbio", "créditos", "experiência"],
      temResposta: true,
      dataCriacao: "há 1 semana",
    },
  ];

  // Filtrar e ordenar perguntas
  const filteredAndSortedQuestions = useMemo(() => {
    let result = [...mockQuestions];

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.titulo.toLowerCase().includes(query) ||
          q.conteudo.toLowerCase().includes(query) ||
          q.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Ordenar
    switch (sortBy) {
      case "votos":
        result.sort((a, b) => b.votos - a.votos);
        break;
      case "atividade":
        result.sort((a, b) => b.respostas - a.respostas);
        break;
      case "sem-resposta":
        result = result.filter((q) => q.respostas === 0);
        break;
      case "recente":
      default:
        // Já está ordenado por recente no mock
        break;
    }

    return result;
  }, [sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
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
                  className="bg-cm-academic hover:bg-cyan-600 text-white px-6 py-2.5 rounded-md font-medium flex items-center gap-2 shadow-md transition-colors"
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
              questionCount={filteredAndSortedQuestions.length}
            />

            {/* Questions List */}
            <div className="mt-4 space-y-3">
              {filteredAndSortedQuestions.length > 0 ? (
                filteredAndSortedQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-gray-200 rounded-lg p-12 text-center"
                >
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhuma pergunta encontrada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tente ajustar os filtros ou fazer uma nova busca
                  </p>
                  <Link to="/forum/nova-pergunta">
                    <button className="bg-cm-academic hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium transition-colors">
                      Seja o primeiro a perguntar!
                    </button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Pagination (placeholder) */}
            {filteredAndSortedQuestions.length > 0 && (
              <div className="mt-6 flex justify-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                  Anterior
                </button>
                <button className="px-4 py-2 bg-cm-academic text-white rounded-md text-sm font-medium">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                  3
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                  Próximo
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-4">
              <ForumSidebar />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForumPage;
