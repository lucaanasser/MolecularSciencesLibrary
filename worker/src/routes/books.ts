/**
 * Porte das rotas de LEITURA de /api/books do Express (catalogHandlers + evaluationHandlers).
 * Contrato espelhado de backend/src/models/library/books/modules/catalogModelBridge.js —
 * mesmos formatos de resposta e códigos de status. Rotas de escrita ainda no Express.
 */
import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { all, first } from '../db';
import type { Env } from '../index';

const FILTERS = ['q', 'area', 'subarea', 'status'] as const;
const BASIC_FIELDS = ['id', 'code', 'title', 'authors', 'area'];

function buildFilterQuery(query: Record<string, string[]>) {
  const params: unknown[] = [];
  const conditions: string[] = [];

  for (const filter of FILTERS) {
    const raw = query[filter];
    if (!raw || raw.length === 0) continue;
    const values = raw.flatMap((v) => String(v).split(',')).filter(Boolean);
    if (!values.length) continue;

    if (filter === 'q') {
      const q = values.join(',');
      conditions.push(
        '(title LIKE ? COLLATE NOCASE OR authors LIKE ? COLLATE NOCASE OR subtitle LIKE ? COLLATE NOCASE OR code LIKE ? COLLATE NOCASE)'
      );
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
      continue;
    }

    conditions.push(`${filter} IN (${values.map(() => '?').join(',')})`);
    params.push(...values);
  }

  return { where: conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '', params };
}

const GET_BOOKS_SQL = (where: string) => `
  SELECT *,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM loans l
        WHERE l.book_id = books.id
          AND l.returned_at IS NULL
          AND l.due_date IS NOT NULL
          AND l.due_date < CURRENT_TIMESTAMP
      ) THEN 'atrasado'
      ELSE status
    END as display_status
  FROM books${where}
`;

const books = new Hono<{ Bindings: Env }>();

books.get('/search', async (c) => {
  const q = c.req.query('q');
  const limit = Number(c.req.query('limit') ?? 10);
  if (!q || q.trim().length === 0) return c.json([]);

  try {
    const words = q.trim().split(/\s+/);
    const conditions = words.map(() => '(title LIKE ? OR authors LIKE ? OR code LIKE ?)').join(' AND ');
    const sql = `
      SELECT ${BASIC_FIELDS.join(', ')}
      FROM books
      WHERE ${conditions}
      ORDER BY
        CASE
          WHEN ${words.map(() => 'title LIKE ?').join(' AND ')} THEN 1
          WHEN ${words.map(() => 'authors LIKE ?').join(' AND ')} THEN 2
          WHEN ${words.map(() => 'code LIKE ?').join(' AND ')} THEN 3
          ELSE 4
        END,
        title ASC
      LIMIT ?
    `;
    const params = [
      ...words.flatMap((w) => [`%${w}%`, `%${w}%`, `%${w}%`]),
      ...words.map((w) => `%${w}%`),
      ...words.map((w) => `%${w}%`),
      ...words.map((w) => `%${w}%`),
      limit
    ];
    return c.json(await all(c.env.DB, sql, params));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

books.get('/count', async (c) => {
  try {
    const { where, params } = buildFilterQuery(queriesOf(c.req.raw.url));
    const row = await first<{ count: number }>(c.env.DB, `SELECT COUNT(*) as count FROM books${where}`, params);
    return c.json({ count: row?.count ?? 0 });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

books.get('/reserved', async (c) => {
  try {
    const { where, params } = buildFilterQuery({ status: ['reservado'] });
    return c.json(await all(c.env.DB, GET_BOOKS_SQL(where), params));
  } catch (error) {
    return c.json({ success: false, message: (error as Error).message }, 500);
  }
});

books.get('/by-code/:code', async (c) => {
  try {
    const sql = `
      SELECT b.*, d.name AS donator_name, d.tag AS donator_tag
      FROM books b
      LEFT JOIN donators d ON d.book_id = b.id AND d.donation_type = 'book'
      WHERE b.code = ?
    `;
    return c.json(await all(c.env.DB, sql, [c.req.param('code')]));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

books.get('/:id/evaluations/stats', async (c) => {
  try {
    const stats = await first(
      c.env.DB,
      `SELECT
        COUNT(*) as total_avaliacoes,
        ROUND(AVG(rating_geral), 1) as media_geral,
        ROUND(AVG(rating_qualidade), 1) as media_qualidade,
        ROUND(AVG(rating_legibilidade), 1) as media_legibilidade,
        ROUND(AVG(rating_utilidade), 1) as media_utilidade,
        ROUND(AVG(rating_precisao), 1) as media_precisao,
        COUNT(CASE WHEN comentario IS NOT NULL AND comentario != '' THEN 1 END) as total_comentarios
      FROM book_evaluations
      WHERE book_id = ?`,
      [Number(c.req.param('id'))]
    );
    return c.json(stats);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar ratings' }, 500);
  }
});

books.get('/:id/evaluations', async (c) => {
  // optionalAuth: token inválido/ausente não bloqueia, só zera o usuário atual.
  let currentUserId: number | null = null;
  const authHeader = c.req.header('authorization');
  if (authHeader) {
    try {
      const payload = await verify(authHeader.split(' ')[1], c.env.JWT_SECRET || 'sua_chave_secreta', 'HS256');
      currentUserId = (payload as { id?: number }).id ?? null;
    } catch (_error) {
      // Mantém endpoint público, igual ao Express.
    }
  }

  try {
    const sql = `
      SELECT
        e.id, e.book_id, e.user_id,
        e.rating_geral, e.rating_qualidade, e.rating_legibilidade, e.rating_utilidade, e.rating_precisao,
        e.comentario, e.is_anonymous, e.helpful_count, e.created_at, e.updated_at,
        CASE WHEN e.is_anonymous = 1 THEN 'Anônimo' ELSE u.name END as user_name,
        CASE WHEN e.user_id = ? THEN 1 ELSE 0 END as is_own_evaluation,
        (SELECT COUNT(*) FROM book_evaluation_votes v WHERE v.evaluation_id = e.id AND v.user_id = ?) as user_has_voted
      FROM book_evaluations e
      INNER JOIN users u ON e.user_id = u.id
      WHERE e.book_id = ?
      ORDER BY e.helpful_count DESC, e.created_at DESC
    `;
    return c.json(await all(c.env.DB, sql, [currentUserId, currentUserId, Number(c.req.param('id'))]));
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar avaliacoes' }, 500);
  }
});

books.get('/:id', async (c) => {
  try {
    const book = await first(c.env.DB, 'SELECT * FROM books WHERE id = ?', [c.req.param('id')]);
    if (!book) {
      throw new Error('Livro não encontrado. Verifique o código de barras fornecido e tente novamente.');
    }
    return c.json(book, 200);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

books.get('/', async (c) => {
  try {
    const { where, params } = buildFilterQuery(queriesOf(c.req.raw.url));
    const results = await all(c.env.DB, GET_BOOKS_SQL(where), params);
    return c.json({ results, total: results.length });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

function queriesOf(url: string): Record<string, string[]> {
  const sp = new URL(url).searchParams;
  const out: Record<string, string[]> = {};
  for (const key of sp.keys()) {
    if (!out[key]) out[key] = sp.getAll(key);
  }
  return out;
}

export default books;
