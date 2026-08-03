/**
 * Porte de /api/loans (11 rotas) — contrato espelhado da cadeia Express:
 * LoansRoutes → borrow/query/renewHandlers → loanBorrow/Return/Renew/Extension/Queries → loanReads/Writes/Parser.
 * Diferenças deliberadas e documentadas:
 *  - createLoan/returnBook usam db.batch() (no Express eram 2 escritas sem transação);
 *  - e-mails de confirmação viram stub de log (MIG-04);
 *  - senha do empréstimo verifica PBKDF2 (hash bcrypt legado orienta reset, como no login).
 * Como no Express, NENHUMA rota desta família usa authenticateToken (achado de segurança
 * conhecido: /admin e /internal-use sem token — corrigir depois nos dois lados).
 */
import { Hono } from 'hono';
import type { Context } from 'hono';
import { all, batch, first } from '../db';
import { isLegacyBcryptHash, pbkdf2Verify } from '../auth';
import {
  sendExtensionConfirmationEmail,
  sendLoanConfirmationEmail,
  sendRenewalConfirmationEmail,
  sendReturnConfirmationEmail
} from '../services/email';
import type { Env } from '../index';

const BOOK_FIELDS = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
const USER_FIELDS = ['id', 'role', 'name', 'NUSP', 'email', 'phone', 'class'];
const bookSelect = BOOK_FIELDS.map((f) => `b.${f} AS book_${f}`).join(', ');
const userSelect = USER_FIELDS.map((f) => `u.${f} AS user_${f}`).join(', ');

type Row = Record<string, unknown>;
type Loan = Record<string, unknown> & { book?: Row; user?: Row };

function parseLoanRow(row: Row): Loan {
  const book: Row = {};
  const user: Row = {};
  const loan: Loan = {};
  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith('book_')) {
      book[key.replace('book_', '')] = value;
      continue;
    }
    if (key.startsWith('user_')) {
      user[key.replace('user_', '')] = value;
      continue;
    }
    loan[key] = value;
  }
  if (Object.keys(book).length > 0) {
    loan.book = book;
    loan.book_id = book.id ?? loan.book_id;
  }
  if (Object.keys(user).length > 0) {
    loan.user = user;
    loan.user_id = user.id ?? loan.user_id;
  }
  return loan;
}

function isOverdueLoan(loan: Loan, throwOnMissingDueDate: boolean): boolean {
  if (!loan || loan.returned_at) return false;
  if (!loan.due_date) {
    if (throwOnMissingDueDate) throw new Error('Emprestimo sem data de devolucao definida.');
    return false;
  }
  const due = new Date(String(loan.due_date).replace(' ', 'T'));
  return due < new Date();
}

async function getRules(db: D1Database): Promise<Row> {
  const rules = await first<Row>(db, 'SELECT * FROM rules WHERE id = 1');
  if (!rules) throw new Error('Regras de empréstimo não configuradas.');
  return rules;
}

async function getBookByIdOrThrow(db: D1Database, book_id: unknown): Promise<Row> {
  const book = await first<Row>(db, 'SELECT * FROM books WHERE id = ?', [book_id]);
  if (!book) {
    throw new Error('Livro não encontrado. Verifique o código de barras fornecido e tente novamente.');
  }
  return book;
}

async function getUserByNuspOrThrow(db: D1Database, NUSP: unknown): Promise<Row> {
  const user = await first<Row>(db, 'SELECT * FROM users WHERE NUSP = ?', [NUSP]);
  if (!user) throw new Error('Usuário não encontrado');
  return user;
}

async function getLoansByBookId(db: D1Database, book_id: unknown, activeOnly: boolean): Promise<Loan[]> {
  let sql = `SELECT l.*, ${bookSelect}, ${userSelect}
    FROM loans l
    LEFT JOIN books b ON l.book_id = b.id
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.book_id = ?`;
  if (activeOnly) sql += ' AND l.returned_at IS NULL';
  sql += ' ORDER BY l.borrowed_at DESC';
  const rows = await all<Row>(db, sql, [book_id]);
  if (activeOnly && rows.length > 1) {
    throw new Error(
      `Integridade de dados comprometida: multiplos emprestimos ativos para o mesmo livro (ID ${book_id}). Contate o suporte.`
    );
  }
  return rows.map(parseLoanRow);
}

async function getLoansByUser(db: D1Database, user_id: unknown, status = 'all'): Promise<Loan[]> {
  let sql = `SELECT l.*, ${bookSelect}
    FROM loans l
    LEFT JOIN books b ON l.book_id = b.id
    WHERE l.user_id = ?`;
  if (status === 'active') sql += ' AND l.returned_at IS NULL';
  else if (status === 'returned') sql += ' AND l.returned_at IS NOT NULL';
  sql += ' ORDER BY l.borrowed_at DESC';
  return (await all<Row>(db, sql, [user_id])).map(parseLoanRow);
}

