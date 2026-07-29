/**
 * Composicao de mensagens novas do painel admin (aba Emails).
 * Dois remetentes com papeis distintos:
 * - contato@ → conversacional: HTML simples de email humano, reply_to contato@,
 *   resposta volta para a inbox do painel.
 * - avisos@  → comunicado: template automatico da biblioteca ("nao responda"),
 *   sem reply_to; resposta acidental da bounce (avisos@ nao tem caixa).
 * Broadcast envia para todos os usuarios (exceto proaluno) via /emails/batch do
 * Resend (1 request por lote de 100 — evita o rate limit do envio unitario) e
 * grava UMA linha 'out' na thread para o historico de Enviados.
 * Usado por: routes/email.ts (POST /threads e /reply).
 */
import { all } from '../db';
import { sendEmail, generateEmailTemplate, CONTACT_EMAIL } from './email';
import { escapeHtml } from './emailInbox';
import { insertOutgoing } from './emailThreads';
import type { Env } from '../index';

export type ComposeSender = 'contato' | 'avisos';

export const CONTACT_FROM = `Biblioteca CM <${CONTACT_EMAIL}>`;
const AVISOS_FROM = 'Biblioteca CM <avisos@bibliotecamoleculares.com>';

/**
 * Message-ID proprio para a linha 'out'. O Resend gera o Message-ID real do envio e
 * nao o expoe; a continuidade da thread vem do header References (ver emailInbox.ts).
 */
export const newMessageId = () => `<painel-${crypto.randomUUID()}@bibliotecamoleculares.com>`;

/** Corpo de email humano (contato@): paragrafos simples + assinatura. */
export function humanHtml(message: string): string {
  return `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    <p style="color: #666;">— Biblioteca Ciencias Moleculares<br>${CONTACT_EMAIL}</p>
  </div>`;
}

/** Corpo por remetente: avisos@ usa o template automatico da biblioteca. */
function bodyFor(sender: ComposeSender, subject: string, message: string): string {
  if (sender === 'avisos') {
    const content = `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`;
    return generateEmailTemplate({ subject, content, isAutomatic: true });
  }
  return humanHtml(message);
}

/**
 * O que faz: envia mensagem nova para UM destinatario e grava a thread 'out'.
 * Onde e usada: POST /api/email/threads (routes/email.ts).
 * Dependencias chamadas: sendEmail, insertOutgoing.
 * Efeitos colaterais: envio via Resend + INSERT em email_messages.
 */
export async function sendComposed(
  env: Env,
  data: { sender: ComposeSender; to: string; subject: string; message: string; sentByUserId: number }
): Promise<string | null> {
  const html = bodyFor(data.sender, data.subject, data.message);
  const ok = await sendEmail(env, {
    to: data.to,
    subject: data.subject,
    html,
    ...(data.sender === 'contato' ? { from: CONTACT_FROM, replyTo: CONTACT_EMAIL } : {})
  });
  if (!ok) return null;
  const messageId = newMessageId();
  await insertOutgoing(env, {
    threadId: messageId,
    messageId,
    to: data.to,
    subject: data.subject,
    bodyText: data.message,
    bodyHtml: html,
    sentByUserId: data.sentByUserId
  });
  return messageId;
}

/**
 * O que faz: envia comunicado para TODOS os usuarios (exceto kiosk proaluno) em
 * lotes de 100 via batch do Resend, e grava uma unica thread 'out' de registro.
 * Onde e usada: POST /api/email/threads com broadcast=true (routes/email.ts).
 * Dependencias chamadas: db.all, fetch (Resend batch), insertOutgoing.
 * Efeitos colaterais: envio em massa + INSERT em email_messages.
 */
export async function sendBroadcast(
  env: Env,
  data: { sender: ComposeSender; subject: string; message: string; sentByUserId: number }
): Promise<{ total: number; sent: number } | null> {
  const rows = await all<{ email: string }>(
    env.DB,
    "SELECT DISTINCT email FROM users WHERE email IS NOT NULL AND TRIM(email) != '' AND role != 'proaluno'"
  );
  const recipients = rows.map((r) => r.email);
  if (!recipients.length) return { total: 0, sent: 0 };
  if (!env.RESEND_API_KEY) {
    console.log('🟡 [stub-email] RESEND_API_KEY ausente — broadcast não enviado:', data.subject);
    return null;
  }

  const html = bodyFor(data.sender, data.subject, data.message);
  const from = data.sender === 'contato' ? CONTACT_FROM : AVISOS_FROM;
  let sent = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const batch = recipients.slice(i, i + 100).map((to) => ({
      from,
      to,
      subject: data.subject,
      html,
      ...(data.sender === 'contato' ? { reply_to: CONTACT_EMAIL } : {})
    }));
    try {
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batch)
      });
      if (r.ok) sent += batch.length;
      else console.log('🔴 [emailCompose] lote de broadcast falhou', r.status, await r.text());
    } catch (error) {
      console.log('🔴 [emailCompose] lote de broadcast falhou', (error as Error).message);
    }
  }
  if (!sent) return null;

  const messageId = newMessageId();
  await insertOutgoing(env, {
    threadId: messageId,
    messageId,
    to: `Todos os usuários (${sent})`,
    subject: data.subject,
    bodyText: data.message,
    bodyHtml: html,
    sentByUserId: data.sentByUserId
  });
  console.log('🟢 [emailCompose] broadcast enviado |', sent, 'de', recipients.length);
  return { total: recipients.length, sent };
}
