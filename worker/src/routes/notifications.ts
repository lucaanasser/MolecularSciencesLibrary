/**
 * Porte de /api/notifications do Express
 * (NotificationsRoutes → NotificationsController handlers → NotificationsService → NotificationsModel).
 * Contrato espelhado: mesmos paths, métodos, status codes e mensagens.
 *
 * E-mail via services/email (Resend). Falha de e-mail nunca quebra a notificação interna.
 * O efeito colateral de banco do nudge em empréstimo estendido (redução de due_date via
 * LoansModel.shortenDueDateIfLongerThan) é aplicado, pois é regra de negócio.
 * A inbox IMAP foi descontinuada; a caixa de contato@ vive em /api/email (routes/email.ts).
 */
import { Hono } from 'hono';
import type { Context } from 'hono';
import { all, first, run } from '../db';
import { authenticateToken, type JwtUser } from '../auth';
import { sendCustomEmail, sendExtensionNudgeEmail, sendNudgeEmail } from '../services/email';
import type { Env } from '../index';

// Espelho de deliveryNotification.DEFAULT_SUBJECT_BY_TYPE.
const DEFAULT_SUBJECT_BY_TYPE: Record<string, string> = {
  general: 'Notificacao da Biblioteca',
  reminder: 'Lembrete da Biblioteca',
  alert: 'Alerta da Biblioteca',
  system: 'Atualizacao do Sistema',
  info: 'Informacao da Biblioteca'
};

// Espelho do SELECT de RulesModel.getRules (usado pelo fluxo de nudge de extensão).
const GET_RULES_SQL =
  'SELECT max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days, extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge, nudge_cooldown_hours, pending_nudge_extension_days FROM rules WHERE id = 1';

type Vars = { Bindings: Env; Variables: { user: JwtUser } };

const notifications = new Hono<Vars>();

/**
 * Espelho de deliveryNotification._handleNudgeEmailFlow, com EmailService stubado.
 * Erros aqui são engolidos pelo chamador (mesmo comportamento do Express, que só loga warn).
 */
async function handleNudgeEmailFlow(
  env: Env,
  { user_id, metadata, loan_id }: { user_id: unknown; metadata?: Record<string, unknown>; loan_id: unknown }
): Promise<void> {
  if (!loan_id) {
    await sendNudgeEmail(env, {
      user_id,
      requester_name: metadata?.requester_name,
      book_title: metadata?.book_title
    });
    return;
  }

  const loan = await first<Record<string, unknown>>(env.DB, 'SELECT * FROM loans WHERE id = ?', [loan_id]);
  if (loan && !loan.returned_at && loan.is_extended === 1) {
    // Espelho de LoansService.applyNudgeImpactIfNeeded (erros ignorados, como o .catch(() => null) do Express).
    let newDue = loan.due_date;
    try {
      const rules = await first<Record<string, unknown>>(env.DB, GET_RULES_SQL);
      const shortenedTarget = (rules?.shortened_due_days_after_nudge as number) || 5;
      const result = await run(
        env.DB,
        `UPDATE loans
         SET due_date = datetime('now', '+'|| ? ||' days')
         WHERE id = ?
           AND returned_at IS NULL
           AND is_extended = 1
           AND (due_date IS NULL OR due_date > datetime('now', '+'|| ? ||' days'))`,
        [shortenedTarget, loan_id, shortenedTarget]
      );
      if (result.meta.changes > 0) {
        const updated = await first<Record<string, unknown>>(env.DB, 'SELECT due_date FROM loans WHERE id = ?', [loan_id]);
        newDue = updated?.due_date ?? newDue;
      }
    } catch (_error) {
      // Impacto do nudge é best-effort no Express; falha não interrompe o fluxo.
    }
    await sendExtensionNudgeEmail(env, {
      user_id,
      book_title: metadata?.book_title || loan.book_title,
      new_due_date: newDue
    });
    return;
  }

  await sendNudgeEmail(env, {
    user_id,
    requester_name: metadata?.requester_name,
    book_title: metadata?.book_title
  });
}

/** Espelho de commandHandlers.createNotification + createNotificationWithChannels. */
async function createNotificationHandler(c: Context<Vars>) {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { user_id, type, message, metadata, sendEmail, subject, loan_id } = body as Record<string, unknown>;

  if (!user_id || !type || !message) {
    return c.json({ error: 'user_id, type e message sao obrigatorios.' }, 400);
  }

  try {
    const result = await run(
      c.env.DB,
      `INSERT INTO notifications (user_id, type, message, metadata, loan_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [user_id, type, message, metadata ? JSON.stringify(metadata) : null, loan_id ?? null, 'unread']
    );
    const id = result.meta.last_row_id;

    if (sendEmail) {
      try {
        if (type === 'nudge') {
          await handleNudgeEmailFlow(c.env, {
            user_id,
            metadata: metadata as Record<string, unknown> | undefined,
            loan_id
          });
        } else {
          const subjectToUse = subject || DEFAULT_SUBJECT_BY_TYPE[type as string] || `Notificacao: ${type}`;
          await sendCustomEmail(c.env, { user_id, subject: subjectToUse, message, isAutomatic: false });
        }
      } catch (emailError) {
        // Espelho do Express: falha no canal de e-mail não quebra a criação da notificação.
        console.log('🟡 Falha no envio de email; notificacao interna mantida', (emailError as Error).message);
      }
    }

    return c.json({ id }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
}

// Lista notificacoes do usuario autenticado
notifications.get('/me', authenticateToken(), async (c) => {
  const user_id = c.get('user')?.id;
  try {
    const rows = await all(
      c.env.DB,
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    return c.json(rows, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Cria notificacao (rota principal)
notifications.post('/', authenticateToken(), createNotificationHandler);

// Rota legada para nudge (sem autenticação, igual ao Express)
notifications.post('/nudge', createNotificationHandler);

// Marca notificacao como lida
notifications.patch('/:id/read', authenticateToken(), async (c) => {
  try {
    await run(c.env.DB, "UPDATE notifications SET status = 'read' WHERE id = ?", [c.req.param('id')]);
    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Lista todas as notificacoes (admin)
notifications.get('/', authenticateToken(), async (c) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Acesso negado' }, 403);
  }

  const user_id = c.req.query('user_id');
  try {
    let sql = 'SELECT * FROM notifications';
    const params: unknown[] = [];
    if (user_id) {
      sql += ' WHERE user_id = ?';
      params.push(user_id);
    }
    sql += ' ORDER BY created_at DESC';
    return c.json(await all(c.env.DB, sql, params), 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Exclui notificacao para usuario autenticado (soft delete)
notifications.delete('/:id', authenticateToken(), async (c) => {
  const user_id = c.get('user')?.id;
  try {
    await run(c.env.DB, "UPDATE notifications SET status = 'deleted' WHERE id = ? AND user_id = ?", [
      c.req.param('id'),
      user_id
    ]);
    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default notifications;
