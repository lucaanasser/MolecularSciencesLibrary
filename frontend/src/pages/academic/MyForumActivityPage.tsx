import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import * as ForumService from "@/services/ForumService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROUTES, forumQuestionPath } from "@/constants/navigation";
import QuestionCard from "@/features/forum/components/QuestionCard";
import { logger } from "@/utils/logger";
import { toast } from "sonner";

const MyForumActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const isLoggedIn = !!localStorage.getItem("token");

  const [tab, setTab] = useState<"perguntas" | "respostas" | "salvos">("perguntas");
  const [questions, setQuestions] = useState<ForumService.Question[]>([]);
  const [answers, setAnswers] = useState<ForumService.UserAnswer[]>([]);
  const [bookmarks, setBookmarks] = useState<ForumService.Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado");
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!currentUser) return;

    let active = true;
    setLoading(true);
    Promise.all([
      ForumService.getQuestions({ autor: currentUser.id, limit: 100 }),
      ForumService.getUserAnswers(currentUser.id),
      ForumService.getBookmarks(),
    ])
      .then(([q, a, b]) => {
        if (!active) return;
        setQuestions(q.questions);
        setAnswers(a);
        setBookmarks(b);
      })
      .catch((err) => logger.error("Erro ao carregar meu conteúdo:", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser, isLoggedIn, navigate]);

  const tabButton = (id: "perguntas" | "respostas" | "salvos", label: string, count: number) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
        tab === id
          ? "bg-academic-blue text-white border-academic-blue"
          : "bg-white text-gray-600 border-gray-200 hover:border-academic-blue/40"
      }`}
    >
      {label} <span className="opacity-80">({count})</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(ROUTES.FORUM)}
            className="flex items-center gap-2 text-gray-600 hover:text-academic-blue mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o fórum
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Meu conteúdo</h1>
          <div className="flex gap-2">
            {tabButton("perguntas", "Minhas perguntas", questions.length)}
            {tabButton("respostas", "Minhas respostas", answers.length)}
            {tabButton("salvos", "Salvos", bookmarks.length)}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-academic-blue" />
          </div>
        ) : tab === "respostas" ? (
          answers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
              Você ainda não respondeu nenhuma pergunta.
            </div>
          ) : (
          <div className="space-y-3">
            {answers.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-md p-4 hover:border-academic-blue/40 transition-colors"
              >
                <Link
                  to={forumQuestionPath(a.question_id)}
                  className="text-academic-blue font-medium hover:underline"
                >
                  {a.question_title}
                </Link>
                <p className="text-gray-700 text-sm mt-1 line-clamp-2">{a.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {a.vote_count}
                  </span>
                  {a.is_accepted && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Aceita
                    </span>
                  )}
                  <span>{ForumService.formatRelativeDate(a.created_at)}</span>
                </div>
              </motion.div>
            ))}
          </div>
          )
        ) : (
          (() => {
            const list = tab === "perguntas" ? questions : bookmarks;
            const emptyMsg =
              tab === "perguntas"
                ? "Você ainda não fez nenhuma pergunta."
                : "Você ainda não salvou nenhuma pergunta.";
            return list.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
                {emptyMsg}
              </div>
            ) : (
              <div className="space-y-3">
                {list.map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default MyForumActivityPage;
