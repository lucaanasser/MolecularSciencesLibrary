/**
 * Porte do EmailService do Express (Nodemailer/SMTP) para a API HTTP do Resend.
 * Fonte: backend/src/services/utilities/email/EmailService.js + modules/{baseEmail,
 * loanEmail,nudgeEmail,overdueEmail,userLifecycleEmail,adminEmail}.js e os envios
 * de formulário de backend/src/services/utilities/FormsService.js.
 * Contrato: cada função de envio mantém o MESMO nome e payload do Express, com
 * `env` como primeiro parâmetro. Nenhuma função lança exceção por falha de envio.
 * inboxEmail.js (IMAP) NÃO foi portado — recurso descontinuado.
 */
import { sign } from 'hono/jwt';
import { first } from '../db';
import { secretOf } from '../auth';
import type { Env } from '../index';

type EmailEnv = Env & {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  FRONTEND_URL?: string;
};

/**
 * Papeis dos enderecos (decisao 2026-07-29):
 * - avisos@  → so saida; todo email automatico. Sem caixa: resposta acidental da bounce.
 * - contato@ → endereco humano; recebe via Email Routing → Worker (services/emailInbox.ts),
 *   aparece no rodape e e o reply_to dos emails nao-automaticos.
 */
const DEFAULT_FROM = 'Biblioteca CM <avisos@bibliotecamoleculares.com>';
export const CONTACT_EMAIL = 'contato@bibliotecamoleculares.com';
const ADMIN_EMAIL = CONTACT_EMAIL;
const LIBRARY_EMAIL = CONTACT_EMAIL;

const frontendUrl = (env: EmailEnv): string => env.FRONTEND_URL || 'https://bibliotecamoleculares.com';

type UserRow = { id: number; name: string | null; email: string | null };

async function getUserById(env: EmailEnv, userId: unknown): Promise<UserRow | null> {
  return first<UserRow>(env.DB, 'SELECT id, name, email FROM users WHERE id = ?', [userId]);
}

/**
 * Enviador central: POST na API do Resend. Nunca lança — sempre retorna boolean.
 * Sem RESEND_API_KEY vira stub (staging funciona antes do secret existir).
 * Exportada para reuso pelo inbox (services/emailInbox.ts e routes/email.ts).
 * `from`/`replyTo`/`headers` sao opcionais: o padrao e o remetente de avisos.
 */
export async function sendEmail(
  env: EmailEnv,
  {
    to,
    subject,
    html,
    from,
    replyTo,
    headers
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
    headers?: Record<string, string>;
  }
): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.log('🟡 [stub-email] RESEND_API_KEY ausente — não enviado:', subject);
    return false;
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from || env.EMAIL_FROM || DEFAULT_FROM,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(headers ? { headers } : {})
      })
    });
    if (!r.ok) {
      console.log('🔴 e-mail falhou', r.status, await r.text());
      return false;
    }
    return true;
  } catch (error) {
    console.log('🔴 e-mail falhou', (error as Error).message);
    return false;
  }
}

/** Template HTML padrão dos emails (idêntico ao baseEmail.js do Express).
 * Exportado para a notificação de inbox (services/emailInbox.ts) manter o mesmo visual. */
export function generateEmailTemplate({
  subject,
  content,
  isAutomatic = true
}: {
  subject: string;
  content: string;
  isAutomatic?: boolean;
}): string {
  const automaticNotice = isAutomatic
    ? `<span style="color:rgb(100, 17, 97);">Este e um email automatico. Nao responda a esta mensagem.</span>`
    : `
       <span style="color:rgb(100, 17, 97);">Este nao e um email automatico. Em caso de duvidas, pode responder a esta mensagem.</span>
    `;
  return `
      <div style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background: #fffdf8; padding: 30px;">
      <style>
      @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; padding: 5vw !important; }
          .email-content-cell { padding: 5vw !important; }
      }
      </style>
      <table class="email-container" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #6C4AB6; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <tr>
      <td class="email-content-cell" style="padding: 30px;">
      <h2 style="color:#b657b3; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; font-size: 28px; margin-bottom: 20px; letter-spacing:-0.1em; text-transform: uppercase;">
      ${subject}
      </h2>
      <div style="color: #333; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', 'Roboto', Arial, Helvetica, sans-serif;">
      ${content}
      </div>
      </td>
      </tr>
      <tr>
      <td style="padding: 0 30px 30px 30px; background: #b657b3; border-radius: 0 0 8px 8px;">
      <div style="color: #fff; font-size: 14px; text-align: center; line-height: 1.5; font-family: 'Segoe UI', 'Roboto', Arial, Helvetica, sans-serif;">
      <img src="https://bibliotecamoleculares.com/images/email-images/Biblioteca%20do%20CM.png" alt="Logo Biblioteca" style="height: 100px; margin-bottom: 5px;" /><br>
      <b> Biblioteca Ciencias Moleculares </b> <br>
      <a href="mailto:${CONTACT_EMAIL}" style="color: #fff; text-decoration: none;">
      ${CONTACT_EMAIL}
      </a><br>
      ${automaticNotice}
      </div>
      </td>
      </tr>
      </table>
      </div>
  `;
}

