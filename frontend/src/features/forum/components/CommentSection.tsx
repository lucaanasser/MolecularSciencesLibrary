import React, { useState } from "react";
import { Trash2, Loader2, MessageCircle } from "lucide-react";
import * as ForumService from "@/services/ForumService";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface CommentSectionProps {
  targetType: ForumService.ReportTargetType; // "question" | "answer"
  targetId: number;
  comments: ForumService.Comment[];
  isLoggedIn: boolean;
  currentUserId?: number;
  isAdmin: boolean;
  /** Recarrega a pergunta (a lista de comentários vem do payload do detalhe). */
  onChanged: () => void;
}

/**
 * Lista e formulário de comentários curtos sob uma pergunta ou resposta.
 */
const CommentSection: React.FC<CommentSectionProps> = ({
  targetType,
  targetId,
  comments,
  isLoggedIn,
  currentUserId,
  isAdmin,
  onChanged,
}) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleAdd = async () => {
    if (text.trim().length < 2) {
      toast.error("Comentário muito curto");
      return;
    }
    setSubmitting(true);
    try {
      await ForumService.createComment(targetType, targetId, text.trim());
      setText("");
      setShowInput(false);
      onChanged();
    } catch (err: any) {
      logger.error("Erro ao comentar:", err);
      toast.error(err.message || "Erro ao comentar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm("Remover este comentário?")) return;
    try {
      await ForumService.deleteComment(commentId);
      onChanged();
    } catch (err: any) {
      logger.error("Erro ao remover comentário:", err);
      toast.error(err.message || "Erro ao remover comentário");
    }
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      {comments.length > 0 && (
        <ul className="space-y-1 mb-2">
          {comments.map((c) => {
            const canDelete = isAdmin || currentUserId === c.user_id;
            return (
              <li key={c.id} className="text-sm text-gray-700 flex items-start gap-2 group">
                <span className="flex-1">
                  {c.content}
                  <span className="text-xs text-gray-400 ml-2">
                    — {c.user_name}, {ForumService.formatRelativeDate(c.created_at)}
                  </span>
                </span>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-600 transition"
                    title="Remover comentário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isLoggedIn &&
        (showInput ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Adicionar um comentário..."
              autoFocus
              disabled={submitting}
              className="flex-1 text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-academic-blue"
            />
            <button
              onClick={handleAdd}
              disabled={submitting || text.trim().length < 2}
              className="text-sm bg-academic-blue hover:bg-cyan-600 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-md flex items-center gap-1"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Enviar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-academic-blue transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Comentar
          </button>
        ))}
    </div>
  );
};

export default CommentSection;