async function getLoanById(db: D1Database, loan_id: unknown): Promise<Loan | null> {
  const row = await first<Row>(
    db,
    `SELECT l.*, ${bookSelect}, ${userSelect}
     FROM loans l
     LEFT JOIN books b ON l.book_id = b.id
     LEFT JOIN users u ON l.user_id = u.id
     WHERE l.id = ?`,
    [loan_id]
  );
  return row ? parseLoanRow(row) : null;
}

/** Espelho de UsersService.authenticateUser restrito ao que o empréstimo usa (validar senha). */
async function verifyUserPassword(db: D1Database, NUSP: unknown, password: string): Promise<void> {
  const user = await getUserByNuspOrThrow(db, NUSP);
  if (user.status === 'pending') {
    throw new Error('Seu cadastro ainda está aguardando aprovação do administrador.');
  }
  const storedHash = user.password_hash as string | null;
  if (isLegacyBcryptHash(storedHash)) {
    throw new Error('Sua senha precisa ser redefinida. Use a opção "Esqueci minha senha".');
  }
  const valid = await pbkdf2Verify(password, storedHash);
  if (!valid) throw new Error('Senha incorreta');
}

async function borrowBookCore(
  c: Context<{ Bindings: Env }>,
  book_id: unknown,
  NUSP: unknown,
  password: string | null,
  requirePassword: boolean
): Promise<Loan | null> {
  const db = c.env.DB;
  const user = await getUserByNuspOrThrow(db, NUSP);
  if (requirePassword) await verifyUserPassword(db, NUSP, password as string);

  const book = await getBookByIdOrThrow(db, book_id);

  const rules = await getRules(db);
  const activeLoans = await getLoansByUser(db, user.id, 'active');
  const maxActiveLoans = Number(rules.max_books_per_user);
  if (activeLoans.length >= maxActiveLoans) {
    throw new Error(`Limite de ${maxActiveLoans} empréstimos ativos atingido.`);
  }
  if (book.status != 'disponível') {
    throw new Error('Este livro não está disponível para empréstimo no momento. Status: ' + book.status);
  }

  const borrowedAt = new Date();
  const dueDate = new Date(borrowedAt);
  dueDate.setDate(borrowedAt.getDate() + Number(rules.max_days));
  const dueDateSql = dueDate.toISOString().replace('T', ' ').replace(/\..*$/, '');

  await batch(db, [
    {
      sql: 'INSERT INTO loans (book_id, user_id, borrowed_at, due_date, renewals) VALUES (?, ?, CURRENT_TIMESTAMP, ?, 0)',
      params: [book_id, user.id, dueDateSql]
    },
    { sql: "UPDATE books SET status = 'emprestado' WHERE id = ?", params: [book_id] }
  ]);

  const created = await getLoansByBookId(db, book_id, true);
  c.executionCtx.waitUntil(sendLoanConfirmationEmail(c.env, { user, book_title: book.title }));
  return created[0] || null;
}

const loans = new Hono<{ Bindings: Env }>();

