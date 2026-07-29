import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";


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
  Trash2,
  Pin,
  Lock,
  Unlock,
  GraduationCap,
  Bell,
  Loader2,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import * as ForumService from "@/services/ForumService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROUTES, forumTagPath, disciplinePath } from "@/constants/navigation";
import CommentSection from "@/features/forum/components/CommentSection";
import MarkdownContent from "@/features/forum/components/MarkdownContent";
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
  comments?: ForumService.Comment[];
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

  // Moderação / denúncia
  const [moderating, setModerating] = useState(false);
  const [reportTarget, setReportTarget] = useState<
    { type: ForumService.ReportTargetType; id: number } | null
  >(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Edição
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editAnswerContent, setEditAnswerContent] = useState("");

  // Usuário atual (id + role) para checagens de autor/admin
  const currentUser = useCurrentUser();
  const isLoggedIn = !!localStorage.getItem("token");
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await ForumService.getQuestionById(Number(id));
        setQuestion(data);
      } catch (err: any) {
        logger.error("Erro ao carregar pergunta:", err);
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
      logger.error("Erro ao votar:", err);
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
      logger.error("Erro ao enviar resposta:", err);
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
      logger.error("Erro ao aceitar resposta:", err);
      toast.error(err.message || "Erro ao aceitar resposta");
    }
  };

  const handleDeleteQuestion = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta pergunta? Todas as respostas também serão removidas. Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await ForumService.deleteQuestion(Number(id));
      toast.success("Pergunta excluída");
      navigate(ROUTES.FORUM);
    } catch (err: any) {
      logger.error("Erro ao excluir pergunta:", err);
      toast.error(err.message || "Erro ao excluir pergunta");
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta resposta? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await ForumService.deleteAnswer(answerId);
      toast.success("Resposta excluída");
      const data = await ForumService.getQuestionById(Number(id));
      setQuestion(data);
    } catch (err: any) {
      logger.error("Erro ao excluir resposta:", err);
      toast.error(err.message || "Erro ao excluir resposta");
    }
  };

  const handleToggleClose = async () => {
    setModerating(true);
    try {
      const res = await ForumService.toggleCloseQuestion(Number(id));
      toast.success(res.message);
      const data = await ForumService.getQuestionById(Number(id));
      setQuestion(data);
    } catch (err: any) {
      logger.error("Erro ao fechar/reabrir pergunta:", err);
      toast.error(err.message || "Erro ao fechar/reabrir pergunta");
    } finally {
      setModerating(false);
    }
  };

  const handleTogglePin = async () => {
    setModerating(true);
    try {
      const res = await ForumService.togglePinQuestion(Number(id));
      toast.success(res.message);
      const data = await ForumService.getQuestionById(Number(id));
      setQuestion(data);
    } catch (err: any) {
      logger.error("Erro ao fixar/desafixar pergunta:", err);
      toast.error(err.message || "Erro ao fixar/desafixar pergunta");
    } finally {
      setModerating(false);
    }
  };

  const openReport = (type: ForumService.ReportTargetType, targetId: number) => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para denunciar");
      return;
    }
    setReportReason("");
    setReportTarget({ type, id: targetId });
  };

  const handleSubmitReport = async () => {
    if (!reportTarget) return;
    if (reportReason.trim().length < 5) {
      toast.error("Descreva o motivo (mínimo 5 caracteres)");
      return;
    }
    setReportSubmitting(true);
    try {
      const res = await ForumService.createReport(
        reportTarget.type,
        reportTarget.id,
        reportReason.trim()
      );
      toast.success(res.message);
      setReportTarget(null);
      setReportReason("");
    } catch (err: any) {
      logger.error("Erro ao denunciar:", err);
      toast.error(err.message || "Erro ao registrar denúncia");
    } finally {
      setReportSubmitting(false);
    }
  };

  const reloadQuestion = async () => {
    const data = await ForumService.getQuestionById(Number(id));
    setQuestion(data);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const handleToggleBookmark = async () => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para salvar");
      return;
    }
    try {
      const res = await ForumService.toggleBookmark(Number(id));
      setQuestion((q: any) => ({ ...q, is_bookmarked: res.is_bookmarked }));
      toast.success(res.message);
    } catch (err: any) {
      logger.error("Erro ao salvar pergunta:", err);
      toast.error(err.message || "Erro ao salvar pergunta");
    }
  };

  const openEditQuestion = () => {
    setEditTitle(question.title);
    setEditContent(question.content);
    setEditingQuestion(true);
  };

  const handleSaveQuestionEdit = async () => {
    if (editTitle.trim().length < 10) {
      toast.error("O título deve ter pelo menos 10 caracteres");
      return;
    }
    if (editContent.trim().length < 20) {
      toast.error("O conteúdo deve ter pelo menos 20 caracteres");
      return;
    }
    setEditSubmitting(true);
    try {
      await ForumService.updateQuestion(Number(id), {
        titulo: editTitle.trim(),
        conteudo: editContent.trim(),
      });
      setEditingQuestion(false);
      await reloadQuestion();
      toast.success("Pergunta atualizada");
    } catch (err: any) {
      logger.error("Erro ao editar pergunta:", err);
      toast.error(err.message || "Erro ao editar pergunta");
    } finally {
      setEditSubmitting(false);
    }
  };

  const openEditAnswer = (answer: Answer) => {
    setEditingAnswerId(answer.id);
    setEditAnswerContent(answer.content);
  };

  const handleSaveAnswerEdit = async () => {
    if (editAnswerContent.trim().length < 10) {
      toast.error("A resposta deve ter pelo menos 10 caracteres");
      return;
    }
    setEditSubmitting(true);
    try {
      await ForumService.updateAnswer(editingAnswerId!, editAnswerContent.trim());
      setEditingAnswerId(null);
      await reloadQuestion();
      toast.success("Resposta atualizada");
    } catch (err: any) {
      logger.error("Erro ao editar resposta:", err);
      toast.error(err.message || "Erro ao editar resposta");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para seguir");
      return;
    }
    try {
      const res = await ForumService.toggleSubscription(Number(id));
      setQuestion((q: any) => ({ ...q, is_subscribed: res.is_subscribed }));
      toast.success(res.message);
    } catch (err: any) {
      logger.error("Erro ao seguir pergunta:", err);
      toast.error(err.message || "Erro ao seguir pergunta");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-academic-blue" />
        </div>
        
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Pergunta não encontrada"}
          </h1>
          <button
            onClick={() => navigate(ROUTES.FORUM)}
            className="text-academic-blue hover:underline"
          >
            Voltar para o fórum
          </button>
        </div>
        
      </div>
    );
  }

  const isQuestionAuthor = !!currentUser && currentUser.id === question.user_id;
  const canDeleteQuestion = isQuestionAuthor || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Header removido, agora está no layout global */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(ROUTES.FORUM)}
            className="flex items-center gap-2 text-gray-600 hover:text-academic-blue mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o fórum
          </button>
          <div className="flex items-center flex-wrap gap-2 mb-2">
            {question.is_pinned && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                <Pin className="w-3 h-3" /> Fixada
              </span>
            )}
            {question.is_closed && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-300">
                <Lock className="w-3 h-3" /> Fechada
              </span>
            )}
          </div>
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
                        ? "bg-academic-blue text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={!isLoggedIn ? "Faça login para votar" : "Votar"}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold text-gray-900">
                    {question.vote_count}
                  </span>
                  <button
                    onClick={handleToggleBookmark}
                    className={`p-2 rounded-full mt-2 transition-colors ${
                      question.is_bookmarked ? "text-academic-blue" : "hover:bg-gray-100 text-gray-600"
                    }`}
                    title={question.is_bookmarked ? "Remover dos salvos" : "Salvar pergunta"}
                  >
                    <Bookmark className={`w-5 h-5 ${question.is_bookmarked ? "fill-academic-blue" : ""}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <MarkdownContent content={question.content} className="mb-6" />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.disciplina_codigo && (
                      <Link
                        to={disciplinePath(question.disciplina_codigo)}
                        className="flex items-center gap-1 bg-academic-blue/10 text-academic-blue text-xs px-3 py-1 rounded hover:bg-academic-blue/20 cursor-pointer border border-academic-blue/30"
                      >
                        <GraduationCap className="w-3 h-3" />
                        {question.disciplina_nome || question.disciplina_codigo}
                      </Link>
                    )}
                    {question.tags.map((tag: string, index: number) => (
                      <Link
                        key={index}
                        to={forumTagPath(tag)}
                        className="bg-cyan-50 text-cyan-700 text-xs px-3 py-1 rounded hover:bg-cyan-100 cursor-pointer border border-cyan-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>

                  {/* Actions & Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-academic-blue transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                      </button>
                      {isLoggedIn && (
                        <button
                          onClick={handleToggleSubscribe}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            question.is_subscribed
                              ? "text-academic-blue"
                              : "text-gray-600 hover:text-academic-blue"
                          }`}
                          title={question.is_subscribed ? "Você recebe notificações desta pergunta" : "Receber notificações de novas respostas"}
                        >
                          <Bell className={`w-4 h-4 ${question.is_subscribed ? "fill-academic-blue" : ""}`} />
                          {question.is_subscribed ? "Seguindo" : "Seguir"}
                        </button>
                      )}
                      {isQuestionAuthor && (
                        <button
                          onClick={openEditQuestion}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-academic-blue transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => openReport("question", question.id)}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        Denunciar
                      </button>
                      {canDeleteQuestion && (
                        <button
                          onClick={handleDeleteQuestion}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                          title={isAdmin && !isQuestionAuthor ? "Excluir como admin" : "Excluir pergunta"}
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          <button
                            onClick={handleToggleClose}
                            disabled={moderating}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-academic-blue transition-colors disabled:opacity-50"
                          >
                            {question.is_closed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            {question.is_closed ? "Reabrir" : "Fechar"}
                          </button>
                          <button
                            onClick={handleTogglePin}
                            disabled={moderating}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-academic-blue transition-colors disabled:opacity-50"
                          >
                            <Pin className="w-4 h-4" />
                            {question.is_pinned ? "Desafixar" : "Fixar"}
                          </button>
                        </>
                      )}
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
                      <div className="w-10 h-10 bg-academic-blue rounded-full flex items-center justify-center text-white font-bold">
                      </div>
                    </div>
                  </div>

                  <CommentSection
                    targetType="question"
                    targetId={question.id}
                    comments={question.comments || []}
                    isLoggedIn={isLoggedIn}
                    currentUserId={currentUser?.id}
                    isAdmin={isAdmin}
                    onChanged={reloadQuestion}
                  />
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
                  const isAnswerAuthor = !!currentUser && currentUser.id === answer.user_id;
                  const canDeleteAnswer = isAnswerAuthor || isAdmin;
                  
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
                              ? "bg-academic-blue text-white"
                              : "hover:bg-gray-100 text-gray-600"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <span className="text-xl font-bold text-gray-900">
                          {answer.vote_count}
                        </span>
                        {(isQuestionAuthor || isAdmin) && !answer.is_accepted && (
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
                        {editingAnswerId === answer.id ? (
                          <div className="mb-4">
                            <textarea
                              value={editAnswerContent}
                              onChange={(e) => setEditAnswerContent(e.target.value)}
                              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-academic-blue"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={handleSaveAnswerEdit}
                                disabled={editSubmitting}
                                className="text-sm bg-academic-blue hover:bg-cyan-600 disabled:bg-gray-300 text-white px-4 py-1.5 rounded-md flex items-center gap-1"
                              >
                                {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingAnswerId(null)}
                                className="text-sm text-gray-600 px-4 py-1.5 rounded-md hover:bg-gray-100"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <MarkdownContent content={answer.content} className="mb-4" />
                        )}

                        <div className="flex items-center justify-between pt-3">
                          <div className="flex gap-3">
                            {isAnswerAuthor && (
                              <button
                                onClick={() => openEditAnswer(answer)}
                                className="text-sm text-gray-600 hover:text-academic-blue transition-colors"
                              >
                                Editar
                              </button>
                            )}
                            {canDeleteAnswer && (
                              <button
                                onClick={() => handleDeleteAnswer(answer.id)}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                                title={isAdmin && !isAnswerAuthor ? "Excluir como admin" : "Excluir resposta"}
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            )}
                            {isLoggedIn && !isAnswerAuthor && (
                              <button
                                onClick={() => openReport("answer", answer.id)}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                              >
                                <Flag className="w-4 h-4" />
                                Denunciar
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

                        <CommentSection
                          targetType="answer"
                          targetId={answer.id}
                          comments={answer.comments || []}
                          isLoggedIn={isLoggedIn}
                          currentUserId={currentUser?.id}
                          isAdmin={isAdmin}
                          onChanged={reloadQuestion}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Pergunta fechada: bloqueia novas respostas */}
            {question.is_closed && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 flex items-center gap-3 text-gray-700">
                <Lock className="w-5 h-5 text-gray-500" />
                <span>Esta pergunta foi fechada e não aceita novas respostas.</span>
              </div>
            )}

            {/* Your Answer */}
            {isLoggedIn && !question.is_closed && (
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
                      className="w-4 h-4 text-academic-blue border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
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
                      className="bg-academic-blue hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? "Enviando..." : "Enviar Resposta"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoggedIn && !question.is_closed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-gray-700 mb-4">
                  Você precisa estar logado para responder perguntas
                </p>
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-block bg-academic-blue hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
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

      {/* Modal de edição de pergunta */}
      {editingQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !editSubmitting && setEditingQuestion(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-academic-blue" />
                Editar pergunta
              </h3>
              <button
                onClick={() => setEditingQuestion(false)}
                disabled={editSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={editSubmitting}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-academic-blue"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={editSubmitting}
              className="w-full min-h-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-academic-blue"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingQuestion(false)}
                disabled={editSubmitting}
                className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuestionEdit}
                disabled={editSubmitting}
                className="px-4 py-2 rounded-md bg-academic-blue hover:bg-cyan-600 disabled:bg-gray-300 text-white font-medium flex items-center gap-2"
              >
                {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de denúncia */}
      {reportTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !reportSubmitting && setReportTarget(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-600" />
                Denunciar {reportTarget.type === "question" ? "pergunta" : "resposta"}
              </h3>
              <button
                onClick={() => setReportTarget(null)}
                disabled={reportSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Conte para a moderação o que há de errado com este conteúdo.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Motivo da denúncia (mínimo 5 caracteres)..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              disabled={reportSubmitting}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setReportTarget(null)}
                disabled={reportSubmitting}
                className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={reportSubmitting || reportReason.trim().length < 5}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium flex items-center gap-2"
              >
                {reportSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar denúncia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;
