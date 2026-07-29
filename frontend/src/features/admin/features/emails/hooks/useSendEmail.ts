/**
 * Hook de envio: responder uma thread ou escrever mensagem nova (ambas saem de contato@).
 * Usado em: EmailsInbox/EmailComposer. Depende de: EmailsService.reply/compose.
 */
import { useState } from "react";
import { logger } from "@/utils/logger";
import { EmailsService } from "@/services/EmailsService";

export function useSendEmail() {
  const [sending, setSending] = useState(false);

  /* Responde a ultima mensagem recebida da thread. Lanca em falha (chamador trata o toast). */
  const reply = async (threadId: string, message: string) => {
    setSending(true);
    try {
      await EmailsService.reply(threadId, message);
    } catch (err) {
      logger.error("🔴 [useSendEmail] Erro ao responder", err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  /* Envia mensagem nova (destinatario unico ou broadcast). Lanca em falha. */
  const compose = async (payload: {
    to?: string;
    subject: string;
    message: string;
    sender: "contato" | "avisos";
    broadcast?: boolean;
  }) => {
    setSending(true);
    try {
      return await EmailsService.compose(payload);
    } catch (err) {
      logger.error("🔴 [useSendEmail] Erro ao enviar mensagem nova", err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return { reply, compose, sending };
}
