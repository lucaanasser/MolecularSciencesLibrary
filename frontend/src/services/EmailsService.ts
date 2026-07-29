/**
 * Servico da caixa de contato@ (inbox de email do painel admin).
 * Fronteira: chamadas HTTP a /api/email (worker/src/routes/email.ts); sem estado local.
 * Cores de log: 🔵 inicio, 🟢 sucesso, 🟡 aviso, 🔴 erro.
 */
import { logger } from "@/utils/logger";
import { fetchJson } from "@/utils/fetchJson";
import type {
  EmailFolder,
  EmailMessage,
  EmailThreadsResponse,
} from "@/features/admin/features/emails/types/email";

const API_BASE = "/api/email";

export const EmailsService = {
  /* Lista threads de uma pasta com paginacao e contadores.
   * Usada em: useEmailThreads. */
  listThreads: async (folder: EmailFolder, page = 1, limit = 20): Promise<EmailThreadsResponse> => {
    logger.log("🔵 [EmailsService] Listando threads:", folder, page);
    const data = await fetchJson(`${API_BASE}/threads?folder=${folder}&page=${page}&limit=${limit}`);
    logger.log("🟢 [EmailsService] Threads carregadas:", data.threads?.length);
    return data;
  },

  /* Busca as mensagens de uma thread (abrir marca recebidas como lidas no backend).
   * Usada em: useEmailThread. */
  getThread: async (threadId: string): Promise<EmailMessage[]> => {
    logger.log("🔵 [EmailsService] Abrindo thread:", threadId);
    const data = await fetchJson(`${API_BASE}/threads/${encodeURIComponent(threadId)}`);
    logger.log("🟢 [EmailsService] Thread aberta:", data.length, "mensagens");
    return data;
  },

  /* Responde a ultima mensagem recebida da thread (sai de contato@).
   * Usada em: useSendEmail. */
  reply: async (threadId: string, message: string): Promise<void> => {
    logger.log("🔵 [EmailsService] Respondendo thread:", threadId);
    await fetchJson(`${API_BASE}/threads/${encodeURIComponent(threadId)}/reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    logger.log("🟢 [EmailsService] Resposta enviada");
  },

  /* Envia mensagem nova (abre thread propria).
   * Usada em: useSendEmail. */
  compose: async (to: string, subject: string, message: string): Promise<void> => {
    logger.log("🔵 [EmailsService] Enviando mensagem nova para:", to);
    await fetchJson(`${API_BASE}/threads`, {
      method: "POST",
      body: JSON.stringify({ to, subject, message }),
    });
    logger.log("🟢 [EmailsService] Mensagem enviada");
  },

  /* Muda o status das mensagens recebidas da thread (read | unread | archived).
   * Usada em: EmailsInbox (acoes de arquivar/marcar nao lida). */
  setStatus: async (threadId: string, status: "unread" | "read" | "archived"): Promise<void> => {
    logger.log("🔵 [EmailsService] Mudando status da thread:", threadId, status);
    await fetchJson(`${API_BASE}/threads/${encodeURIComponent(threadId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    logger.log("🟢 [EmailsService] Status atualizado");
  },

  /* Apaga a thread inteira.
   * Usada em: EmailsInbox (acao de excluir). */
  remove: async (threadId: string): Promise<void> => {
    logger.log("🔵 [EmailsService] Excluindo thread:", threadId);
    await fetchJson(`${API_BASE}/threads/${encodeURIComponent(threadId)}`, { method: "DELETE" });
    logger.log("🟢 [EmailsService] Thread excluida");
  },
};
