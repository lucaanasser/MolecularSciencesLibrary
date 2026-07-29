/**
 * Porte de /api/donators do Express (roteador unificado routes/library/donators/DonatorsRoutes.js).
 * Contrato espelhado da cadeia DonatorsController (command/query handlers) ->
 * DonatorsService -> DonatorsModel (core + query).
 * Rotas de CSV (GET /export/csv e POST /import/csv, com multer) NÃO foram portadas —
 * caem no 404 "Endpoint ainda não migrado" do index até a migração de arquivos.
 * Obs.: como no Express, POST / e DELETE /:id NÃO exigem autenticação.
 */
import { Hono } from 'hono';
import { all, first, run } from '../db';
import type { Env } from '../index';

const donators = new Hono<{ Bindings: Env }>();

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
