/**
 * Porte de /api/virtual-bookshelf do Express (routes/library/virtualBookshelf/VirtualBookshelfRoutes.js).
 * Contrato espelhado da cadeia VirtualBookshelfController (query/command handlers) ->
 * VirtualBookshelfService (codeRules/shelfConfig/bookQueries/shelfManagement) ->
 * VirtualBookshelfModel (query/write). Inclui endpoints canônicos E legados (deprecated).
 * runInTransaction do updateShelvesConfig virou db.batch() (atômico em D1).
 */
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { all, batch, first, run } from '../db';
import { authenticateToken, type JwtUser } from '../auth';
import type { Env } from '../index';

type Ctx = Context<{ Bindings: Env; Variables: { user: JwtUser } }>;

// ---------------------------------------------------------------------------
// Constantes de classificação (espelho de services/library/virtualBookshelf/modules/constants.js)
// ---------------------------------------------------------------------------
const AREA_ORDER = ['BIO', 'QUI', 'FIS', 'MAT', 'CMP', 'VAR'];

const AREA_NAME_TO_CODE: Record<string, string> = {
  'Biologia': 'BIO',
  'Química': 'QUI',
  'Física': 'FIS',
  'Matemática': 'MAT',
  'Computação': 'CMP',
  'Variados': 'VAR'
};

// ---------------------------------------------------------------------------
// Regras de código (espelho de codeRules.js)
// ---------------------------------------------------------------------------
function parseBookCode(code: unknown): { area: string; subarea: number; sequential: number; volume: number } {
  try {
    if (!code) {
      return { area: '', subarea: 0, sequential: 0, volume: 0 };
    }

    const normalized = String(code).trim().replace(/\s+/g, ' ');
    const mainMatch = normalized.match(/^([A-Za-z]{3})-(\d{2})\.(\d{2})/);

    if (!mainMatch) {
      const parts = normalized.split('-v');
      const mainPart = parts[0] || normalized;
      const mainParts = mainPart.split('-');

      if (mainParts.length < 2) {
        return { area: mainPart, subarea: 0, sequential: 0, volume: 0 };
      }

      const area = mainParts[0];
      const subareaSeq = mainParts[1];
      const subareaSeqParts = subareaSeq.split('.');
      const subarea = parseInt(subareaSeqParts[0], 10) || 0;
      const sequential = parseInt(subareaSeqParts[1], 10) || 0;
      const volFallback = normalized.match(/(?:^|[\s-])v\.?([0-9]+)\s*$/i);
      const volume = volFallback ? parseInt(volFallback[1], 10) || 0 : 0;

      return { area, subarea, sequential, volume };
    }

    const area = mainMatch[1].toUpperCase();
    const subarea = parseInt(mainMatch[2], 10) || 0;
    const sequential = parseInt(mainMatch[3], 10) || 0;
    const volMatch = normalized.match(/(?:^|[\s-])v\.?([0-9]+)\s*$/i);
    const volume = volMatch ? parseInt(volMatch[1], 10) || 0 : 0;

    return { area, subarea, sequential, volume };
  } catch (_error) {
    return { area: '', subarea: 0, sequential: 0, volume: 0 };
  }
}

function compareBookCodes(codeA: unknown, codeB: unknown): number {
  const parsedA = parseBookCode(codeA);
  const parsedB = parseBookCode(codeB);

  const areaIndexA = AREA_ORDER.indexOf(parsedA.area);
  const areaIndexB = AREA_ORDER.indexOf(parsedB.area);

  if (areaIndexA !== areaIndexB) return areaIndexA - areaIndexB;
  if (parsedA.subarea !== parsedB.subarea) return parsedA.subarea - parsedB.subarea;
  if (parsedA.sequential !== parsedB.sequential) return parsedA.sequential - parsedB.sequential;
  return parsedA.volume - parsedB.volume;
}

function sortBooks<T extends { code?: unknown }>(books: T[]): T[] {
  return books.sort((a, b) => compareBookCodes(a.code, b.code));
}

