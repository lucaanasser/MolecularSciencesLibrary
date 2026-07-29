/**
 * Painel de leitura da conversa (coluna direita, estilo Gmail): mensagens recebidas
 * e enviadas intercaladas, aviso de quarentena, anexos (so nomes) e resposta inline.
 * Usado em: EmailsInbox.
 */
import { Archive, ArchiveRestore, MailX, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmailMessage } from "../types/email";
import { attachmentNames, formatEmailDate, messageBody } from "../utils";
import EmailComposer from "./EmailComposer";

interface Props {
  messages: EmailMessage[];
  loading: boolean;
  error: string | null;
  archived: boolean;
  sending: boolean;
  onReply: (message: string) => Promise<void>;
  onArchiveToggle: () => void;
  onMarkUnread: () => void;
  onDelete: () => void;
}

export default function EmailThread({
  messages,
  loading,
  error,
  archived,
  sending,
  onReply,
  onArchiveToggle,
  onMarkUnread,
  onDelete,
}: Props) {
  if (loading) return <div className="text-center py-8 text-gray-500">Abrindo conversa...</div>;
  if (error) return <div className="text-center py-8 text-cm-red">{error}</div>;
  if (!messages.length) return null;

  const subject = messages[0].subject || "(sem assunto)";
  const hasInbound = messages.some((m) => m.direction === "in");
  const suspect = messages.some((m) => m.direction === "in" && m.auth_verdict === "suspect");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 pb-2 border-b">
        <h4 className="text-lg font-semibold mb-0 min-w-0 truncate">{subject}</h4>
        <div className="flex gap-1 shrink-0">
          {hasInbound && (
            <>
              <Button variant="ghost" size="icon" title={archived ? "Desarquivar" : "Arquivar"} onClick={onArchiveToggle}>
                {archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" title="Marcar como não lida" onClick={onMarkUnread}>
                <MailX className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" title="Excluir conversa" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-cm-red" />
          </Button>
        </div>
      </div>

      {suspect && (
        <div className="mt-2 px-3 py-2 rounded-md bg-cm-yellow/10 border border-cm-yellow text-sm text-gray-700">
          Esta conversa falhou na verificação de autenticidade (SPF/DKIM/DMARC). Cuidado com links e pedidos.
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-3">
        {messages.map((m) => {
          const names = attachmentNames(m);
          return (
            <div
              key={m.id}
              className={`p-3 rounded-md border ${
                m.direction === "out" ? "bg-cm-blue/5 border-cm-blue/30 ml-8" : "bg-white border-gray-200 mr-8"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-sm font-semibold truncate">
                  {m.direction === "out" ? "Biblioteca CM (você)" : m.from_name || m.from_address}
                </span>
                <span className="text-xs text-gray-500 shrink-0">{formatEmailDate(m.created_at)}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {m.direction === "out" ? `para ${m.to_address}` : m.from_address}
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">{messageBody(m)}</div>
              {names.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <Paperclip className="w-3 h-3" />
                  {names.join(", ")} — anexos não são armazenados; peça reenvio se precisar do arquivo.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasInbound && (
        <div className="pt-2 border-t">
          <EmailComposer mode="reply" sending={sending} onSend={({ message }) => onReply(message)} />
        </div>
      )}
    </div>
  );
}
