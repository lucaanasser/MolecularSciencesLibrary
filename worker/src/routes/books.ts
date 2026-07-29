/**
 * Porte das rotas de LEITURA de /api/books do Express (catalogHandlers + evaluationHandlers)
 * mais o par de CSV (GET /export/csv e POST /import/csv).
 * Contrato espelhado de backend/src/models/library/books/modules/catalogModelBridge.js —
 * mesmos formatos de resposta e códigos de status. Demais rotas de escrita ainda no Express.
 * Obs.: como no Express, as rotas de CSV NÃO exigem autenticação.
 */
import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { all, first } from '../db';
import { areaMapping, subareaMapping, validateArea, validateSubarea } from '../bookAreas';
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

// ---------------------------------------------------------------------------
// CSV — espelho de catalogServiceBridge.{importBooksFromCSV,exportBooksToCSV}
// ---------------------------------------------------------------------------

const ALL_FIELDS = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
const CSV_REQUIRED_FIELDS = ['area', 'subarea', 'title', 'authors', 'edition', 'volume', 'language'];

type BookRow = Record<string, string | number | null>;

/** Espelho do mapRow de importBooksFromCSV: trim, inteiros e status em minusculas. */
function mapBookRow(rowData: Record<string, string>): BookRow {
  const row: BookRow = {};
  for (const field in rowData) {
    let value: string | number = rowData[field];
    if (typeof value === 'string') value = value.trim();
    if ((field === 'id' || field === 'edition' || field === 'volume') && value) {
      value = parseInt(String(value), 10);
    }
    if (field === 'status' && value) {
      value = String(value).toLowerCase();
    }
    row[field] = value || null;
  }
  return row;
}

/** Espelho de _generateBookCode (sem selectedBookcode, que o CSV nunca envia). */
function generateBookCode(book: BookRow, lastCodes: Map<string, string>): string {
  const lastCode = lastCodes.get(`${book.area}|${book.subarea}`);
  let seq = '01';
  if (lastCode) {
    const parts = lastCode.split(' ')[0].split('.');
    if (parts.length < 2) {
      throw new Error(`Formato de código inesperado no último livro encontrado: ${lastCode}`);
    }
    seq = (parseInt(parts[1], 10) + 1).toString().padStart(2, '0');
  }

  const areaCode = areaMapping[String(book.area)] || 'XXX';
  const subareaNum = subareaMapping[areaCode]?.[String(book.subarea)] || 0;
  const baseCode = `${areaCode}-${String(subareaNum).padStart(2, '0')}.${seq}`;

  return book.volume && book.volume !== 0 ? `${baseCode} v.${book.volume}` : baseCode;
}