// ---------------------------------------------------------------------------
// loanEmail.js — emprestimo/devolucao
// ---------------------------------------------------------------------------

/** Envia email de confirmacao de devolucao de livro. */
export async function sendReturnConfirmationEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user, book_title } = payload as { user: { name?: string; email?: string }; book_title?: string };
  const subject = 'Confirmacao de devolucao de livro';
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const htmlContent = `
      <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
      <p>Confirmamos a devolucao do livro <b>"${book_title}"</b> em ${dateStr}.</p>
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/return.png" alt="Carlos Magno relaxado" style="height: 350px; margin-bottom: 10px;" />
      </div>
      <p>Muito obrigado por colaborar com a nossa biblioteca! Esperamos te ver em breve para novos emprestimos.</p>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email as string, subject, html });
}

/** Envia email de confirmacao de novo emprestimo. */
export async function sendLoanConfirmationEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user, book_title } = payload as {
    user: { id?: number; name?: string; email?: string };
    book_title?: string;
  };
  const subject = 'Confirmacao de emprestimo de livro';
  let dueDateStr = '';

  try {
    const userId = user && user.id;
    if (userId) {
      const activeLoan = await first<{ due_date: string | null }>(
        env.DB,
        `SELECT l.due_date
         FROM loans l
         INNER JOIN books b ON b.id = l.book_id
         WHERE l.user_id = ?
           AND l.returned_at IS NULL
           AND b.title = ?
         ORDER BY l.borrowed_at DESC
         LIMIT 1`,
        [userId, book_title]
      );
      if (activeLoan && activeLoan.due_date) {
        dueDateStr = new Date(activeLoan.due_date).toLocaleDateString('pt-BR');
      }
    }
  } catch (err) {
    console.log('🟡 falha ao buscar due_date para email de confirmacao', (err as Error).message);
  }

  const dateStr = new Date().toLocaleDateString('pt-BR');
  const htmlContent = `
      <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
      <p>Confirmamos o registro do emprestimo do livro <b>"${book_title}"</b> em ${dateStr}.</p>
      ${dueDateStr ? `<p><b>Data limite para devolucao:</b> ${dueDateStr}</p>` : ''}
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/loan.png" alt="Carlos Magno lendo" style="height: 350px; margin-bottom: 10px;" />
      </div>
      <p>Fique atento ao prazo de devolucao e aproveite a leitura!</p>
      <p>Voce pode renovar o emprestimo diretamente pelo nosso site, na "Area do Usuario".</p>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email as string, subject, html });
}

