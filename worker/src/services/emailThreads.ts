/**
 * Camada de dados da inbox de contato@ (tabela email_messages, agrupada por thread_id).
 * Usada por routes/email.ts. Fronteira: so persistencia/consulta — envio fica em
 * services/email.ts e recebimento em services/emailInbox.ts.
 * Pastas sao derivadas (nao ha coluna folder): inbox = tem recebida 'clean' nao arquivada;
 * quarantine = so recebidas 'suspect'; archived = recebidas arquivadas; sent = tem enviada.
 * O volume de contato e pequeno, entao os agregados de todas as threads sao lidos de uma
 * vez e a paginacao/contagem por pasta acontece em JS (uma query, sem OFFSET fragil).
 */
import { all, first, run } from '../db';
import { CONTACT_EMAIL } from './email';
import type { Env } from '../index';

export const FOLDERS = ['inbox', 'quarantine', 'archived', 'sent'] as const;
export type Folder = (typeof FOLDERS)[number];

export type EmailMessageRow = {
  id: number;
  thread_id: string;
  direction: 'in' | 'out';
  message_id: string | null;
  in_reply_to: string | null;
  from_address: string;
  from_name: string | null;
  to_address: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  preview: string | null;
  auth_verdict: 'clean' | 'suspect';
  has_attachments: number;
  attachment_names: string | null;
  status: 'unread' | 'read' | 'archived';
  sent_by_user_id: number | null;
  created_at: string;
};

type ThreadAgg = {
  thread_id: string;
  last_at: string;
  message_count: number;
  unread_count: number;
  has_in: number;
  has_clean: number;
  has_out: number;
  archived_count: number;
};

const AGG_SQL = `
  SELECT thread_id,
         MAX(created_at) AS last_at,
         COUNT(*) AS message_count,
         SUM(CASE WHEN direction = 'in' AND status = 'unread' THEN 1 ELSE 0 END) AS unread_count,
         MAX(CASE WHEN direction = 'in' THEN 1 ELSE 0 END) AS has_in,
         MAX(CASE WHEN direction = 'in' AND auth_verdict = 'clean' THEN 1 ELSE 0 END) AS has_clean,
         MAX(CASE WHEN direction = 'out' THEN 1 ELSE 0 END) AS has_out,
         SUM(CASE WHEN direction = 'in' AND status = 'archived' THEN 1 ELSE 0 END) AS archived_count
  FROM email_messages
  GROUP BY thread_id
  ORDER BY last_at DESC`;

/** Pastas as quais uma thread pertence (uma thread respondida aparece em inbox E sent, como no Gmail). */
function foldersOf(t: ThreadAgg): Folder[] {
  const folders: Folder[] = [];
  if (t.has_out) folders.push('sent');
  if (t.has_in) {
    if (t.archived_count > 0) folders.push('archived');
    else if (t.has_clean) folders.push('inbox');
    else folders.push('quarantine');
  }
  return folders;
}

/**
 * O que faz: lista threads de uma pasta com paginacao + contadores de todas as pastas.
 * Onde e usada: GET /api/email/threads (routes/email.ts).
 * Dependencias chamadas: db.all.
 * Efeitos colaterais: nenhum (leitura).
 */
export async function listThreads(env: Env, folder: Folder, page: number, limit: number) {
  const aggs = await all<ThreadAgg>(env.DB, AGG_SQL);
  const counts = { inbox: 0, quarantine: 0, archived: 0, sent: 0, unread: 0 };
  for (const t of aggs) {
    const folders = foldersOf(t);
    for (const f of folders) counts[f] += 1;
    if (folders.includes('inbox')) counts.unread += t.unread_count;
  }
  const filtered = aggs.filter((t) => foldersOf(t).includes(folder));
  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  let threads: Array<Record<string, unknown>> = [];
  if (pageItems.length) {
    // Ultima mensagem de cada thread da pagina (define assunto/remetente/preview na lista).
    const placeholders = pageItems.map(() => '?').join(',');
    const rows = await all<EmailMessageRow>(
      env.DB,
      `SELECT * FROM email_messages m
       WHERE m.thread_id IN (${placeholders})
         AND m.id = (SELECT id FROM email_messages i WHERE i.thread_id = m.thread_id
                     ORDER BY i.created_at DESC, i.id DESC LIMIT 1)`,
      pageItems.map((t) => t.thread_id)
    );
    const byThread = new Map(rows.map((r) => [r.thread_id, r]));
    threads = pageItems.map((t) => {
      const m = byThread.get(t.thread_id);
      return {
        thread_id: t.thread_id,
        last_at: t.last_at,
        message_count: t.message_count,
        unread_count: t.unread_count,
        subject: m?.subject ?? null,
        from_address: m?.from_address ?? null,
        from_name: m?.from_name ?? null,
        direction: m?.direction ?? null,
        to_address: m?.to_address ?? null,
        preview: m?.preview ?? null,
        has_attachments: m?.has_attachments ?? 0,
        auth_verdict: m?.auth_verdict ?? 'clean'
      };
    });
  }

  return {
    threads,
    counts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

/**
 * O que faz: retorna as mensagens de uma thread em ordem cronologica e marca as
 * recebidas nao lidas como lidas (abrir a conversa = ler, como no Gmail).
 * Onde e usada: GET /api/email/threads/:threadId (routes/email.ts).
 * Dependencias chamadas: db.all, db.run.
 * Efeitos colaterais: UPDATE de status unread→read.
 */
export async function getThreadMessages(env: Env, threadId: string): Promise<EmailMessageRow[] | null> {
  const rows = await all<EmailMessageRow>(
    env.DB,
    'SELECT * FROM email_messages WHERE thread_id = ? ORDER BY created_at ASC, id ASC',
    [threadId]
  );
  if (!rows.length) return null;
  await run(
    env.DB,
    "UPDATE email_messages SET status = 'read' WHERE thread_id = ? AND direction = 'in' AND status = 'unread'",
    [threadId]
  );
  return rows;
}

/**
 * O que faz: grava uma mensagem enviada pelo painel (direction='out') na thread.
 * Onde e usada: POST /api/email/threads e POST /api/email/threads/:threadId/reply.
 * Dependencias chamadas: db.run.
 * Efeitos colaterais: INSERT em email_messages.
 */
export async function insertOutgoing(
  env: Env,
  data: {
    threadId: string;
    messageId: string;
    inReplyTo?: string | null;
    to: string;
    subject: string;
    bodyText: string;
    bodyHtml: string;
    sentByUserId: number;
  }
): Promise<void> {
  await run(
    env.DB,
    `INSERT INTO email_messages
       (thread_id, direction, message_id, in_reply_to, from_address, from_name, to_address,
        subject, body_text, body_html, preview, status, sent_by_user_id)
     VALUES (?, 'out', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'read', ?)`,
    [
      data.threadId,
      data.messageId,
      data.inReplyTo ?? null,
      CONTACT_EMAIL,
      'Biblioteca CM',
      data.to,
      data.subject,
      data.bodyText,
      data.bodyHtml,
      data.bodyText.replace(/\s+/g, ' ').trim().slice(0, 200),
      data.sentByUserId
    ]
  );
}

/** Existencia de thread (para PATCH/DELETE responderem 404 correto). */
export async function threadExists(env: Env, threadId: string): Promise<boolean> {
  const row = await first<{ ok: number }>(
    env.DB,
    'SELECT 1 AS ok FROM email_messages WHERE thread_id = ? LIMIT 1',
    [threadId]
  );
  return Boolean(row);
}
