import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Eye, ThumbsUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import * as ForumService from "@/services/ForumService";

export interface Question {
  id: number;
  title: string;
  content: string;
  user_id: number;
  user_name: string;
  user_image?: string | null;
  is_anonymous?: number;
  view_count: number;
  answer_count: number;
  vote_count: number;
  tags: string[];
  has_accepted_answer: boolean;
  created_at: string;
}

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-md hover:border-academic-blue/40 transition-colors p-4"
    >
      <div className="flex gap-4">
        {/* Stats Column */}
        <div className="flex flex-col gap-2 min-w-[100px] text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-medium">{question.vote_count}</span>
            <span className="text-xs">votos</span>
          </div>
          <div
            className={`flex items-center gap-1 ${
              question.has_accepted_answer
                ? "text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1"
                : ""
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">{question.answer_count}</span>
            <span className="text-xs">
              {question.has_accepted_answer ? "✓" : "respostas"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span className="text-xs">{question.view_count} views</span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1">
          <Link to={`/forum/${question.id}`}>
            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 mb-2">
              {question.title}
            </h3>
          </Link>
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {question.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {question.tags.map((tag, index) => (
              <Link
                key={index}
                to={`/forum?tag=${tag}`}
                className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded hover:bg-cyan-100 cursor-pointer border border-cyan-200"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Author & Date */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>por</span>
              <span className="text-blue-600 font-medium">
                {question.user_name}
              </span>
            </div>
            <span>{ForumService.formatRelativeDate(question.created_at)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
