import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Bookmark,
  Award,
  CheckCircle,
  ArrowLeft,
  Edit,
  Flag,
} from "lucide-react";
import { motion } from "framer-motion";

interface Answer {
  id: number;
  conteudo: string;
  autor: string;
  autorId: number;
  votos: number;
  isAccepted: boolean;
  dataCriacao: string;
}

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newAnswer, setNewAnswer] = useState("");
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null);

  // Mock data - substituir por API
  const question = {
    id: Number(id),
    titulo: "Quantos créditos preciso para formar?",
    conteudo:
      "Estou no 3º ano e ainda não entendi direito quantos créditos preciso completar. Alguém pode explicar de forma clara?\n\nVi no Júpiter que preciso de:\n- Créditos obrigatórios\n- Créditos eletivos\n- Créditos livres\n\nMas não sei exatamente quantos de cada. E como funciona a contagem dos créditos-aula vs créditos-trabalho?",
    autor: "João Silva",
    autorId: 123,
    views: 234,
    votos: 12,
    tags: ["créditos", "formatura", "júpiter"],
    dataCriacao: "15 de janeiro de 2026 às 14:30",
  };

  const answers: Answer[] = [
    {
      id: 1,
      conteudo:
        "Para se formar em Ciência da Computação você precisa de **170 créditos** no total.\n\nA distribuição é:\n- **Obrigatórios**: 144 créditos\n- **Eletivos**: 16 créditos (disciplinas optativas da computação)\n- **Livres**: 10 créditos (qualquer disciplina da USP)\n\nSobre créditos-aula vs créditos-trabalho:\n- **Crédito-aula**: 15 horas de aula\n- **Crédito-trabalho**: 30 horas de trabalho (TCC, IC, etc)\n\nPara formar você precisa completar TODOS os créditos obrigatórios + os eletivos e livres somando o total.",
      autor: "Maria Santos",
      autorId: 456,
      votos: 45,
      isAccepted: true,
      dataCriacao: "há 2 horas",
    },
    {
      id: 2,
      conteudo:
        "Complementando a resposta da Maria: você pode ver seus créditos no Júpiter em \"Histórico Escolar\" > \"Créditos\".\n\nLá vai mostrar quantos você já completou de cada tipo. Fica atento também aos pré-requisitos das disciplinas!",
      autor: "Carlos Mendes",
      autorId: 789,
      votos: 12,
      isAccepted: false,
      dataCriacao: "há 1 hora",
    },
  ];

  const handleVote = (type: "up" | "down") => {
    if (voteState === type) {
      setVoteState(null);
    } else {
      setVoteState(type);
    }
  };

  const handleSubmitAnswer = () => {
    if (newAnswer.trim()) {
      console.log("Submitting answer:", newAnswer);
      setNewAnswer("");
      // TODO: Implementar submissão para API
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/forum")}
            className="flex items-center gap-2 text-gray-600 hover:text-cm-academic mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o fórum
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {question.titulo}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Perguntado {question.dataCriacao}</span>
            <span>•</span>
            <span>Visualizado {question.views} vezes</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Question */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex gap-4">
                {/* Vote Column */}
                <div className="flex flex-col items-center gap-2 min-w-[40px]">
                  <button
                    onClick={() => handleVote("up")}
                    className={`p-2 rounded-full transition-colors ${
                      voteState === "up"
                        ? "bg-cm-academic text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold text-gray-900">
                    {question.votos + (voteState === "up" ? 1 : voteState === "down" ? -1 : 0)}
                  </span>
                  <button
                    onClick={() => handleVote("down")}
                    className={`p-2 rounded-full transition-colors ${
                      voteState === "down"
                        ? "bg-cm-academic text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 mt-2">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 whitespace-pre-line">
                      {question.conteudo}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-cyan-50 text-cyan-700 text-xs px-3 py-1 rounded hover:bg-cyan-100 cursor-pointer border border-cyan-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions & Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-cm-academic transition-colors">
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-cm-academic transition-colors">
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors">
                        <Flag className="w-4 h-4" />
                        Denunciar
                      </button>
                    </div>

                    <Link
                      to={`/profile/${question.autorId}`}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          perguntado por
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {question.autor}
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-cm-academic rounded-full flex items-center justify-center text-white font-bold">
                        {question.autor[0]}
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Answers Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {answers.length} {answers.length === 1 ? "Resposta" : "Respostas"}
              </h2>

              <div className="space-y-6">
                {answers.map((answer, index) => (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex gap-4 pb-6 ${
                      index < answers.length - 1 ? "border-b border-gray-200" : ""
                    } ${answer.isAccepted ? "bg-green-50 -mx-6 px-6 rounded" : ""}`}
                  >
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-2 min-w-[40px]">
                      <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <span className="text-xl font-bold text-gray-900">
                        {answer.votos}
                      </span>
                      <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                      {answer.isAccepted && (
                        <div className="mt-2">
                          <CheckCircle className="w-8 h-8 text-green-600 fill-green-100" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {answer.isAccepted && (
                        <div className="flex items-center gap-2 mb-3 text-green-700 font-medium text-sm">
                          <Award className="w-4 h-4" />
                          Resposta aceita
                        </div>
                      )}
                      <div className="prose max-w-none mb-4">
                        <p className="text-gray-700 whitespace-pre-line">
                          {answer.conteudo}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <div className="flex gap-3">
                          <button className="text-sm text-gray-600 hover:text-cm-academic transition-colors">
                            Comentar
                          </button>
                          <button className="text-sm text-gray-600 hover:text-cm-academic transition-colors">
                            Editar
                          </button>
                        </div>

                        <Link
                          to={`/profile/${answer.autorId}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="text-gray-500">
                            respondido {answer.dataCriacao}
                          </div>
                          <div className="text-blue-600 font-medium">
                            {answer.autor}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Your Answer */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sua Resposta
              </h2>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Escreva sua resposta aqui... Use Markdown se quiser!"
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Dica: Seja claro e objetivo. Cite fontes quando possível!
                </p>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!newAnswer.trim()}
                  className="bg-cm-academic hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Enviar Resposta
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              {/* Related Questions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">
                  Perguntas Relacionadas
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/forum/2"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      → Como funciona o sistema de optativas?
                    </Link>
                    <span className="text-gray-500 ml-2">3 respostas</span>
                  </li>
                  <li>
                    <Link
                      to="/forum/4"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      → Iniciação científica conta como crédito?
                    </Link>
                    <span className="text-gray-500 ml-2">2 respostas</span>
                  </li>
                  <li>
                    <Link
                      to="/forum/6"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      → Grade curricular mudou, e agora?
                    </Link>
                    <span className="text-gray-500 ml-2">1 resposta</span>
                  </li>
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">
                  Como responder bem
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Leia a pergunta com atenção</li>
                  <li>✓ Seja específico e objetivo</li>
                  <li>✓ Cite fontes quando possível</li>
                  <li>✓ Use formatação para facilitar leitura</li>
                  <li>✗ Não seja rude ou sarcástico</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuestionDetailPage;
