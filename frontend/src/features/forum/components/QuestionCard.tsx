import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Eye, ThumbsUp, Award } from "lucide-react";
import { motion } from "framer-motion";

export interface Question {
  id: number;
  titulo: string;
  conteudo: string;
  autor: string;
  autorId: number;
  views: number;
  respostas: number;
  votos: number;
  tags: string[];
  temResposta: boolean;
  dataCriacao: string;
}

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-md hover:border-cm-academic/40 transition-colors p-4"
    >
      <div className="flex gap-4">
        {/* Stats Column */}
        <div className="flex flex-col gap-2 min-w-[100px] text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-medium">{question.votos}</span>
            <span className="text-xs">votos</span>
          </div>
          <div
            className={`flex items-center gap-1 ${
              question.temResposta
                ? "text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1"
                : ""
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">{question.respostas}</span>
            <span className="text-xs">
              {question.temResposta ? "✓" : "respostas"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span className="text-xs">{question.views} views</span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1">
          <Link to={`/forum/${question.id}`}>
            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 mb-2">
              {question.titulo}
            </h3>
          </Link>
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {question.conteudo}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded hover:bg-cyan-100 cursor-pointer border border-cyan-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Author & Date */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <Link
              to={`/profile/${question.autorId}`}
              className="flex items-center gap-1 hover:text-cm-academic"
            >
              <span>por</span>
              <span className="text-blue-600 font-medium">
                {question.autor}
              </span>
            </Link>
            <span>{question.dataCriacao}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
