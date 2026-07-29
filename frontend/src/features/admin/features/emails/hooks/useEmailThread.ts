/**
 * Hook das mensagens de uma thread aberta. Abrir a thread marca as recebidas
 * como lidas no backend (GET /threads/:id), como no Gmail.
 * Usado em: EmailsInbox/EmailThread. Depende de: EmailsService.getThread.
 */
import { useCallback, useEffect, useState } from "react";
import { logger } from "@/utils/logger";
import { EmailsService } from "@/services/EmailsService";
import type { EmailMessage } from "../types/email";

export function useEmailThread(threadId: string | null) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setMessages(await EmailsService.getThread(threadId));
    } catch (err) {
      logger.error("🔴 [useEmailThread] Erro ao abrir thread", err);
      setError(err instanceof Error ? err.message : "Erro ao abrir a conversa");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  return { messages, loading, error, refetch: fetchThread };
}