/** Envia email de confirmacao de renovacao de emprestimo. */
export async function sendRenewalConfirmationEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user, book_title, due_date } = payload as {
    user: { name?: string; email?: string };
    book_title?: string;
    due_date: string;
  };
  const subject = 'Renovacao de emprestimo confirmada!';
  const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
  const htmlContent = `
      <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
      <p>Sua renovacao do livro <b>"${book_title}"</b> foi confirmada com sucesso.</p>
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/renewal.png" alt="Carlos Magno" style="height: 200px; margin-bottom: 10px;" />
      </div>
      <p><b>Nova data limite para devolucao:</b> ${dueDateStr}</p>
      <p>Fique atento ao prazo e aproveite a leitura!</p>
      <p>Voce pode acompanhar seus emprestimos e renovar novamente (ate 3 vezes) pela "Area do Usuario" no site.</p>
      <p><b>Bons estudos!</b></p>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email as string, subject, html });
}

/** Envia email de confirmacao de extensao de emprestimo. */
export async function sendExtensionConfirmationEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user_id, book_title, due_date } = payload as {
    user_id: number;
    book_title?: string;
    due_date: string;
  };
  const user = await getUserById(env, user_id);
  if (!user || !user.email) {
    console.log('🟡 usuario sem email para confirmacao de extensao', user_id);
    return false;
  }
  const subject = 'Extensao de emprestimo confirmada!';
  const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
  const htmlContent = `
      <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
      <p>Sua extensao do livro <b>"${book_title}"</b> foi confirmada com sucesso.</p>
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/renewal.png" alt="Carlos Magno" style="height: 200px; margin-bottom: 10px;" />
      </div>
      <p><b>Nova data limite para devolucao:</b> ${dueDateStr}</p>
      <p>Durante esse periodo, voce esta sujeito a ser cutucado por outro aluno que deseja o livro. Caso isso aconteca, o prazo sera reduzido para 5 dias e voce sera notificado por email.</p>
      <p>Fique atento ao prazo e aproveite a leitura!</p>
      <p>Voce pode acompanhar seus emprestimos pela "Area do Usuario" no site.</p>
      <p><b>Bons estudos!</b></p>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email, subject, html });
}

// ---------------------------------------------------------------------------
// nudgeEmail.js — cutucadas
// ---------------------------------------------------------------------------

/** Envia email de cutucada quando alguem quer um livro. */
export async function sendNudgeEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user_id, book_title } = payload as {
    user_id: number;
    requester_name?: string;
    book_title?: string;
  };
  const user = await getUserById(env, user_id);
  if (!user || !user.email) {
    console.log('🟡 usuario sem email para nudge', user_id);
    return false;
  }

  const subject = 'Voce foi cutucado: alguem quer esse livro!';
  const htmlContent = `
      <p>Ei! 👀</p>
      <p>Um colega esta de olho no livro ${book_title ? `"<strong>${book_title}</strong>"` : ''} que voce ainda nao devolveu... </p>
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/nudge.png" alt="Carlos Magno sendo cutucado" style="height: 350px; margin-bottom: 10px;" />
      </div><p>Que tal fazer a boa e devolver logo? Assim, todo mundo consegue aproveitar melhor a nossa biblioteca! </p>
      <div style="margin-top: 30px; text-align: center;">
          <span style="font-size: 48px;"></span>
          <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
              Sua colaboracao faz a diferenca!
          </div>
      </div>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email, subject, html });
}

/** Envia email de nudge para extensao com prazo reduzido. */
export async function sendExtensionNudgeEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user_id, book_title, new_due_date } = payload as {
    user_id: number;
    book_title?: string;
    new_due_date: string;
  };
  const user = await getUserById(env, user_id);
  if (!user || !user.email) {
    console.log('🟡 usuario sem email para nudge de extensao', user_id);
    return false;
  }

  const subject = 'Voce foi cutucado: o seu prazo de extensao foi reduzido';
  const dueDateStr = new Date(new_due_date).toLocaleDateString('pt-BR');
  const htmlContent = `
      <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
      <p>Outro aluno solicitou o livro <b>"${book_title}"</b> que esta com voce.</p>
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/nudge.png" alt="Carlos Magno cutucado" style="height: 200px; margin-bottom: 10px;" />
      </div>
      <p>Por isso, o prazo de devolucao foi reduzido para <b>5 dias</b> a partir de hoje.</p>
      <p><b>Nova data limite para devolucao:</b> ${dueDateStr}</p>
      <p>Por favor, organize-se para devolver o livro ate essa data e ajudar outros colegas a terem acesso ao material.</p>
      <p>Voce pode acompanhar seus emprestimos pela "Area do Usuario" no site.</p>
      <p><b>Bons estudos!</b></p>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email, subject, html });
}

// ---------------------------------------------------------------------------
// overdueEmail.js — atraso e vencimento proximo
// ---------------------------------------------------------------------------

