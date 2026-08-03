/**
 * Porte das rotas de LEITURA de /api/books do Express (catalogHandlers + evaluationHandlers)
 * mais o par de CSV (GET /export/csv e POST /import/csv).
 * Contrato espelhado de backend/src/models/library/books/modules/catalogModelBridge.js —
 * mesmos formatos de resposta e códigos de status. Demais rotas de escrita ainda no Express.
 * Obs.: como no Express, as rotas de CSV NÃO exigem autenticação.
 */
import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import type { Context, Next } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { all, batch, first, run } from '../db';
import { authenticateToken, type JwtUser } from '../auth';
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

/**
 * Espelho de _generateBookCode no caminho do formulario de admin, que manda
 * selectedBookcode quando o livro e um exemplar/volume de um codigo ja existente.
 */
function bookCodeFromSelected(book: BookRow, selectedBookcode: string): string {
  const match = selectedBookcode.match(/ v\.(\d+)$/i);
  const referenceVolume = match ? parseInt(match[1], 10) : 0;

  if (book.volume === referenceVolume) return selectedBookcode;

  const baseCode = selectedBookcode.replace(/ v\.\d+$/i, '');
  if (book.volume === 0) return baseCode;
  return `${baseCode} v.${parseInt(String(book.volume), 10)}`;
}

/**
 * Espelho de addBook para uma linha só (POST /api/books). Onde o Express batia no
 * banco em loop (getBookById por EAN candidato), aqui os ids vêm em 1 query — o
 * plano free do Worker conta cada query D1 como subrequest.
 */
async function prepareSingleBook(
  db: D1Database,
  bookData: BookRow,
  selectedBookcode: string | null
): Promise<BookRow> {
  const areaCode = validateArea(bookData.area);
  validateSubarea(areaCode, bookData.subarea);

  let code = bookData.code ? String(bookData.code) : null;
  if (!code && selectedBookcode) {
    code = bookCodeFromSelected(bookData, selectedBookcode);
  }
  if (!code) {
    const lastCodes = new Map<string, string>();
    const last = await first<{ code: string }>(
      db,
      'SELECT code FROM books WHERE area = ? AND subarea = ? ORDER BY code DESC LIMIT 1',
      [bookData.area, bookData.subarea]
    );
    if (last?.code) lastCodes.set(`${bookData.area}|${bookData.subarea}`, last.code);
    code = generateBookCode(bookData, lastCodes);
  }

  let id: number;
  if (bookData.id && String(bookData.id).length === 13) {
    id = Number(bookData.id);
  } else {
    const existingIds = new Set(
      (await all<{ id: number }>(db, 'SELECT id FROM books')).map((row) => Number(row.id))
    );
    id = generateUniqueEan13(existingIds);
  }

  if (!bookData.edition) bookData.edition = 1;

  for (const field of ALL_FIELDS) {
    const value = bookData[field];
    if (typeof value === 'string') bookData[field] = value.replace(/\s+/g, ' ').trim();
  }

  const bookToInsert: BookRow = {};
  for (const field of ALL_FIELDS) {
    if (field === 'id') bookToInsert.id = id;
    else if (field === 'code') bookToInsert.code = code;
    else bookToInsert[field] = bookData[field] || (field === 'status' ? 'disponível' : null);
  }
  return bookToInsert;
}

type Vars = { Bindings: Env; Variables: { user: JwtUser } };

/**
 * Divergencia DELIBERADA do Express: la as rotas de escrita de catalogo eram abertas,
 * o que no VPS ficava atras da rede e aqui ficaria exposto na internet. Toda escrita
 * (adicionar/remover livro, reserva didatica e import CSV) passa a exigir admin.
 * Leitura e GET /export/csv seguem publicos — o catalogo ja e publico e o
 * exportBooksToCSV do frontend nao manda token.
 */
const requireAdmin = async (c: Context<Vars>, next: Next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Acesso restrito a administradores.' }, 403);
  }
  await next();
};

const books = new Hono<Vars>();

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

