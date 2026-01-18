import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Award,
  CheckCircle,
  ArrowLeft,
  Edit,
  Flag,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import * as ForumService from "@/services/ForumService";
import { toast } from "sonner";

interface Answer {
  id: number;
  question_id: number;
  user_id: number;
  user_name: string;
  content: string;
  vote_count: number;
  is_accepted: boolean;
  created_at: string;
  user_vote?: number;
}

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newAnswer, setNewAnswer] = useState("");
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnswerAnonymous, setIsAnswerAnonymous] = useState(false);

  // Verificar se o usuário está logado
  const isLoggedIn = !!localStorage.getItem("token");
  const currentUserNUSP = localStorage.getItem("nusp");

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await ForumService.getQuestionById(Number(id));
        setQuestion(data);
      } catch (err: any) {
        console.error("Erro ao carregar pergunta:", err);
        setError(err.message || "Erro ao carregar pergunta");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleVote = async (type: "question" | "answer", targetId: number, value: 1 | -1 | 0) => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para votar");
      return;
    }

    try {
      if (type === "question") {
        await ForumService.voteQuestion(targetId, value as 1 | -1);
        // Recarregar pergunta
        const data = await ForumService.getQuestionById(Number(id));
        setQuestion(data);
        toast.success("Voto registrado!");
      } else {
        await ForumService.voteAnswer(targetId, value as 1 | -1);
        // Recarregar pergunta
        const data = await ForumService.getQuestionById(Number(id));
        setQuestion(data);
        toast.success("Voto registrado!");
      }
    } catch (err: any) {
      console.error("Erro ao votar:", err);
      toast.error(err.message || "Erro ao registrar voto");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para responder");
      return;
    }

    if (!newAnswer.trim()) {
      toast.error("Por favor, escreva uma resposta");
      return;
    }

    setSubmitting(true);
    try {
      await ForumService.createAnswer(Number(id), newAnswer.trim(), isAnswerAnonymous);
      setNewAnswer("");
      setIsAnswerAnonymous(false);
      toast.success("Resposta enviada com sucesso!");
      
      // Recarregar pergunta para mostrar nova resposta
      const data = await ForumService.getQuestionById(Number(id));
      setQuestion(data);
    } catch (err: any) {
      console.error("Erro ao enviar resposta:", err);
      toast.error(err.message || "Erro ao enviar resposta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: number) => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado");
      return;
    }

    try {
      await ForumService.acceptAnswer(answerId);
      toast.success("Resposta aceita!");
      
      // Recarregar pergunta
      const data = await ForumService.getQuestionById(Number(id));
      setQuestion(data);
    } catch (err: any) {
      console.error("Erro ao aceitar resposta:", err);
      toast.error(err.message || "Erro ao aceitar resposta");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-cm-academic" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Pergunta não encontrada"}
          </h1>
          <button
            onClick={() => navigate("/forum")}
            className="text-cm-academic hover:underline"
          >
            Voltar para o fórum
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isQuestionAuthor = currentUserNUSP === String(question.user_id);

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
            {question.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Perguntado {ForumService.formatRelativeDate(question.created_at)}</span>
            <span>•</span>
            <span>Visualizado {question.view_count} {question.view_count === 1 ? 'vez' : 'vezes'}</span>
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
                    onClick={() => handleVote("question", question.id, question.user_vote === 1 ? 0 : 1)}
                    disabled={!isLoggedIn}
                    className={`p-2 rounded-full transition-colors ${
                      question.user_vote === 1
                        ? "bg-cm-academic text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={!isLoggedIn ? "Faça login para votar" : "Votar"}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold text-gray-900">
                    {question.vote_count}
                  </span>
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 mt-2">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 whitespace-pre-line">
                      {question.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags.map((tag: string, index: number) => (
                      <Link
                        key={index}
                        to={`/forum?tag=${tag}`}
                        className="bg-cyan-50 text-cyan-700 text-xs px-3 py-1 rounded hover:bg-cyan-100 cursor-pointer border border-cyan-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>

                  {/* Actions & Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-cm-academic transition-colors">
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                      </button>
                      {isQuestionAuthor && (
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-cm-academic transition-colors">
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                      )}
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors">
                        <Flag className="w-4 h-4" />
                        Denunciar
                      </button>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          perguntado por
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {question.user_name}
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-cm-academic rounded-full flex items-center justify-center text-white font-bold">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Answers Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {question.answers?.length || 0} {(question.answers?.length || 0) === 1 ? "Resposta" : "Respostas"}
              </h2>

              <div className="space-y-6">
                {question.answers?.map((answer: Answer, index: number) => {
                  const isAnswerAuthor = currentUserNUSP === String(answer.user_id);
                  
                  return (
                    <motion.div
                      key={answer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-4 pb-6 ${
                        index < (question.answers?.length || 0) - 1 ? "border-b border-gray-200" : ""
                      } ${answer.is_accepted ? "bg-green-50 -mx-6 px-6 rounded" : ""}`}
                    >
                      {/* Vote Column */}
                      <div className="flex flex-col items-center gap-2 min-w-[40px]">
                        <button
                          onClick={() => handleVote("answer", answer.id, answer.user_vote === 1 ? 0 : 1)}
                          disabled={!isLoggedIn}
                          className={`p-2 rounded-full transition-colors ${
                            answer.user_vote === 1
                              ? "bg-cm-academic text-white"
                              : "hover:bg-gray-100 text-gray-600"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <span className="text-xl font-bold text-gray-900">
                          {answer.vote_count}
                        </span>
                        {isQuestionAuthor && !answer.is_accepted && (
                          <button
                            onClick={() => handleAcceptAnswer(answer.id)}
                            className="mt-2 p-2 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
                            title="Aceitar esta resposta"
                          >
                            <CheckCircle className="w-8 h-8" />
                          </button>
                        )}
                        {answer.is_accepted && (
                          <div className="mt-2">
                            <CheckCircle className="w-8 h-8 text-green-600 fill-green-100" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {answer.is_accepted && (
                          <div className="flex items-center gap-2 mb-3 text-green-700 font-medium text-sm">
                            <Award className="w-4 h-4" />
                            Resposta aceita
                          </div>
                        )}
                        <div className="prose max-w-none mb-4">
                          <p className="text-gray-700 whitespace-pre-line">
                            {answer.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3">
                          <div className="flex gap-3">
                            {isAnswerAuthor && (
                              <button className="text-sm text-gray-600 hover:text-cm-academic transition-colors">
                                Editar
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="text-gray-500">
                              respondido {ForumService.formatRelativeDate(answer.created_at)}
                            </div>
                            <div className="text-blue-600 font-medium">
                              {answer.user_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Your Answer */}
            {isLoggedIn && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Sua Resposta
                </h2>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Escreva sua resposta aqui... Use Markdown se quiser!"
                  className="w-full min-h-[200px] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={submitting}
                />
                <div className="mt-4 space-y-3">
                  {/* Anonymous Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="answer-anonymous"
                      checked={isAnswerAnonymous}
                      onChange={(e) => setIsAnswerAnonymous(e.target.checked)}
                      className="w-4 h-4 text-cm-academic border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="answer-anonymous" className="text-sm text-gray-700 cursor-pointer">
                      Responder anonimamente (apenas o admin verá seu nome)
                    </label>
                  </div>

                  {/* Submit Row */}
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Dica: Seja claro e objetivo. Cite fontes quando possível!
                    </p>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!newAnswer.trim() || submitting}
                      className="bg-cm-academic hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? "Enviando..." : "Enviar Resposta"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoggedIn && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-gray-700 mb-4">
                  Você precisa estar logado para responder perguntas
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-cm-academic hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Fazer Login
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
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