function getPreviousCode(code: unknown): string | null {
  try {
    if (!code) return null;

    const parsed = parseBookCode(code);

    if (parsed.sequential > 1) {
      const previousSeq = (parsed.sequential - 1).toString().padStart(2, '0');
      const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
      return `${parsed.area}-${parsed.subarea.toString().padStart(2, '0')}.${previousSeq}${volumePart}`;
    }

    if (parsed.subarea > 1) {
      const previousSubarea = (parsed.subarea - 1).toString().padStart(2, '0');
      const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
      return `${parsed.area}-${previousSubarea}.99${volumePart}`;
    }

    const areaIndex = AREA_ORDER.indexOf(parsed.area);
    if (areaIndex > 0) {
      const previousArea = AREA_ORDER[areaIndex - 1];
      const volumePart = parsed.volume > 0 ? ` v.${parsed.volume}` : '';
      return `${previousArea}-99.99${volumePart}`;
    }

    return null;
  } catch (_error) {
    return null;
  }
}

function formatComparableCode(code: unknown): string {
  const { area, subarea, sequential, volume } = parseBookCode(code);
  if (!area) return '';
  const vol = volume > 0 ? `-v${volume}` : '';
  return `${area}-${subarea.toString().padStart(2, '0')}.${sequential.toString().padStart(2, '0')}${vol}`;
}

function isCodeInRange(bookCode: unknown, startCode: unknown, endCode: unknown): boolean {
  return compareBookCodes(bookCode, startCode) >= 0 && compareBookCodes(bookCode, endCode) <= 0;
}

// ---------------------------------------------------------------------------
// Config de prateleiras (espelho de shelfConfig.js)
// ---------------------------------------------------------------------------
function calculateEndCodes(shelves: any[]): any[] {
  const sortedShelves = [...shelves].sort((a, b) => {
    if (a.shelf_number !== b.shelf_number) return a.shelf_number - b.shelf_number;
    return a.shelf_row - b.shelf_row;
  });

  const result: any[] = [];

  for (let i = 0; i < sortedShelves.length; i += 1) {
    const currentShelf = { ...sortedShelves[i] };

    if (!currentShelf.book_code_start) {
      currentShelf.calculated_book_code_end = null;
      result.push(currentShelf);
      continue;
    }

    let nextShelfWithCode: any = null;
    for (let j = i + 1; j < sortedShelves.length; j += 1) {
      if (sortedShelves[j].book_code_start) {
        nextShelfWithCode = sortedShelves[j];
        break;
      }
    }

    if (nextShelfWithCode) {
      currentShelf.calculated_book_code_end = getPreviousCode(nextShelfWithCode.book_code_start);
    } else {
      currentShelf.calculated_book_code_end = currentShelf.book_code_end || null;
    }

    result.push(currentShelf);
  }

  return result;
}

async function getShelvesConfig(db: D1Database): Promise<any[]> {
  const shelves = await all<any>(db, 'SELECT * FROM virtual_bookshelf ORDER BY shelf_number, shelf_row');
  return calculateEndCodes(shelves);
}

// ---------------------------------------------------------------------------
// Consultas de livros (espelho de bookQueries.js + BooksModel.getAllBooks)
// ---------------------------------------------------------------------------
const GET_ALL_BOOKS_SQL = `
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
  FROM books
`;

async function getAllBooksOrdered(db: D1Database): Promise<any[]> {
  const books = await all<any>(db, GET_ALL_BOOKS_SQL);
  // Espelha o Express (bookQueries.js): o set usa book.book_id (inexistente em books),
  // então na prática `available` fica true — mantido igual para não divergir de contrato.
  const borrowedSet = new Set(
    books.filter((book) => book.status === 'emprestado').map((book) => Number(book.book_id))
  );

  const booksWithAvailability = books.map((book) => ({
    ...book,
    area: AREA_NAME_TO_CODE[book.area] || book.area,
    available: !borrowedSet.has(Number(book.id))
  }));

  return sortBooks(booksWithAvailability);
}

async function validateBookCode(db: D1Database, bookCode: string): Promise<{ isValid: boolean; book: any }> {
  const books = await all<any>(db, GET_ALL_BOOKS_SQL);
  const target = formatComparableCode(bookCode);
  const book = books.find((item) => formatComparableCode(item.code) === target);
  return { isValid: Boolean(book), book };
}