/** Espelho de _generateUniqueEAN13, checando contra os ids ja carregados em memoria. */
function generateUniqueEan13(existingIds: Set<number>): number {
  const completeEAN13 = (twelveDigitBarcode: string): number => {
    let sum = 0;
    for (let index = 0; index < 12; index += 1) {
      sum += parseInt(twelveDigitBarcode[index], 10) * (index % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return Number(`${twelveDigitBarcode}${check}`);
  };

  let ean: number;
  do {
    let twelveDigitBarcode = '';
    for (let index = 0; index < 12; index += 1) {
      twelveDigitBarcode += Math.floor(Math.random() * 10).toString();
    }
    ean = completeEAN13(twelveDigitBarcode);
  } while (existingIds.has(ean));

  return ean;
}

/**
 * Espelho de addBook para o lote inteiro: valida area/subarea, gera code e id e
 * normaliza os campos. O Express consultava o banco por linha (getLastBookInSubarea
 * e getBookById); aqui os ids e o ultimo code de cada subarea vem em 2 queries e
 * são atualizados em memoria a cada linha, o que dá o mesmo resultado sequencial.
 */
async function prepareBooks(
  db: D1Database,
  mapped: MappedRow<BookRow>[]
): Promise<{ ready: MappedRow<BookRow>[]; errors: ImportError[] }> {
  const existingIds = new Set(
    (await all<{ id: number }>(db, 'SELECT id FROM books')).map((row) => Number(row.id))
  );
  const lastCodes = new Map<string, string>();
  for (const row of await all<{ area: string; subarea: string; code: string }>(
    db,
    'SELECT area, subarea, MAX(code) AS code FROM books GROUP BY area, subarea'
  )) {
    if (row.code) lastCodes.set(`${row.area}|${row.subarea}`, row.code);
  }

  const ready: MappedRow<BookRow>[] = [];
  const errors: ImportError[] = [];

  for (const item of mapped) {
    try {
      const book = item.entity;
      const areaCode = validateArea(book.area);
      validateSubarea(areaCode, book.subarea);

      const code = book.code ? String(book.code) : generateBookCode(book, lastCodes);
      const id =
        book.id && String(book.id).length === 13 ? Number(book.id) : generateUniqueEan13(existingIds);

      if (!book.edition) book.edition = 1;

      for (const field of ALL_FIELDS) {
        const value = book[field];
        if (typeof value === 'string') book[field] = value.replace(/\s+/g, ' ').trim();
      }

      const bookToInsert: BookRow = {};
      for (const field of ALL_FIELDS) {
        if (field === 'id') bookToInsert.id = id;
        else if (field === 'code') bookToInsert.code = code;
        else bookToInsert[field] = book[field] || (field === 'status' ? 'disponível' : null);
      }

      existingIds.add(id);
      const key = `${book.area}|${book.subarea}`;
      const currentLast = lastCodes.get(key);
      if (!currentLast || code > currentLast) lastCodes.set(key, code);

      ready.push({ row: item.row, entity: bookToInsert });
    } catch (error) {
      errors.push({ row: item.row, error: (error as Error).message });
    }
  }

  return { ready, errors };
}

const books = new Hono<{ Bindings: Env }>();

books.get('/export/csv', async (c) => {
  try {
    const rows = await all<Record<string, unknown>>(c.env.DB, `SELECT ${ALL_FIELDS.join(', ')} FROM books`);
    const content = csvBody(
      ALL_FIELDS,
      rows.map((book) => ALL_FIELDS.map((field) => escapeCSV(book[field] || '')))
    );
    return csvDownload(c, datedFilename('catalogo_livros'), content);
  } catch (error) {
    return c.json({ success: false, message: (error as Error).message }, 500);
  }
});

books.post('/import/csv', async (c) => {
  const text = await csvUpload(c);
  if (text === null) {
    return c.json({ success: false, message: 'Nenhum arquivo CSV fornecido' }, 400);
  }

  try {
    const { mapped, errors: parseErrors } = parseCsv({
      text,
      requiredFields: CSV_REQUIRED_FIELDS,
      mapRow: mapBookRow
    });
    const { ready, errors: prepareErrors } = await prepareBooks(c.env.DB, mapped);
    const { inserted, errors: insertErrors } = await insertRows(c.env.DB, ready, (book) => ({
      sql: `INSERT INTO books (${ALL_FIELDS.join(', ')}) VALUES (${ALL_FIELDS.map(() => '?').join(', ')})`,
      params: ALL_FIELDS.map((field) => book[field])
    }));

    const result = importResults(inserted.length, parseErrors, prepareErrors, insertErrors);
    if (result.failed > 0) {
      let errorMsg = `Importacao de livros concluida com ${result.success} livros importados com sucesso e ${result.failed} erros.`;
      for (const err of result.errors) errorMsg += `\nLinha ${err.row}: ${err.error}`;
      return c.json({ success: false, message: errorMsg }, 200);
    }

    return c.json(
      {
        success: true,
        message: `Importacao de livros concluida com ${result.success} livros importados com sucesso e ${result.failed} falhas.`
      },
      200
    );
  } catch (error) {
    return c.json({ success: false, message: (error as Error).message }, 500);
  }
});

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