/** Envia email de atraso para um usuario. */
export async function sendOverdueEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user_id, books } = payload as {
    user_id: number;
    books: Array<{ book_title?: string; book_id?: number; due_date: string }>;
  };
  const user = await getUserById(env, user_id);
  if (!user || !user.email) {
    console.log('🟡 usuario sem email para notificacao de atraso', user_id);
    return false;
  }

  const subject = 'Aviso de atraso: O Carlos Magno esta com saudades dos livros dele!';
  const booksList = books
    .map(
      (b) =>
        `<li><b>${b.book_title || b.book_id}</b> (Data limite: ${new Date(b.due_date).toLocaleDateString('pt-BR')})</li>`
    )
    .join('');

  const htmlContent = `
      <p>Oh nao, parece que voce esqueceu de devolver algum(ns) livro(s)...</p>
      <ul>${booksList}</ul>
      <div style="text-align: center;">
      <img src="https://bibliotecamoleculares.com/images/email-images/overdue.png" alt="Carlos Magno esquecido" style="height: 350px; margin-bottom: 10px;" />
      </div>
      <p>Lembre-se que outros colegas podem estar precisando desses materiais para os estudos. A devolucao em dia ajuda toda a comunidade academica!</p>
      <div style="margin-top: 30px; text-align: center;">
          <span style="font-size: 48px;"></span>
          <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
              Sua colaboracao faz a diferenca!
          </div>
      </div>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email, subject, html });
}

/** Envia email de lembrete de devolucao proxima. */
export async function sendDueSoonEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user_id, book_title, due_date, days_left } = payload as {
    user_id: number;
    book_title?: string;
    due_date: string;
    days_left: number;
  };
  const user = await getUserById(env, user_id);
  if (!user || !user.email) {
    console.log('🟡 usuario sem email para lembrete de vencimento', user_id);
    return false;
  }

  const subject =
    days_left === 1
      ? 'Atencao: Ultimo dia para devolver o livro!'
      : `Lembrete: Faltam ${days_left} dias para devolver o livro!`;

  const dueDateStr = new Date(due_date).toLocaleDateString('pt-BR');
  const htmlContent = `
      <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
      <p>O prazo para devolucao do livro <b>"${book_title}"</b> esta se aproximando.</p>
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/reminder.png" alt="Carlos Magno" style="height: 200px; margin-bottom: 10px;" />
      </div>
      <p><b>Data limite para devolucao:</b> ${dueDateStr}</p>
      <p>${days_left === 1 ? 'Hoje e o ultimo dia para devolver o livro! Nao deixe para depois.' : `Faltam apenas ${days_left} dias para o prazo final.`}</p>
      <p>Se precisar renovar ou estender, acesse a "Area do Usuario" no site.</p>
      <p><b>Bons estudos!</b></p>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email, subject, html });
}

// ---------------------------------------------------------------------------
// userLifecycleEmail.js — onboarding, recuperacao e comunicados
// ---------------------------------------------------------------------------

/** Envia email personalizado. */
export async function sendCustomEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user_id, subject, message, isAutomatic = false } = payload as {
    user_id: number;
    subject: string;
    message: string;
    isAutomatic?: boolean;
  };
  const user = await getUserById(env, user_id);
  if (!user || !user.email) {
    console.log('🟡 usuario sem email para envio customizado', user_id);
    return false;
  }

  const htmlContent = `<p>${message.replace(/\n/g, '<br>')}</p>`;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic });
  // Nao-automatico convida resposta no rodape → reply_to precisa apontar para a caixa real.
  return sendEmail(env, {
    to: user.email,
    subject,
    html,
    ...(isAutomatic ? {} : { replyTo: CONTACT_EMAIL })
  });
}

/** Envia email para multiplos usuarios (broadcast). */
export async function sendBulkEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<Array<{ user_id: number; success: boolean; error?: string }>> {
  const { user_ids, subject, message, isAutomatic = false } = payload as {
    user_ids: number[];
    subject: string;
    message: string;
    isAutomatic?: boolean;
  };
  const results: Array<{ user_id: number; success: boolean; error?: string }> = [];

  for (const user_id of user_ids) {
    try {
      const result = await sendCustomEmail(env, { user_id, subject, message, isAutomatic });
      results.push({ user_id, success: result });
    } catch (error) {
      console.log('🔴 falha ao enviar email em lote para usuario', user_id, (error as Error).message);
      results.push({ user_id, success: false, error: (error as Error).message });
    }
  }

  return results;
}

