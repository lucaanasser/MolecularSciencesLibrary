/**
 * Rotas admin da caixa de contato@ (/api/email). Substitui os stubs IMAP
 * descontinuados na migracao (antigo /api/email/inbox e /api/notifications/inbox).
 * Leitura/agrupamento em services/emailThreads.ts; envio via Resend em services/email.ts
 * (from contato@, reply_to contato@, In-Reply-To/References para nao quebrar a thread
 * no cliente de quem escreveu). Todas as rotas exigem admin.
 */
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { first, run } from '../db';
import { authenticateToken, type JwtUser } from '../auth';
import { sendEmail, CONTACT_EMAIL } from '../services/email';
import {
  CONTACT_FROM,
  newMessageId,
  humanHtml,
  sendComposed,
  sendBroadcast,
  type ComposeSender
} from '../services/emailCompose';
import {
  FOLDERS,
  listThreads,
  getThreadMessages,
  insertOutgoing,
  threadExists,
  type Folder
} from '../services/emailThreads';
import type { Env } from '../index';

type Vars = { Bindings: Env; Variables: { user: JwtUser } };
const email = new Hono<Vars>();

// Mesmo padrao de users.ts: guarda local de admin.
const requireAdmin = async (c: Context<Vars>, next: Next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Acesso restrito a administradores.' }, 403);
  }
  await next();
};

// Lista threads de uma pasta (inbox|quarantine|archived|sent) + contadores
email.get('/threads', authenticateToken(), requireAdmin, async (c) => {
  const qp = c.req.query();
  const folder = (qp.folder ?? 'inbox') as Folder;
  if (!FOLDERS.includes(folder)) {
    return c.json({ error: 'folder deve ser inbox, quarantine, archived ou sent.' }, 400);
  }
  const page = Math.max(1, Math.trunc(Number(qp.page ?? 1)) || 1);
  const limit = Math.min(100, Math.max(1, Math.trunc(Number(qp.limit ?? 20)) || 20));
  try {
    return c.json(await listThreads(c.env, folder, page, limit), 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Mensagens de uma thread em ordem; abrir marca recebidas como lidas
email.get('/threads/:threadId', authenticateToken(), requireAdmin, async (c) => {
  try {
    const messages = await getThreadMessages(c.env, c.req.param('threadId') ?? '');
    if (!messages) return c.json({ error: 'Thread nao encontrada' }, 404);
    return c.json(messages, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Responde a ultima mensagem recebida da thread
email.post('/threads/:threadId/reply', authenticateToken(), requireAdmin, async (c) => {
  const threadId = c.req.param('threadId') ?? '';
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return c.json({ error: 'message e obrigatorio.' }, 400);
  try {
    const lastIn = await first<{
      from_address: string;
      subject: string | null;
      message_id: string | null;
    }>(
      c.env.DB,
      `SELECT from_address, subject, message_id FROM email_messages
       WHERE thread_id = ? AND direction = 'in' ORDER BY created_at DESC, id DESC LIMIT 1`,
      [threadId]
    );
    if (!lastIn) return c.json({ error: 'Thread sem mensagem recebida para responder.' }, 404);

    const baseSubject = lastIn.subject || '(sem assunto)';
    const subject = /^re:/i.test(baseSubject) ? baseSubject : `Re: ${baseSubject}`;
    const headers: Record<string, string> = {};
    if (lastIn.message_id) {
      headers['In-Reply-To'] = lastIn.message_id;
      headers['References'] =
        threadId === lastIn.message_id ? threadId : `${threadId} ${lastIn.message_id}`;
    }
    const html = humanHtml(subject, message);
    const ok = await sendEmail(c.env, {
      to: lastIn.from_address,
      subject,
      html,
      from: CONTACT_FROM,
      replyTo: CONTACT_EMAIL,
      headers
    });
    if (!ok) return c.json({ error: 'Falha ao enviar o email.' }, 502);

    await insertOutgoing(c.env, {
      threadId,
      messageId: newMessageId(),
      inReplyTo: lastIn.message_id,
      to: lastIn.from_address,
      subject,
      bodyText: message,
      bodyHtml: html,
      sentByUserId: c.get('user').id
    });
    return c.json({ success: true, thread_id: threadId }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Mensagem nova: um destinatario ou broadcast; remetente contato@ ou avisos@
email.post('/threads', authenticateToken(), requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const to = typeof body.to === 'string' ? body.to.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const broadcast = body.broadcast === true;
  const sender = (body.sender === 'avisos' ? 'avisos' : 'contato') as ComposeSender;
  if (!subject || !message) {
    return c.json({ error: 'subject e message sao obrigatorios.' }, 400);
  }
  try {
    const sentByUserId = c.get('user').id;
    if (broadcast) {
      const result = await sendBroadcast(c.env, { sender, subject, message, sentByUserId });
      if (!result) return c.json({ error: 'Falha ao enviar o broadcast.' }, 502);
      return c.json({ success: true, ...result }, 201);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return c.json({ error: 'Email de destino invalido.' }, 400);
    }
    const threadId = await sendComposed(c.env, { sender, to, subject, message, sentByUserId });
    if (!threadId) return c.json({ error: 'Falha ao enviar o email.' }, 502);
    return c.json({ success: true, thread_id: threadId }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Muda status das recebidas da thread (read|unread|archived)
email.patch('/threads/:threadId', authenticateToken(), requireAdmin, async (c) => {
  const threadId = c.req.param('threadId') ?? '';
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const status = body.status as string;
  if (!['unread', 'read', 'archived'].includes(status)) {
    return c.json({ error: 'status deve ser unread, read ou archived.' }, 400);
  }
  try {
    if (!(await threadExists(c.env, threadId))) {
      return c.json({ error: 'Thread nao encontrada' }, 404);
    }
    await run(
      c.env.DB,
      "UPDATE email_messages SET status = ? WHERE thread_id = ? AND direction = 'in'",
      [status, threadId]
    );
    // JSON em vez de 204: o fetchJson do frontend sempre parseia o corpo da resposta.
    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Apaga a thread inteira
email.delete('/threads/:threadId', authenticateToken(), requireAdmin, async (c) => {
  try {
    const result = await run(c.env.DB, 'DELETE FROM email_messages WHERE thread_id = ?', [
      c.req.param('threadId') ?? ''
    ]);
    if (!result.meta.changes) return c.json({ error: 'Thread nao encontrada' }, 404);
    // JSON em vez de 204: o fetchJson do frontend sempre parseia o corpo da resposta.
    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default email;
