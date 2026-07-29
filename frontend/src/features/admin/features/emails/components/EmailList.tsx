/**
 * Lista de conversas da pasta ativa (coluna do meio, estilo Gmail): remetente,
 * assunto, preview e data; nao lida em negrito com a borda azul padrao do admin.
 * Usado em: EmailsInbox. Estilo de linha espelha o QuestionCard do forum.
 */
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmailThreadSummary } from "../types/email";
import { displayName, formatEmailDate } from "../utils";

interface Props {
  threads: EmailThreadSummary[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  onSelect: (threadId: string) => void;
  onPageChange: (page: number) => void;
}

export default function EmailList({
  threads,
  selectedId,
  loading,
  error,
  page,
  totalPages,
  onSelect,
  onPageChange,
}: Props) {
  if (loading) return <div className="text-center py-8 text-gray-500">Carregando emails...</div>;
  if (error) return <div className="text-center py-8 text-cm-red">{error}</div>;
  if (!threads.length)
    return <div className="text-center py-8 text-gray-500">Nenhuma conversa nesta pasta.</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {threads.map((t) => {
          const unread = t.unread_count > 0;
          const selected = t.thread_id === selectedId;
          return (
            <button
              key={t.thread_id}
              onClick={() => onSelect(t.thread_id)}
              className={`text-left p-3 rounded-md border transition-colors ${
                selected
                  ? "primary-border border-2 bg-gray-50"
                  : unread
                    ? "bg-cm-blue/5 border-l-4 border-cm-blue border-gray-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-sm truncate ${unread ? "font-bold" : "font-medium"}`}>
                  {displayName(t)}
                </span>
                <span className="text-xs text-gray-500 shrink-0">{formatEmailDate(t.last_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                {t.has_attachments ? <Paperclip className="w-3 h-3 text-gray-400 shrink-0" /> : null}
                <span className={`text-sm truncate ${unread ? "font-semibold" : "text-gray-700"}`}>
                  {t.subject || "(sem assunto)"}
                </span>
                {t.message_count > 1 && (
                  <span className="text-xs text-gray-400 shrink-0">({t.message_count})</span>
                )}
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-0">{t.preview}</p>
            </button>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t mt-2">
          <Button variant="ghost" size="xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Anterior
          </Button>
          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="xs"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