/** Envia email de boas-vindas para novos usuarios (com link de primeiro acesso). */
export async function sendWelcomeEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user_id } = payload as { user_id: number };
  const user = await getUserById(env, user_id);
  if (!user || !user.email) {
    console.log('🟡 usuario sem email para boas-vindas', user_id);
    return false;
  }

  const { subject, html } = await buildWelcomeEmail(env, user);
  return sendEmail(env, { to: user.email, subject, html });
}

/**
 * O que faz: envia boas-vindas para varios usuarios de uma vez, via /emails/batch do Resend.
 * Onde e usada: importacao CSV de usuarios (routes/users.ts).
 * Por que existe: o caminho individual custa 2 subrequests por usuario (query + envio) e o
 * plano free do Workers permite 50 por invocacao — em lote sao 100 emails por subrequest.
 * Efeitos colaterais: envio em massa. Nunca lança; devolve quantos foram aceitos.
 */
export async function sendWelcomeEmailsBatch(env: EmailEnv, users: UserRow[]): Promise<number> {
  const recipients = users.filter((user) => user.email);
  if (!recipients.length) return 0;
  if (!env.RESEND_API_KEY) {
    console.log('🟡 [stub-email] RESEND_API_KEY ausente — boas-vindas em lote não enviadas:', recipients.length);
    return 0;
  }

  const from = env.EMAIL_FROM || DEFAULT_FROM;
  let sent = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const slice = recipients.slice(i, i + 100);
    const payload = await Promise.all(
      slice.map(async (user) => {
        const { subject, html } = await buildWelcomeEmail(env, user);
        return { from, to: user.email as string, subject, html };
      })
    );
    try {
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (r.ok) sent += payload.length;
      else console.log('🔴 lote de boas-vindas falhou', r.status, await r.text());
    } catch (error) {
      console.log('🔴 lote de boas-vindas falhou', (error as Error).message);
    }
  }
  return sent;
}

/** Assunto + HTML das boas-vindas, com o link de primeiro acesso (JWT de 24h). */
async function buildWelcomeEmail(env: EmailEnv, user: UserRow): Promise<{ subject: string; html: string }> {
  const subject = 'Bem-vindo a Biblioteca Ciencias Moleculares!';

  // Mesmo contrato do Express: JWT HS256 { id, email, type: 'first_access' }, expira em 24h.
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const resetToken = await sign({ id: user.id, email: user.email, type: 'first_access', exp }, secretOf(env));
  const resetUrl = `${frontendUrl(env)}/redefinir-senha?token=${resetToken}`;

  const htmlContent = `
      <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
      <p>Seja muito bem-vindo(a) a nossa biblioteca! O Carlos Magno esta muito feliz em te ver por aqui!</p>
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/welcome.png" alt="Carlos Magno e novo usuario" style="height: 350px; margin-bottom: 10px;" />
      </div>
      <p>Agora voce pode:</p>
      <ul>
          <li>Pesquisar e reservar livros</li>
          <li>Acompanhar seus emprestimos</li>
          <li>Receber notificacoes sobre prazos de devolucao</li>
          <li>E muito mais!</li>
      </ul>
      <hr>
      <p>Para acessar sua conta, e necessario criar uma senha de acesso. <strong>Atencao: Nao use senhas sensiveis, pois estamos em uma versao teste e nao garantimos a seguranca dos dados.</strong></p>
      <p><a href="${resetUrl}" style="color: #b657b3; font-weight: bold;">Clique aqui para cadastrar sua senha</a></p>
      <p style="font-size: 13px; color: #555;">Este link expira em 24 horas. Caso tenha expirado use a funcao de: esqueci minha senha</p>
      <p>Se tiver alguma duvida, nao hesite em nos contactar.</p>
      <div style="margin-top: 30px; text-align: center;">
          <span style="font-size: 48px;"></span>
          <div style="color: #b657b3; font-weight: bold; margin-top: 10px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
              Bons estudos!
          </div>
      </div>
  `;
  return { subject, html: generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true }) };
}

