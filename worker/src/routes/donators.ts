/**
 * Porte de /api/donators do Express (roteador unificado routes/library/donators/DonatorsRoutes.js).
 * Contrato espelhado da cadeia DonatorsController (command/query handlers) ->
 * DonatorsService -> DonatorsModel (core + query).
 * Inclui o par de CSV (GET /export/csv e POST /import/csv), espelho de csvDonatorService.
 * Obs.: como no Express, POST /, DELETE /:id e GET /export/csv NÃO exigem autenticação;
 * apenas POST /import/csv exige admin.
 */
import { Hono } from 'hono';
import { all, first, run } from '../db';
import { authenticateToken, type JwtUser } from '../auth';
import type { Context, Next } from 'hono';
import {
  csvBody,
  csvDownload,
  csvUpload,
  datedFilename,
  escapeCSV,
  importResults,
  insertRows,
  parseCsv,
  type ImportError,
  type MappedRow
} from '../csv';
import type { Env } from '../index';

const donators = new Hono<{ Bindings: Env; Variables: { user: JwtUser } }>();

const requireAdmin = async (c: Context<{ Bindings: Env; Variables: { user: JwtUser } }>, next: Next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Acesso restrito a administradores.' }, 403);
  }
  await next();
};

// ---------------------------------------------------------------------------
// CSV — espelho de csvDonatorService.{exportDonatorsToCSV,importDonatorsFromCSV}
// ---------------------------------------------------------------------------

const CSV_HEADERS = [
  'ID',
  'Nome',
  'Tag',
  'NUSP (user_id)',
  'ID do Livro',
  'Tipo de Doação',
  'Valor (R$)',
  'Contato',
  'Observações',
  'Data da Doação'
];
const CSV_REQUIRED_FIELDS = ['name', 'donation_type'];

type DonatorImportRow = {
  name: string;
  tag: string | null;
  user_id: number | null;
  book_id: number | null;
  donation_type: string;
  amount: number | null;
  contact: string | null;
  notes: string | null;
};

/** Espelho do mapRow de importDonatorsFromCSV (validação de tipo inclusa). */
function mapDonatorRow(donatorData: Record<string, string>): DonatorImportRow {
  const type = String(donatorData.donation_type || '').toLowerCase();
  if (!['book', 'money'].includes(type)) {
    throw new Error('Tipo de doação deve ser "book" ou "money"');
  }
  return {
    name: String(donatorData.name || '').trim(),
    tag: donatorData.tag ? String(donatorData.tag).trim() : null,
    user_id: donatorData.user_id ? parseInt(donatorData.user_id, 10) : null,
    book_id: donatorData.book_id ? parseInt(donatorData.book_id, 10) : null,
    donation_type: type,
    amount: donatorData.amount ? parseFloat(donatorData.amount) : null,
    contact: donatorData.contact ? String(donatorData.contact).trim() : null,
    notes: donatorData.notes ? String(donatorData.notes).trim() : null
  };
}

/**
 * O SQLite do VPS rodava com FK desligada e aceitava user_id/book_id inexistentes;
 * o D1 sempre valida, e uma FK quebrada derrubaria o lote inteiro. Por isso as
 * referências são conferidas antes, em 2 queries, com erro atribuído à linha.
 */
async function checkDonatorReferences(
  db: D1Database,
  mapped: MappedRow<DonatorImportRow>[]
): Promise<{ ready: MappedRow<DonatorImportRow>[]; errors: ImportError[] }> {
  const needsUsers = mapped.some((item) => item.entity.user_id !== null);
  const needsBooks = mapped.some((item) => item.entity.book_id !== null);

  const userIds = needsUsers
    ? new Set((await all<{ id: number }>(db, 'SELECT id FROM users')).map((row) => Number(row.id)))
    : new Set<number>();
  const bookIds = needsBooks
    ? new Set((await all<{ id: number }>(db, 'SELECT id FROM books')).map((row) => Number(row.id)))
    : new Set<number>();

  const ready: MappedRow<DonatorImportRow>[] = [];
  const errors: ImportError[] = [];

  for (const item of mapped) {
    const { user_id: userId, book_id: bookId } = item.entity;
    if (userId !== null && (Number.isNaN(userId) || !userIds.has(userId))) {
      errors.push({ row: item.row, error: `Usuário não encontrado para user_id: ${userId}` });
      continue;
    }
    if (bookId !== null && (Number.isNaN(bookId) || !bookIds.has(bookId))) {
      errors.push({ row: item.row, error: `Livro não encontrado para book_id: ${bookId}` });
      continue;
    }
    ready.push(item);
  }

  return { ready, errors };
}

