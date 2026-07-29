/**
 * Recebimento de email de contato@bibliotecamoleculares.com.
 * Cloudflare Email Routing entrega no export `email` do Worker (index.ts), que delega
 * para handleInboundEmail: parseia o MIME (postal-mime), classifica autenticidade pelo
 * header Authentication-Results (heuristica SPF/DKIM/DMARC, nao pontuacao de spam),
 * resolve a thread por In-Reply-To/References e grava em email_messages (D1).
 * Mensagens 'clean' disparam uma notificacao SINTETICA de avisos@ para INBOX_NOTIFY_TO
 * com remetente + assunto + preview + link do painel. De proposito ela nao encaminha o
 * original: responder a ela no Gmail cai em avisos@ (sem caixa → bounce), entao resposta
 * so sai pelo painel. Mensagens 'suspect' ficam na quarentena do painel, sem notificacao.
 * Nunca lança: falha loga 🔴 e engole (mesma convencao de services/email.ts).
 */
import PostalMime from 'postal-mime';
import { first, run } from '../db';
import { sendEmail, generateEmailTemplate } from './email';
import type { Env } from '../index';

const MAX_BODY_CHARS = 100_000; // D1 nao e lugar de blob: corpo alem disso e truncado
const PREVIEW_CHARS = 200;

/** Escapa HTML de conteudo vindo de fora antes de interpolar em template proprio. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Veredito de autenticidade a partir do Authentication-Results injetado pelo Cloudflare.
 * 'clean' se dmarc=pass, ou se spf=pass E dkim=pass; qualquer outra coisa e 'suspect'.
 */
function authVerdict(headers: Headers): 'clean' | 'suspect' {
  const results = (headers.get('authentication-results') || '').toLowerCase();
  if (results.includes('dmarc=pass')) return 'clean';
  if (results.includes('spf=pass') && results.includes('dkim=pass')) return 'clean';
  return 'suspect';
}

/** Preview de ~200 chars a partir do texto plano (ou do HTML sem tags, como fallback). */
function buildPreview(text?: string, html?: string): string {
  const source = text && text.trim() ? text : (html || '').replace(/<[^>]+>/g, ' ');
  return source.replace(/\s+/g, ' ').trim().slice(0, PREVIEW_CHARS);
}

/**
 * Resolve a thread de uma mensagem recebida: se In-Reply-To ou algum id do References
 * casar com um message_id (ou thread_id) ja gravado, a mensagem herda aquela thread.
 * O References cobre o caso de resposta a email enviado pelo painel, cujo Message-ID
 * real e gerado pelo Resend e nao e conhecido por nos.
 */
async function resolveThreadId(
  env: Env,
  inReplyTo?: string,
  references?: string
): Promise<string | null> {
  const candidates = [inReplyTo, ...((references || '').match(/<[^>]+>/g) ?? [])]
    .filter((v): v is string => Boolean(v))
    .slice(0, 10);
  for (const candidate of candidates) {
    const row = await first<{ thread_id: string }>(
      env.DB,
      'SELECT thread_id FROM email_messages WHERE message_id = ? OR thread_id = ? LIMIT 1',
      [candidate, candidate]
    );
    if (row) return row.thread_id;
  }
  return null;
}

/** Notificacao sintetica de mensagem nova para o Gmail do admin (INBOX_NOTIFY_TO). */
async function notifyNewMessage(
  env: Env,
  data: { fromAddress: string; fromName: string | null; subject: string; preview: string; threadId: string }
): Promise<void> {
  if (!env.INBOX_NOTIFY_TO) {
    console.log('🟡 [emailInbox] INBOX_NOTIFY_TO ausente — notificacao de inbox nao enviada');
    return;
  }
  const base = env.FRONTEND_URL || 'https://bibliotecamoleculares.com';
  const panelUrl = `${base}/admin?tab=emails&thread=${encodeURIComponent(data.threadId)}`;
  const from = data.fromName ? `${data.fromName} <${data.fromAddress}>` : data.fromAddress;
  const content = `
    <p><b>De:</b> ${escapeHtml(from)}</p>
    <p><b>Assunto:</b> ${escapeHtml(data.subject || '(sem assunto)')}</p>
    <p style="color:#555; border-left: 3px solid #b657b3; padding-left: 12px;">${escapeHtml(data.preview) || '(sem conteudo)'}</p>
    <p style="text-align:center; margin: 24px 0;">
      <a href="${panelUrl}" style="background: #b657b3; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Responder no painel</a>
    </p>
    <p style="font-size: 13px; color: #666;">Respostas a este aviso nao sao recebidas — use o painel.</p>
  `;
  const subject = `Nova mensagem no contato@ — ${data.subject || '(sem assunto)'}`;
  await sendEmail(env, {
    to: env.INBOX_NOTIFY_TO,
    subject,
    html: generateEmailTemplate({ subject: 'Nova mensagem no contato@', content, isAutomatic: true })
  });
}

/**
 * O que faz: processa um email recebido pelo Email Routing e o grava na inbox do painel.
 * Onde e usada: export `email` de worker/src/index.ts.
 * Dependencias chamadas: PostalMime.parse, db.first/run, sendEmail (notificacao).
 * Efeitos colaterais: INSERT em email_messages; envio de notificacao via Resend.
 */
export async function handleInboundEmail(message: ForwardableEmailMessage, env: Env): Promise<void> {
  try {
    console.log('🔵 [emailInbox] email recebido de', message.from);
    const parsed = await PostalMime.parse(message.raw);
    const verdict = authVerdict(message.headers);
    const messageId =
      parsed.messageId || `<recebido-${crypto.randomUUID()}@bibliotecamoleculares.com>`;
    const threadId =
      (await resolveThreadId(env, parsed.inReplyTo, parsed.references)) || messageId;
    const fromAddress = parsed.from?.address || message.from;
    const fromName = parsed.from?.name || null;
    const subject = parsed.subject || '';
    const preview = buildPreview(parsed.text, parsed.html);
    const attachmentNames = (parsed.attachments || [])
      .map((a) => a.filename)
      .filter((v): v is string => Boolean(v));

    await run(
      env.DB,
      `INSERT INTO email_messages
         (thread_id, direction, message_id, in_reply_to, from_address, from_name, to_address,
          subject, body_text, body_html, preview, auth_verdict, has_attachments, attachment_names, status)
       VALUES (?, 'in', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unread')`,
      [
        threadId,
        messageId,
        parsed.inReplyTo || null,
        fromAddress,
        fromName,
        message.to,
        subject,
        (parsed.text || '').slice(0, MAX_BODY_CHARS),
        (parsed.html || '').slice(0, MAX_BODY_CHARS),
        preview,
        verdict,
        attachmentNames.length ? 1 : 0,
        attachmentNames.length ? JSON.stringify(attachmentNames) : null
      ]
    );

    if (verdict === 'clean') {
      await notifyNewMessage(env, { fromAddress, fromName, subject, preview, threadId });
      console.log('🟢 [emailInbox] mensagem gravada e notificada | thread', threadId);
    } else {
      console.log('🟡 [emailInbox] mensagem suspeita em quarentena, sem notificacao |', fromAddress);
    }
  } catch (error) {
    // Convencao do projeto: email nunca quebra o fluxo. Sem setReject — bounce por bug
    // nosso puniria o remetente; a mensagem some do nosso lado mas fica logada.
    console.log('🔴 [emailInbox] falha ao processar email recebido', (error as Error).message);
  }
}