async function getBooksForShelf(db: D1Database, shelf: any, allShelves: any[]): Promise<any[]> {
  if (!shelf?.book_code_start) return [];

  const books = await getAllBooksOrdered(db);
  const shelvesWithEndCodes = calculateEndCodes(allShelves);
  const currentShelfWithEndCode = shelvesWithEndCodes.find(
    (item) =>
      Number(item.shelf_number) === Number(shelf.shelf_number) &&
      Number(item.shelf_row) === Number(shelf.shelf_row)
  );

  if (!currentShelfWithEndCode?.calculated_book_code_end) return [];

  const startCode = shelf.book_code_start;
  const endCode = currentShelfWithEndCode.calculated_book_code_end;
  return books.filter((book) => isCodeInRange(book.code, startCode, endCode));
}

// ---------------------------------------------------------------------------
// Autorização administrativa (espelho do ensureAdmin das rotas Express)
// ---------------------------------------------------------------------------
function ensureAdmin() {
  return async (c: Ctx, next: Next) => {
    const user = c.get('user');
    if (user && user.role !== 'admin') {
      return c.json({ error: 'Acesso negado. Apenas administradores podem executar esta operacao.' }, 403);
    }
    await next();
  };
}

// ---------------------------------------------------------------------------
// Handlers compartilhados entre endpoints canônicos e legados
// ---------------------------------------------------------------------------
async function handleGetShelvesConfig(c: Ctx) {
  try {
    return c.json(await getShelvesConfig(c.env.DB));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
}

async function handleUpdateShelvesConfig(c: Ctx) {
  const body = await c.req.json().catch(() => ({} as any));
  const { shelvesConfig } = body as { shelvesConfig?: unknown };

  if (!Array.isArray(shelvesConfig)) {
    return c.json({ error: 'shelvesConfig deve ser um array' }, 400);
  }

  try {
    // runInTransaction -> db.batch(): atômico em D1.
    const statements = shelvesConfig.map((shelf: any) => ({
      sql: 'UPDATE virtual_bookshelf SET book_code_start = ?, book_code_end = ? WHERE shelf_number = ? AND shelf_row = ?',
      params: [
        shelf.book_code_start || null,
        shelf.book_code_end || null,
        shelf.shelf_number ?? null,
        shelf.shelf_row ?? null
      ]
    }));
    if (statements.length > 0) {
      await batch(c.env.DB, statements);
    }
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
}

async function handleGetOrderedBooks(c: Ctx) {
  try {
    return c.json(await getAllBooksOrdered(c.env.DB));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
}

async function handleValidateBookCode(c: Ctx) {
  const bookCode = c.req.query('bookCode');
  if (!bookCode) {
    return c.json({ error: 'bookCode e obrigatorio' }, 400);
  }

  try {
    return c.json(await validateBookCode(c.env.DB, bookCode));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
}

async function handleGetBooksForShelf(c: Ctx, shelfNumber: unknown, shelfRow: unknown) {
  if (!shelfNumber || !shelfRow) {
    return c.json({ error: 'shelf_number e shelf_row sao obrigatorios' }, 400);
  }

  try {
    const allShelves = await getShelvesConfig(c.env.DB);
    const shelf = allShelves.find(
      (item) =>
        Number(item.shelf_number) === Number(shelfNumber) && Number(item.shelf_row) === Number(shelfRow)
    );

    if (!shelf) {
      return c.json({ error: 'Prateleira nao encontrada' }, 404);
    }

    return c.json(await getBooksForShelf(c.env.DB, shelf, allShelves));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
}

async function handleUpdateShelfStartCode(c: Ctx, shelfNumber: unknown, shelfRow: unknown, bookCodeStart: unknown) {
  if (!shelfNumber || !shelfRow) {
    return c.json({ error: 'shelf_number e shelf_row sao obrigatorios' }, 400);
  }

  try {
    if (bookCodeStart) {
      const validation = await validateBookCode(c.env.DB, String(bookCodeStart));
      if (!validation.isValid) {
        throw new Error(`Codigo de livro invalido: ${bookCodeStart}`);
      }
    }

    await run(
      c.env.DB,
      'UPDATE virtual_bookshelf SET book_code_start = ? WHERE shelf_number = ? AND shelf_row = ?',
      [bookCodeStart ?? null, shelfNumber, shelfRow]
    );
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
}

async function handleUpdateShelfEndCode(c: Ctx, shelfNumber: unknown, shelfRow: unknown, bookCodeEnd: unknown) {
  if (!shelfNumber || !shelfRow) {
    return c.json({ error: 'shelf_number e shelf_row sao obrigatorios' }, 400);
  }

  try {
    if (bookCodeEnd) {
      const validation = await validateBookCode(c.env.DB, String(bookCodeEnd));
      if (!validation.isValid) {
        throw new Error(`Codigo de livro invalido: ${bookCodeEnd}`);
      }
    }

    await run(
      c.env.DB,
      'UPDATE virtual_bookshelf SET book_code_end = ? WHERE shelf_number = ? AND shelf_row = ?',
      [bookCodeEnd ?? null, shelfNumber, shelfRow]
    );
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
}

async function handleAddShelf(c: Ctx) {
  const body = await c.req.json().catch(() => ({} as any));
  const { shelf_number, shelf_row, book_code_start, book_code_end } = body as Record<string, unknown>;

  if (!shelf_number || !shelf_row) {
    return c.json({ error: 'shelf_number e shelf_row sao obrigatorios' }, 400);
  }

  try {
    const existingShelf = await first(
      c.env.DB,
      'SELECT * FROM virtual_bookshelf WHERE shelf_number = ? AND shelf_row = ?',
      [shelf_number, shelf_row]
    );
    if (existingShelf) {
      throw new Error('Ja existe uma prateleira com esse numero de estante e prateleira.');
    }

    await run(
      c.env.DB,
      'INSERT INTO virtual_bookshelf (shelf_number, shelf_row, book_code_start, book_code_end) VALUES (?, ?, ?, ?)',
      [shelf_number, shelf_row, book_code_start ?? null, book_code_end ?? null]
    );
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
}

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------
const virtualBookshelf = new Hono<{ Bindings: Env; Variables: { user: JwtUser } }>();

// ENDPOINTS CANONICOS (NOVOS)
virtualBookshelf.get('/shelves', handleGetShelvesConfig);

virtualBookshelf.put('/shelves/config', authenticateToken(), ensureAdmin(), handleUpdateShelvesConfig);

virtualBookshelf.get('/books/ordered', handleGetOrderedBooks);

virtualBookshelf.get('/books/validate', handleValidateBookCode);

virtualBookshelf.get('/shelves/:shelfNumber/:shelfRow/books', (c) =>
  handleGetBooksForShelf(
    c,
    c.req.query('shelf_number') || c.req.param('shelfNumber'),
    c.req.query('shelf_row') || c.req.param('shelfRow')
  )
);

virtualBookshelf.put('/shelves/:shelfNumber/:shelfRow/start-code', authenticateToken(), ensureAdmin(), async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  return handleUpdateShelfStartCode(
    c,
    body.shelf_number || c.req.param('shelfNumber'),
    body.shelf_row || c.req.param('shelfRow'),
    body.book_code_start
  );
});

virtualBookshelf.put('/shelves/:shelfNumber/:shelfRow/end-code', authenticateToken(), ensureAdmin(), async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  return handleUpdateShelfEndCode(
    c,
    body.shelf_number || c.req.param('shelfNumber'),
    body.shelf_row || c.req.param('shelfRow'),
    body.book_code_end
  );
});

virtualBookshelf.post('/shelves', authenticateToken(), ensureAdmin(), handleAddShelf);

// ENDPOINTS LEGADOS (DEPRECATED) - COMPATIBILIDADE 1a ENTREGA
virtualBookshelf.get('/', handleGetShelvesConfig);

virtualBookshelf.put('/', authenticateToken(), ensureAdmin(), handleUpdateShelvesConfig);

virtualBookshelf.get('/books', handleGetOrderedBooks);

virtualBookshelf.get('/validate', handleValidateBookCode);

virtualBookshelf.get('/shelf-books', (c) =>
  handleGetBooksForShelf(c, c.req.query('shelf_number'), c.req.query('shelf_row'))
);

virtualBookshelf.put('/shelf-start', authenticateToken(), ensureAdmin(), async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  return handleUpdateShelfStartCode(c, body.shelf_number, body.shelf_row, body.book_code_start);
});

virtualBookshelf.put('/shelf-end', authenticateToken(), ensureAdmin(), async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  return handleUpdateShelfEndCode(c, body.shelf_number, body.shelf_row, body.book_code_end);
});

virtualBookshelf.post('/shelf', authenticateToken(), ensureAdmin(), handleAddShelf);

export default virtualBookshelf;