donators.get('/export/csv', async (c) => {
  try {
    const rows = await all<Record<string, unknown>>(c.env.DB, 'SELECT * FROM donators ORDER BY created_at DESC');
    const content = csvBody(
      CSV_HEADERS,
      rows.map((donator) => [
        String(donator.id || ''),
        escapeCSV(donator.name || ''),
        escapeCSV(donator.tag || ''),
        String(donator.user_id || ''),
        String(donator.book_id || ''),
        String(donator.donation_type || ''),
        String(donator.amount || ''),
        escapeCSV(donator.contact || ''),
        escapeCSV(donator.notes || ''),
        String(donator.created_at || '')
      ])
    );
    return csvDownload(c, datedFilename('doadores'), content);
  } catch (error) {
    return c.json({ success: false, message: (error as Error).message }, 500);
  }
});

donators.post('/import/csv', authenticateToken(), requireAdmin, async (c) => {
  const text = await csvUpload(c);
  if (text === null) {
    return c.json({ success: false, message: 'Nenhum arquivo CSV fornecido' }, 400);
  }

  try {
    const { mapped, errors: parseErrors } = parseCsv({
      text,
      requiredFields: CSV_REQUIRED_FIELDS,
      mapRow: mapDonatorRow
    });
    const { ready, errors: referenceErrors } = await checkDonatorReferences(c.env.DB, mapped);
    const { inserted, errors: insertErrors } = await insertRows(c.env.DB, ready, (donator) => ({
      sql: `INSERT INTO donators (user_id, name, tag, book_id, donation_type, amount, contact, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        donator.user_id,
        donator.name,
        donator.tag,
        donator.book_id,
        donator.donation_type,
        donator.amount,
        donator.contact,
        donator.notes
      ]
    }));

    return c.json(importResults(inserted.length, parseErrors, referenceErrors, insertErrors), 200);
  } catch (error) {
    return c.json({ success: false, message: (error as Error).message }, 500);
  }
});

donators.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  try {
    const donationType = String((body as any)?.donation_type || '').toLowerCase();
    if (!['book', 'money'].includes(donationType)) {
      throw new Error('Tipo de doação deve ser "book" ou "money"');
    }

    const {
      user_id = null,
      name = null,
      tag = null,
      book_id = null,
      amount = null,
      contact = null,
      notes = null
    } = (body ?? {}) as Record<string, unknown>;

    const result = await run(
      c.env.DB,
      `INSERT INTO donators (user_id, name, tag, book_id, donation_type, amount, contact, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id ?? null, name ?? null, tag ?? null, book_id ?? null, donationType, amount ?? null, contact ?? null, notes ?? null]
    );
    return c.json({ id: result.meta.last_row_id }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

donators.delete('/:id', async (c) => {
  try {
    await run(c.env.DB, 'DELETE FROM donators WHERE id = ?', [c.req.param('id')]);
    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

donators.get('/wall', async (c) => {
  try {
    const rows = await all(
      c.env.DB,
      `SELECT
          d.name, d.tag, d.donation_type, d.book_id, d.amount, d.created_at,
          b.title AS book_title, b.authors AS book_authors, b.code AS book_code
       FROM donators d
       LEFT JOIN books b ON d.book_id = b.id
       WHERE d.name IS NOT NULL AND d.name != ''
       ORDER BY d.name ASC, d.created_at DESC`
    );
    return c.json(rows);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

donators.get('/filter', async (c) => {
  try {
    // Normalização igual ao filterDonatorService: isUser só entra se presente na query.
    const rawIsUser = c.req.query('isUser');
    const isUser = rawIsUser !== undefined ? rawIsUser === 'true' : undefined;
    const donationType = c.req.query('donationType') || undefined;
    const name = c.req.query('name') || undefined;

    let query = 'SELECT * FROM donators WHERE 1=1';
    const params: unknown[] = [];

    if (isUser !== undefined) {
      query += isUser ? ' AND user_id IS NOT NULL' : ' AND user_id IS NULL';
    }
    if (donationType) {
      query += ' AND donation_type = ?';
      params.push(donationType);
    }
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }

    query += ' ORDER BY created_at DESC';
    return c.json(await all(c.env.DB, query, params));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

donators.get('/', async (c) => {
  try {
    return c.json(await all(c.env.DB, 'SELECT * FROM donators ORDER BY created_at DESC'));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

donators.get('/:id', async (c) => {
  try {
    const donator = await first(c.env.DB, 'SELECT * FROM donators WHERE id = ?', [c.req.param('id')]);
    if (!donator) {
      return c.json({ error: 'Donator not found' }, 404);
    }
    return c.json(donator);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

export default donators;
