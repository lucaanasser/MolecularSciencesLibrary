/**
 * Porte de /api/forms do Express (FormsController + FormsService).
 * Único endpoint: POST /submit, usado pelo formulário "Ajude a Biblioteca".
 * Manda confirmação para quem escreveu e cópia para contato@ — que, pelo Email
 * Routing, volta para o Worker e aparece na aba Emails do admin.
 */
import { Hono } from 'hono';
import { sendLibraryCopyEmail, sendUserConfirmationEmail } from '../services/email';
import type { Env } from '../index';

const forms = new Hono<{ Bindings: Env }>();

forms.post('/submit', async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { email, subject, message, type } = body as Record<string, string | undefined>;

  if (!email || !subject || !message || !type) {
    return c.json({ error: 'Campos obrigatórios: email, subject, message, type.' }, 400);
  }

  try {
    await sendUserConfirmationEmail(c.env, { email, subject, message, type });
    await sendLibraryCopyEmail(c.env, { email, subject, message, type });
    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default forms;
