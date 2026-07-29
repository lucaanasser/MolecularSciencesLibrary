import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, HelpCircle, Plus } from "lucide-react";
import * as ForumService from "@/services/ForumService";
import { forumNewForDisciplinePath } from "@/constants/navigation";
import { logger } from "@/utils/logger";
import QuestionCard from "./QuestionCard";

interface DisciplineForumTabProps {
  codigo: string;
  /** Reporta a quantidade de perguntas para o badge da aba. */
  onCountChange?: (count: number) => void;
}

/**
 * Aba "Fórum" da página de disciplina: lista as perguntas do fórum
 * vinculadas àquela disciplina e oferece atalho para perguntar.
 */
const DisciplineForumTab: React.FC<DisciplineForumTabProps> = ({ codigo, onCountChange }) => {
  const [questions, setQuestions] = useState<ForumService.Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    ForumService.getQuestions({ disciplina: codigo, limit: 50, sortBy: "recente" })
      .then((data) => {
        if (!active) return;
        setQuestions(data.questions);
        onCountChange?.(data.questions.length);
      })
      .catch((err) => {
        logger.error("Erro ao carregar perguntas da disciplina:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [codigo, onCountChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-600">
          Perguntas do fórum sobre esta disciplina
        </p>
        <Link
          to={forumNewForDisciplinePath(codigo)}
          className="inline-flex items-center gap-1 bg-academic-blue hover:bg-cyan-600 text-white text-sm px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Fazer pergunta
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-academic-blue" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <div className="w-14 h-14 bg-academic-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-7 h-7 text-academic-blue" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Nenhuma pergunta ainda
          </h3>
          <p className="text-gray-600">
            Seja o primeiro a perguntar algo sobre esta disciplina.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DisciplineForumTab;