/** Envia email de redefinicao de senha. */
export async function sendPasswordResetEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user_id, resetToken } = payload as { user_id: number; resetToken: string };
  const user = await getUserById(env, user_id);
  if (!user || !user.email) {
    console.log('🟡 usuario sem email para redefinicao de senha', user_id);
    return false;
  }
  const subject = 'Redefinicao de senha';
  const resetUrl = `${frontendUrl(env)}/redefinir-senha?token=${resetToken}`;
  const htmlContent = `
      <p>Ola, <strong>${user.name || 'colega'}</strong>!</p>
      <p>Recebemos uma solicitacao para redefinir sua senha.</p>
      <div style="text-align: center;">
          <img src="https://bibliotecamoleculares.com/images/email-images/password.png" alt="Carlos Magno esquecido" style="height: 350px; margin-bottom: 10px;" />
      </div>
      <p>Para criar uma nova senha, clique no link abaixo. <strong>Atencao: Nao use senhas sensiveis, pois estamos em uma versao teste e nao garantimos a seguranca dos dados.</strong></p>
      <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background: #b657b3; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 18px;">Redefinir minha senha</a>
      </div>
      <p>Se voce nao solicitou, ignore este email.</p>
  `;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: user.email, subject, html });
}

// ---------------------------------------------------------------------------
// adminEmail.js — notificacoes administrativas
// ---------------------------------------------------------------------------

/** Notifica administracao sobre nova solicitacao de cadastro. */
export async function sendRegistrationRequestNotification(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { user } = payload as {
    user: { name?: string; NUSP?: string | number; email?: string; phone?: string; class?: string };
  };
  const adminUrl = `${frontendUrl(env)}/admin`;
  const subject = 'Nova solicitacao de cadastro - Biblioteca CM';

  const htmlContent = `
      <p>Ola, administrador!</p>
      <p>Um novo usuario solicitou cadastro na <strong>Biblioteca Ciencias Moleculares</strong> e aguarda sua aprovacao.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Nome</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.name}</td></tr>
          <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">NUSP</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.NUSP}</td></tr>
          <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Email</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.email}</td></tr>
          <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Telefone</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.phone}</td></tr>
          <tr><td style="padding: 6px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Turma</td><td style="padding: 6px 12px; border: 1px solid #ddd;">${user.class || '-'}</td></tr>
      </table>
      <div style="text-align: center; margin: 20px 0;">
          <a href="${adminUrl}" style="background: #b657b3; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Ver no painel de administracao</a>
      </div>
      <p style="font-size: 13px; color: #555;">Acesse: Painel Admin -> Usuarios -> <strong>Solicitacoes de Cadastro</strong> para aprovar ou rejeitar.</p>
  `;

  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: ADMIN_EMAIL, subject, html });
}

// ---------------------------------------------------------------------------
// FormsService.js — confirmacao de formulario e copia para a biblioteca
// ---------------------------------------------------------------------------

/** Envia email de confirmacao para o usuario que preencheu o formulario. */
export async function sendUserConfirmationEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { email, subject, message } = payload as {
    email: string;
    subject: string;
    message: string;
    type?: string;
  };
  // Mensagem padrão de confirmação
  const defaultMsg =
    'Recebemos sua mensagem e em breve você receberá um retorno da equipe da Biblioteca. Obrigado por contribuir!';
  const htmlContent = `<p>${message.replace(/\n/g, '<br>')}</p><hr><p>${defaultMsg}</p>`;
  const html = generateEmailTemplate({ subject, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: email, subject, html });
}

/** Envia copia do formulario para o email da biblioteca. */
export async function sendLibraryCopyEmail(
  env: EmailEnv,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { email, subject, message, type } = payload as {
    email: string;
    subject: string;
    message: string;
    type?: string;
  };
  const htmlContent = `
      <h3>Nova mensagem via formulário: ${subject}</h3>
      <p><strong>De:</strong> ${email}</p>
      <p><strong>Tipo:</strong> ${type}</p>
      <hr>
      <p>${message.replace(/\n/g, '<br>')}</p>
  `;
  const html = generateEmailTemplate({ subject: `[Formulário] ${subject}`, content: htmlContent, isAutomatic: true });
  return sendEmail(env, { to: LIBRARY_EMAIL, subject: `[Formulário] ${subject}`, html });
}