books.post('/import/csv', authenticateToken(), requireAdmin, async (c) => {
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

books.post('/', authenticateToken(), requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { bookData, selectedBookcode } = body as { bookData?: BookRow; selectedBookcode?: string | null };

  try {
    const bookToInsert = await prepareSingleBook(c.env.DB, bookData ?? {}, selectedBookcode ?? null);
    const result = await run(
      c.env.DB,
      `INSERT INTO books (${ALL_FIELDS.join(', ')}) VALUES (${ALL_FIELDS.map(() => '?').join(', ')})`,
      ALL_FIELDS.map((field) => bookToInsert[field])
    );
    return c.json({ lastID: result.meta.last_row_id, changes: result.meta.changes }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

/** Espelho de setReservedStatus: erra se o livro ja estava no estado pedido. */
async function setReservedStatus(c: Context<Vars>, status: boolean) {
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const { bookId } = body as { bookId?: number };
  if (!bookId) {
    return c.json({ success: false, message: 'Parametros invalidos: bookId e obrigatorio' }, 400);
  }

  try {
    const book = await first<{ title: string; status: string }>(
      c.env.DB,
      'SELECT title, status FROM books WHERE id = ?',
      [bookId]
    );
    if (!book) {
      throw new Error('Livro não encontrado. Verifique o código de barras fornecido e tente novamente.');
    }

    const indifferent = (status && book.status === 'reservado') || (!status && book.status !== 'reservado');
    if (indifferent) {
      throw new Error(`Livro "${book.title}" ${status ? 'já' : 'não'} estava reservado`);
    }

    await run(c.env.DB, 'UPDATE books SET status = ? WHERE id = ?', [status ? 'reservado' : 'disponível', bookId]);
    return c.json({ success: true, book: book.title, is_reserved: status }, 200);
  } catch (error) {
    return c.json({ success: false, message: (error as Error).message }, 400);
  }
}

books.post('/reserve', authenticateToken(), requireAdmin, (c) => setReservedStatus(c, true));
books.post('/unreserve', authenticateToken(), requireAdmin, (c) => setReservedStatus(c, false));

books.delete('/reserve/clear', authenticateToken(), requireAdmin, async (c) => {
  try {
    const result = await run(c.env.DB, "UPDATE books SET status = 'disponível' WHERE status = 'reservado'");
    return c.json(
      {
        success: true,
        message: 'Todos os livros foram removidos da reserva didática',
        affectedRows: result.meta.changes
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

// ---------------------------------------------------------------------------
// Avaliacoes — escrita (espelho de evaluationService + evaluationValidation)
// ---------------------------------------------------------------------------

class EvaluationError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
  }
}

const EVALUATION_STATUS: Record<string, ContentfulStatusCode> = {
  BOOK_ID_REQUIRED: 400,
  BOOK_NOT_FOUND: 404,
  INVALID_EVALUATION_EMPTY: 400,
  INVALID_RATING_FORMAT: 400,
  USER_ALREADY_EVALUATED: 409,
  EVALUATION_NOT_FOUND_OR_FORBIDDEN: 404,
  USER_EVALUATION_NOT_FOUND: 404,
  EVALUATION_NOT_FOUND: 404,
  LIKE_OWN_EVALUATION_FORBIDDEN: 400
};

/** Espelho de mapEvaluationErrorToHttp: só códigos conhecidos vazam a mensagem. */
function evaluationError(c: Context, error: unknown) {
  const status = error instanceof EvaluationError ? EVALUATION_STATUS[error.code] : undefined;
  if (!status) return c.json({ error: 'Erro interno ao processar avaliacao' }, 500);
  return c.json({ error: (error as Error).message }, status);
}

const RATING_FIELDS = [
  'ratingGeral',
  'ratingQualidade',
  'ratingLegibilidade',
  'ratingUtilidade',
  'ratingPrecisao'
] as const;

type EvaluationPayload = Partial<Record<(typeof RATING_FIELDS)[number], number | null>> & {
  bookId?: number;
  comentario?: string | null;
  isAnonymous?: boolean;
};

/** Espelho de _validateRating: 0.5 a 5.0 em incrementos de 0.5. */
function isValidRating(rating: unknown): boolean {
  if (rating === null || rating === undefined) return true;
  const num = parseFloat(String(rating));
  if (Number.isNaN(num)) return false;
  if (num < 0.5 || num > 5.0) return false;
  return (num * 2) % 1 === 0;
}

function validateEvaluationPayload(payload: EvaluationPayload) {
  const hasRating = RATING_FIELDS.some((field) => payload[field] !== null && payload[field] !== undefined);
  const hasComment = Boolean(payload.comentario && String(payload.comentario).trim().length > 0);
  if (!hasRating && !hasComment) {
    throw new EvaluationError('Forneca pelo menos um rating ou um comentario', 'INVALID_EVALUATION_EMPTY');
  }

  for (const field of RATING_FIELDS) {
    if (!isValidRating(payload[field])) {
      throw new EvaluationError(
        `Rating ${field} deve ser entre 0.5 e 5.0, em incrementos de 0.5`,
        'INVALID_RATING_FORMAT'
      );
    }
  }
}

books.get('/evaluations/mine', authenticateToken(), async (c) => {
  try {
    const rows = await all(
      c.env.DB,
      `SELECT e.*, b.title as book_title, b.authors as book_authors, b.code as book_code
       FROM book_evaluations e
       INNER JOIN books b ON e.book_id = b.id
       WHERE e.user_id = ?
       ORDER BY e.updated_at DESC`,
      [c.get('user').id]
    );
    return c.json(rows);
  } catch (_error) {
    return c.json({ error: 'Erro ao buscar suas avaliacoes' }, 500);
  }
});

books.post('/evaluations', authenticateToken(), async (c) => {
  const payload = (await c.req.json().catch(() => ({}))) as EvaluationPayload;
  try {
    if (!payload.bookId) throw new EvaluationError('ID do livro e obrigatorio', 'BOOK_ID_REQUIRED');
    validateEvaluationPayload(payload);

    const book = await first(c.env.DB, 'SELECT id FROM books WHERE id = ?', [payload.bookId]);
    if (!book) throw new EvaluationError('Livro nao encontrado', 'BOOK_NOT_FOUND');

    try {
      const result = await run(
        c.env.DB,
        `INSERT INTO book_evaluations (
           book_id, user_id, rating_geral, rating_qualidade, rating_legibilidade,
           rating_utilidade, rating_precisao, comentario, is_anonymous
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.bookId,
          c.get('user').id,
          payload.ratingGeral || null,
          payload.ratingQualidade || null,
          payload.ratingLegibilidade || null,
          payload.ratingUtilidade || null,
          payload.ratingPrecisao || null,
          payload.comentario?.trim() || null,
          payload.isAnonymous ? 1 : 0
        ]
      );
      return c.json({ id: result.meta.last_row_id }, 201);
    } catch (error) {
      if ((error as Error).message.includes('UNIQUE constraint failed')) {
        throw new EvaluationError('Voce ja avaliou este livro. Use a opcao de editar.', 'USER_ALREADY_EVALUATED');
      }
      throw error;
    }
  } catch (error) {
    return evaluationError(c, error);
  }
});

books.put('/evaluations/:id', authenticateToken(), async (c) => {
  const payload = (await c.req.json().catch(() => ({}))) as EvaluationPayload;
  const evaluationId = Number(c.req.param('id'));
  try {
    validateEvaluationPayload(payload);

    const result = await run(
      c.env.DB,
      `UPDATE book_evaluations SET
         rating_geral = ?, rating_qualidade = ?, rating_legibilidade = ?,
         rating_utilidade = ?, rating_precisao = ?, comentario = ?,
         is_anonymous = COALESCE(?, is_anonymous),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        payload.ratingGeral || null,
        payload.ratingQualidade || null,
        payload.ratingLegibilidade || null,
        payload.ratingUtilidade || null,
        payload.ratingPrecisao || null,
        payload.comentario?.trim() || null,
        payload.isAnonymous !== undefined ? (payload.isAnonymous ? 1 : 0) : null,
        evaluationId,
        c.get('user').id
      ]
    );
    if (!result.meta.changes) {
      throw new EvaluationError(
        'Avaliacao nao encontrada ou sem permissao para editar',
        'EVALUATION_NOT_FOUND_OR_FORBIDDEN'
      );
    }
    return c.json({ id: evaluationId, updated: true });
  } catch (error) {
    return evaluationError(c, error);
  }
});

books.delete('/evaluations/:id', authenticateToken(), async (c) => {
  try {
    const result = await run(c.env.DB, 'DELETE FROM book_evaluations WHERE id = ? AND user_id = ?', [
      Number(c.req.param('id')),
      c.get('user').id
    ]);
    if (!result.meta.changes) {
      throw new EvaluationError(
        'Avaliacao nao encontrada ou sem permissao para excluir',
        'EVALUATION_NOT_FOUND_OR_FORBIDDEN'
      );
    }
    return c.json({ message: 'Avaliacao excluida com sucesso' });
  } catch (error) {
    return evaluationError(c, error);
  }
});

books.post('/evaluations/:id/like', authenticateToken(), async (c) => {
  const evaluationId = Number(c.req.param('id'));
  const userId = c.get('user').id;
  try {
    const evaluation = await first<{ user_id: number }>(
      c.env.DB,
      'SELECT user_id FROM book_evaluations WHERE id = ?',
      [evaluationId]
    );
    if (!evaluation) throw new EvaluationError('Avaliacao nao encontrada', 'EVALUATION_NOT_FOUND');
    if (evaluation.user_id === userId) {
      throw new EvaluationError('Voce nao pode dar like na propria avaliacao', 'LIKE_OWN_EVALUATION_FORBIDDEN');
    }

    const existingVote = await first(
      c.env.DB,
      'SELECT id FROM book_evaluation_votes WHERE evaluation_id = ? AND user_id = ?',
      [evaluationId, userId]
    );

    // batch() mantem voto e contador em sincronia (o Express fazia 2 writes soltos).
    if (existingVote) {
      await batch(c.env.DB, [
        {
          sql: 'DELETE FROM book_evaluation_votes WHERE evaluation_id = ? AND user_id = ?',
          params: [evaluationId, userId]
        },
        { sql: 'UPDATE book_evaluations SET helpful_count = helpful_count - 1 WHERE id = ?', params: [evaluationId] }
      ]);
      return c.json({ liked: false });
    }

    await batch(c.env.DB, [
      {
        sql: 'INSERT INTO book_evaluation_votes (evaluation_id, user_id) VALUES (?, ?)',
        params: [evaluationId, userId]
      },
      { sql: 'UPDATE book_evaluations SET helpful_count = helpful_count + 1 WHERE id = ?', params: [evaluationId] }
    ]);
    return c.json({ liked: true });
  } catch (error) {
    return evaluationError(c, error);
  }
});

books.get('/:id/evaluations/mine', authenticateToken(), async (c) => {
  try {
    const evaluation = await first(
      c.env.DB,
      'SELECT e.* FROM book_evaluations e WHERE e.user_id = ? AND e.book_id = ?',
      [c.get('user').id, Number(c.req.param('id'))]
    );
    if (!evaluation) {
      throw new EvaluationError('Voce ainda nao avaliou este livro', 'USER_EVALUATION_NOT_FOUND');
    }
    return c.json(evaluation);
  } catch (error) {
    return evaluationError(c, error);
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

books.delete('/:id', authenticateToken(), requireAdmin, async (c) => {
  try {
    await run(c.env.DB, 'DELETE FROM books WHERE id = ?', [c.req.param('id')]);
    return c.json({ success: true, message: 'Livro removido com sucesso' }, 200);
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