loans.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({} as Row));
  const { book_id, NUSP, password } = body as { book_id?: unknown; NUSP?: unknown; password?: string };
  if (!book_id || !NUSP || !password) {
    return c.json({ error: 'ID do livro, NUSP e senha sao obrigatorios' }, 400);
  }
  try {
    await borrowBookCore(c, book_id, NUSP, password, true);
    return c.json({ message: 'Emprestimo criado com sucesso' }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

loans.post('/admin', async (c) => {
  const body = await c.req.json().catch(() => ({} as Row));
  const { book_id, NUSP } = body as { book_id?: unknown; NUSP?: unknown };
  if (!book_id || !NUSP) {
    return c.json({ error: 'ID do livro e NUSP sao obrigatorios' }, 400);
  }
  try {
    const loan = await borrowBookCore(c, book_id, NUSP, null, false);
    return c.json({ ...(loan || {}), is_overdue: false }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

loans.post('/return', async (c) => {
  const body = await c.req.json().catch(() => ({} as Row));
  const { book_id } = body as { book_id?: unknown };
  if (!book_id) return c.json({ error: 'ID do livro e obrigatorio' }, 400);
  try {
    // Livro inexistente e livro sem empréstimo aberto são problemas diferentes para
    // quem está no balcão: um é código errado, o outro é livro que nunca saiu.
    const book = await first<Row>(c.env.DB, 'SELECT id, code, title, status FROM books WHERE id = ?', [book_id]);
    if (!book) {
      throw new Error(
        `Nenhum livro cadastrado com o código de barras ${book_id}. Confira se leu o código de barras do livro, e não o código da prateleira.`
      );
    }
    const active = await getLoansByBookId(c.env.DB, book_id, true);
    if (!active || active.length === 0) {
      throw new Error(
        `"${book.title}" (${book.code}) não consta como emprestado — status atual: ${book.status}. A devolução já pode ter sido registrada antes.`
      );
    }
    const loan = active[0];
    await batch(c.env.DB, [
      { sql: 'UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL', params: [loan.id] },
      { sql: "UPDATE books SET status = 'disponível' WHERE id = ?", params: [book_id] }
    ]);
    c.executionCtx.waitUntil(
      sendReturnConfirmationEmail(c.env, { user: loan.user, book_title: (loan.book as Row)?.title })
    );
    return c.json({ message: 'Devolucao registrada com sucesso' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

loans.post('/internal-use', async (c) => {
  const body = await c.req.json().catch(() => ({} as Row));
  const { book_id } = body as { book_id?: unknown };
  if (!book_id) return c.json({ error: 'ID do livro e obrigatorio' }, 400);
  try {
    await getBookByIdOrThrow(c.env.DB, book_id);
    await c.env.DB
      .prepare(
        `INSERT INTO loans (book_id, user_id, borrowed_at, due_date, renewals, returned_at)
         VALUES (?, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP)`
      )
      .bind(book_id)
      .run();
    return c.json({ message: 'Uso interno registrado com sucesso' }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

loans.get('/', async (c) => {
  const status = c.req.query('status') || 'all';
  try {
    let sql = `SELECT l.*, ${bookSelect}, ${userSelect}
      FROM loans l
      LEFT JOIN books b ON l.book_id = b.id
      LEFT JOIN users u ON l.user_id = u.id`;
    if (status === 'active') sql += ' WHERE l.returned_at IS NULL';
    else if (status === 'returned') sql += ' WHERE l.returned_at IS NOT NULL';
    sql += ' ORDER BY l.borrowed_at DESC';
    const rows = (await all<Row>(c.env.DB, sql)).map(parseLoanRow);
    return c.json(rows.map((loan) => ({ ...loan, is_overdue: isOverdueLoan(loan, true) })));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

loans.get('/user/:userId', async (c) => {
  const status = c.req.query('status') || 'all';
  try {
    const rows = await getLoansByUser(c.env.DB, c.req.param('userId'), status);
    return c.json(rows.map((loan) => ({ ...loan, is_overdue: isOverdueLoan(loan, true) })));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

loans.get('/book/:bookId', async (c) => {
  const activeOnly = c.req.query('activeOnly') === 'true';
  try {
    return c.json(await getLoansByBookId(c.env.DB, c.req.param('bookId'), activeOnly));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

async function checkRenewRules(db: D1Database, user_id: unknown, loan: Loan) {
  const rules = await getRules(db);
  const userLoans = await getLoansByUser(db, user_id, 'active');
  const hasOverdue = userLoans.some((l) => isOverdueLoan(l, false));
  if (hasOverdue) {
    return { allowed: false as const, reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de renovar qualquer empréstimo.' };
  }
  const maxRenewals = Number(rules.max_renewals);
  const renewalsDone = Number(loan.renewals);
  if (renewalsDone >= maxRenewals) {
    return { allowed: false as const, reason: 'Limite de renovações atingido.', renewals_left: 0 };
  }
  const renewalDays = Number(rules.renewal_days) || 7;
  const nowDate = new Date();
  const newDueDate = new Date(nowDate);
  newDueDate.setDate(nowDate.getDate() + renewalDays);
  return {
    allowed: true as const,
    reason: '',
    renewals_left: maxRenewals - renewalsDone,
    new_due_date: newDueDate.toISOString()
  };
}

async function previewRenew(db: D1Database, loan_id: unknown, user_id: unknown) {
  const loan = await getLoanById(db, loan_id);
  if (!loan) throw new Error('Empréstimo não encontrado.');
  if (loan.returned_at) throw new Error('Empréstimo já foi devolvido.');
  if (Number(loan.user_id) !== Number(user_id)) {
    throw new Error('Este empréstimo não pertence ao usuário informado.');
  }
  const check = await checkRenewRules(db, user_id, loan);
  if (!check.allowed) throw new Error(check.reason || 'Renovação não permitida.');
  return {
    new_due_date: check.new_due_date,
    renewals_left: check.renewals_left,
    message: 'Nova data de devolução após renovação (calculada a partir de hoje).'
  };
}

loans.post('/:id/preview-renew', async (c) => {
  const loan_id = c.req.param('id');
  const body = await c.req.json().catch(() => ({} as Row));
  const user_id = (body as Row).user_id;
  if (!loan_id || !user_id) {
    return c.json({ error: 'ID do emprestimo e ID do usuario sao obrigatorios' }, 400);
  }
  try {
    return c.json(await previewRenew(c.env.DB, loan_id, user_id));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

loans.put('/:id/renew', async (c) => {
  const loan_id = Number(c.req.param('id'));
  const body = await c.req.json().catch(() => ({} as Row));
  const user_id = Number((body as Row).user_id);
  if (!user_id) return c.json({ error: 'ID do usuario e obrigatorio' }, 400);
  try {
    const preview = await previewRenew(c.env.DB, loan_id, user_id);
    await c.env.DB
      .prepare('UPDATE loans SET renewals = renewals + 1, due_date = ? WHERE id = ? AND returned_at IS NULL')
      .bind(preview.new_due_date, loan_id)
      .run();
    const loan = await getLoanById(c.env.DB, loan_id);
    c.executionCtx.waitUntil(
      sendRenewalConfirmationEmail(c.env, {
        user: loan?.user,
        book_title: (loan?.book as Row)?.title,
        due_date: preview.new_due_date
      })
    );
    return c.json(loan);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

async function checkExtensionRules(db: D1Database, user: Row, loan_id: unknown, user_id: unknown) {
  const rules = await getRules(db);
  const loan = await getLoanById(db, loan_id);
  if (!loan) throw new Error('Empréstimo não encontrado.');
  if (loan.returned_at) throw new Error('Empréstimo já foi devolvido.');
  if (Number(loan.user_id) !== Number(user_id)) {
    throw new Error('Este empréstimo não pertence ao usuário informado.');
  }
  if (loan.is_extended === 1) return { allowed: false, reason: 'Empréstimo já está estendido.' };
  if (Number(loan.renewals ?? 0) < Number(rules.max_renewals)) {
    return { allowed: false, reason: 'Extensão só disponível após atingir o limite de renovações.' };
  }
  if (!loan.due_date) return { allowed: false, reason: 'Data de devolução não definida.' };
  if (new Date(String(loan.due_date).replace(' ', 'T')) < new Date()) {
    return { allowed: false, reason: 'Empréstimo atrasado, não pode estender.' };
  }
  const allLoans = await getLoansByUser(db, user.id);
  if (allLoans.some((l) => isOverdueLoan(l, false))) {
    return { allowed: false, reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de estender qualquer empréstimo.' };
  }
  return { allowed: true, reason: '' };
}

async function previewExtend(db: D1Database, loan_id: unknown, user_id: unknown) {
  const loan = await getLoanById(db, loan_id);
  if (!loan) throw new Error('Empréstimo não encontrado ou já devolvido.');
  const user = await first<Row>(db, 'SELECT * FROM users WHERE id = ?', [user_id]);
  if (!user) throw new Error('Usuário não encontrado.');
  const book = await getBookByIdOrThrow(db, loan.book_id);
  if (!book) throw new Error('Livro não encontrado.');

  const check = await checkExtensionRules(db, user, loan_id, user_id);
  if (!check.allowed) throw new Error(check.reason || 'Extensão não permitida.');

  const rules = await getRules(db);
  const addedDays = (Number(rules.renewal_days) || 7) * (Number(rules.extension_block_multiplier) || 3);
  const now = new Date();
  const newDueDate = new Date(now);
  newDueDate.setDate(now.getDate() + addedDays);
  return {
    new_due_date: newDueDate.toISOString(),
    message: `Nova data de devolução após extensão (calculada a partir de hoje, extensão adiciona ${addedDays} dias).`
  };
}

loans.post('/:id/preview-extend', async (c) => {
  const loan_id = Number(c.req.param('id'));
  const body = await c.req.json().catch(() => ({} as Row));
  const user_id = Number((body as Row).user_id);
  try {
    return c.json(await previewExtend(c.env.DB, loan_id, user_id));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

loans.put('/:id/extend', async (c) => {
  const loan_id = Number(c.req.param('id'));
  const body = await c.req.json().catch(() => ({} as Row));
  const user_id = Number((body as Row).user_id);
  try {
    const preview = await previewExtend(c.env.DB, loan_id, user_id);
    await c.env.DB
      .prepare('UPDATE loans SET due_date = ?, is_extended = 1 WHERE id = ? AND returned_at IS NULL')
      .bind(preview.new_due_date, loan_id)
      .run();
    const updated = await getLoanById(c.env.DB, loan_id);
    c.executionCtx.waitUntil(
      sendExtensionConfirmationEmail(c.env, {
        user_id,
        book_title: (updated?.book as Row)?.title,
        due_date: updated?.due_date
      })
    );
    return c.json({ message: 'Empréstimo estendido com sucesso.', due_date: updated?.due_date });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

export default loans;
