/**
 * Porte de /api/reports do Express (ReportsRoutes → reports/ReportsController → ReportsService
 * modular: loansStatistics, usersStatistics, booksStatistics, donatorsStatistics, consolidatedReport).
 * Contrato espelhado: mesmos paths, shapes de JSON e mensagens de erro.
 *
 * NÃO portadas (caem no 404 global do Worker): as rotas GET *\/pdf, que dependem de
 * PDFGeneratorService (pdfkit/streams do Node) — geração de PDF fica no Express.
 * Sem autenticação — o Express também não aplica middleware nessas rotas.
 */
import { Hono } from 'hono';
import { all, first } from '../db';
import { areaMapping, subareaMapping } from '../bookAreas';
import type { Env } from '../index';

type Row = Record<string, unknown>;

// Espelho do orderBy de catalogModelBridge (countBooksBy).
const ORDER_BY_AREA = `ORDER BY
    CASE area
        WHEN 'Matemática' THEN 1
        WHEN 'Física' THEN 2
        WHEN 'Química' THEN 3
        WHEN 'Biologia' THEN 4
        WHEN 'Computação' THEN 5
        WHEN 'Variados' THEN 6
        ELSE 999
    END`;

/** Espelho de LoansModel.countLoans. */
async function countLoans(db: D1Database, status: 'all' | 'active' | 'returned' = 'all'): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM loans';
  if (status === 'active') sql += ' WHERE returned_at IS NULL';
  else if (status === 'returned') sql += ' WHERE returned_at IS NOT NULL';
  const result = await first<{ count: number }>(db, sql);
  return result?.count || 0;
}

/** Espelho de reports/modules/loansStatistics.getLoansStatistics. */
async function getLoansStatistics(db: D1Database) {
  const totalLoans = await countLoans(db);
  const activeLoans = await countLoans(db, 'active');
  const returnedLoans = await countLoans(db, 'returned');
  const overdueLoans = totalLoans - activeLoans - returnedLoans;

  // Uso interno: espelho de LoansService.getUserLoans(2).length.
  const internalRow = await first<{ count: number }>(db, 'SELECT COUNT(*) as count FROM loans WHERE user_id = ?', [2]);
  const internalUseLoans = internalRow?.count ?? 0;
  const externalLoans = totalLoans - internalUseLoans;

  const loansByMonth = await all<Row>(
    db,
    `SELECT
        strftime('%m/%Y', borrowed_at) as month,
        COUNT(*) as total,
        SUM(CASE WHEN user_id = 0 THEN 1 ELSE 0 END) as internal,
        SUM(CASE WHEN user_id != 0 THEN 1 ELSE 0 END) as external,
        strftime('%Y-%m', borrowed_at) as sort_key
    FROM loans
    WHERE borrowed_at >= date('now', '-12 months')
    GROUP BY sort_key
    ORDER BY sort_key ASC`
  );

  const topBooks = await all<Row>(
    db,
    `SELECT
        b.id, b.title, b.authors, b.area,
        COUNT(l.id) as loan_count
     FROM loans l
     JOIN books b ON l.book_id = b.id
     GROUP BY b.title
     ORDER BY loan_count DESC
     LIMIT 10`
  );

  const renewalStats = await first<{ total: number; renewed: number; avg_renewals: number | null }>(
    db,
    `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN renewals > 0 THEN 1 ELSE 0 END) as renewed,
        AVG(renewals) as avg_renewals
     FROM loans`
  );

  const loansByDayOfWeekRaw = await all<{ day_name: string; day_num: string; total: number }>(
    db,
    `SELECT
        CASE strftime('%w', borrowed_at)
            WHEN '0' THEN 'Domingo'
            WHEN '1' THEN 'Segunda'
            WHEN '2' THEN 'Terça'
            WHEN '3' THEN 'Quarta'
            WHEN '4' THEN 'Quinta'
            WHEN '5' THEN 'Sexta'
            WHEN '6' THEN 'Sábado'
        END as day_name,
        strftime('%w', borrowed_at) as day_num,
        COUNT(*) as total
     FROM loans
     GROUP BY strftime('%w', borrowed_at)
     ORDER BY day_num`
  );

  const totalByWeek = loansByDayOfWeekRaw.reduce((sum, d) => sum + d.total, 0);
  const loansByDayOfWeek = loansByDayOfWeekRaw.map((d) => ({
    day_name: d.day_name,
    day_num: d.day_num,
    percent: totalByWeek > 0 ? ((d.total / totalByWeek) * 100).toFixed(1) : '0.0'
  }));

  return {
    summary: {
      total: totalLoans,
      active: activeLoans,
      overdue: overdueLoans,
      internalUse: internalUseLoans || 0,
      external: externalLoans || 0,
      renewalRate:
        (renewalStats?.total ?? 0) > 0
          ? (((renewalStats!.renewed as number) / (renewalStats!.total as number)) * 100).toFixed(1)
          : 0,
      avgRenewals: renewalStats?.avg_renewals?.toFixed(2) || 0
    },
    loansByMonth,
    loansByDayOfWeek,
    topBooks
  };
}

/** Espelho de reports/modules/usersStatistics.getUsersStatistics. */
async function getUsersStatistics(db: D1Database) {
  // Espelho de UsersService.getAllUsers().length (lista exclui usuarios 'pending').
  const totalUsersRow = await first<{ count: number }>(
    db,
    "SELECT COUNT(*) as count FROM users WHERE status != 'pending'"
  );
  const totalUsers = totalUsersRow?.count ?? 0;

  const activeUsers = await first<{ total: number }>(
    db,
    `SELECT COUNT(DISTINCT user_id) as total
     FROM loans
     WHERE borrowed_at >= date('now', '-6 months')
     AND user_id != 0`
  );

  const usersByClass = await all<Row>(
    db,
    `SELECT class, COUNT(*) as total
     FROM users
     WHERE class IS NOT NULL AND class != ''
     GROUP BY class
     ORDER BY total DESC`
  );

  const topBorrowers = await all<Row>(
    db,
    `SELECT
        u.id, u.name, u.role, u.class,
        COUNT(l.id) as total_loans
     FROM users u
     LEFT JOIN loans l ON u.id = l.user_id
     WHERE u.role = 'aluno'
     GROUP BY u.id
     HAVING total_loans > 0
     ORDER BY total_loans DESC
     LIMIT 10`
  );

  return {
    summary: {
      total: totalUsers - 2 || 0,
      active: (activeUsers?.total as number) - 2 || 0
    },
    usersByClass,
    topBorrowers
  };
}

/** Espelho de reports/modules/booksStatistics.getBooksStatistics. */
async function getBooksStatistics(db: D1Database) {
  const totalBooksRow = await first<{ count: number }>(db, 'SELECT COUNT(*) as count FROM books');
  const totalBooks = totalBooksRow?.count ?? 0;

  const neverBorrowed = await first<{ count: number }>(
    db,
    `SELECT COUNT(*) as count
     FROM books b
     WHERE NOT EXISTS (
         SELECT 1 FROM loans l WHERE l.book_id = b.id
     )`
  );

  const circulationRate = (((totalBooks - (neverBorrowed?.count || 0)) / totalBooks) * 100).toFixed(1);

  // Espelho de BooksService.countBooksBy('area').
  const booksByArea = await all<Row>(db, `SELECT area, COUNT(*) as count FROM books GROUP BY area ${ORDER_BY_AREA}`);

  const subareasByArea: Record<string, string[]> = {};
  for (const areaName in areaMapping) {
    const areaCode = areaMapping[areaName];
    subareasByArea[areaName] = Object.keys(subareaMapping[areaCode]);
  }
  const totalSubareas = Object.values(subareasByArea).reduce((sum, list) => sum + list.length, 0);

  // Espelho de BooksService.countBooksBy('language').
  const booksByLanguage = await all<Row>(
    db,
    'SELECT language, COUNT(*) as count FROM books GROUP BY language ORDER BY count DESC'
  );

  const recentlyAdded = await all<Row>(
    db,
    `SELECT
        id, title, authors as author, area,
        datetime('now') as created_at
     FROM books
     ORDER BY id DESC
     LIMIT 10`
  );

  return {
    summary: {
      total: totalBooks || 0,
      numberOfSubareas: totalSubareas || 0,
      circulationRate
    },
    booksByArea,
    subareasByArea,
    booksByLanguage,
    recentlyAdded
  };
}

/** Espelho de reports/modules/donatorsStatistics.getDonatorsStatistics. */
async function getDonatorsStatistics(
  db: D1Database,
  startDate: string | null = null,
  endDate: string | null = null
) {
  let dateFilter = '';
  const params: unknown[] = [];

  if (startDate && endDate) {
    dateFilter = ' AND created_at BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = ' AND created_at >= ?';
    params.push(startDate);
  } else if (endDate) {
    dateFilter = ' AND created_at <= ?';
    params.push(endDate);
  }

  const totalDonators = await first<Row>(
    db,
    `SELECT COUNT(*) as total FROM donators WHERE 1=1 ${dateFilter}`,
    params
  );

  const bookDonations = await first<Row>(
    db,
    `SELECT COUNT(*) as total FROM donators WHERE donation_type = 'book' ${dateFilter}`,
    params
  );

  const moneyDonations = await first<Row>(
    db,
    `SELECT
        COUNT(*) as total,
        SUM(amount) as total_amount
     FROM donators
     WHERE donation_type = 'money' ${dateFilter}`,
    params
  );

  // O Express também consulta 'registeredDonators' (COUNT WHERE user_id IS NOT NULL), mas o
  // resultado não entra no payload — query omitida aqui (sem efeito no contrato), como a
  // 'usersWithOverdue' em usersStatistics.

  const donationsByMonth = await all<Row>(
    db,
    `SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as total,
        SUM(CASE WHEN donation_type = 'book' THEN 1 ELSE 0 END) as books,
        SUM(CASE WHEN donation_type = 'money' THEN 1 ELSE 0 END) as money,
        SUM(CASE WHEN donation_type = 'money' THEN amount ELSE 0 END) as money_total
     FROM donators
     WHERE created_at >= date('now', '-12 months') ${dateFilter}
     GROUP BY strftime('%Y-%m', created_at)
     ORDER BY month ASC`,
    params
  );

  const topDonators = await all<Row>(
    db,
    `SELECT
        id,
        name,
        contact,
        COUNT(*) as total_donations,
        SUM(CASE WHEN donation_type = 'book' THEN 1 ELSE 0 END) as books_donated,
        SUM(CASE WHEN donation_type = 'money' THEN amount ELSE 0 END) as monetary_donated
     FROM donators
     WHERE 1=1 ${dateFilter}
     GROUP BY name
     ORDER BY total_donations DESC
     LIMIT 10`,
    params
  );

  const recentDonations = await all<Row>(
    db,
    `SELECT
        d.id,
        d.name as donator_name,
        d.donation_type as type,
        d.amount as value,
        COALESCE(b.title, '') as book_title,
        d.created_at
     FROM donators d
     LEFT JOIN books b ON d.book_id = b.id
     WHERE 1=1 ${dateFilter}
     ORDER BY d.created_at DESC
     LIMIT 20`,
    params
  );

  return {
    summary: {
      totalDonators: (totalDonators?.total as number) || 0,
      totalDonations: (((bookDonations?.total as number) || 0) + ((moneyDonations?.total as number) || 0)),
      bookDonations: (bookDonations?.total as number) || 0,
      monetaryDonations: (moneyDonations?.total as number) || 0,
      totalMonetaryValue: (moneyDonations?.total_amount as number) || 0
    },
    donationsByMonth: donationsByMonth.map((m) => ({
      month: m.month,
      books: m.books,
      monetary: m.money
    })),
    topDonators,
    recentDonations,
    period: { startDate, endDate }
  };
}

/** Espelho de reports/modules/consolidatedReport.generateCompleteReport. */
async function generateCompleteReport(db: D1Database) {
  const [loans, users, books, donators] = await Promise.all([
    getLoansStatistics(db),
    getUsersStatistics(db),
    getBooksStatistics(db),
    getDonatorsStatistics(db)
  ]);

  const activeLoansDetails = await all<Row>(
    db,
    `SELECT
        l.id as loan_id, l.borrowed_at, l.due_date, l.renewals,
        b.id as book_id, b.code, b.title, b.authors,
        u.id as user_id, u.name as user_name, u.NUSP
     FROM loans l
     JOIN books b ON l.book_id = b.id
     LEFT JOIN users u ON l.user_id = u.id
     WHERE l.returned_at IS NULL
     ORDER BY l.due_date ASC`
  );

  const allBooks = await all<Row>(
    db,
    `SELECT
        b.id, b.code, b.title, b.authors, b.area, b.subarea,
        b.edition, b.status,
        CASE WHEN EXISTS (
            SELECT 1 FROM loans l WHERE l.book_id = b.id AND l.returned_at IS NULL
        ) THEN 'Emprestado' ELSE 'Disponível' END as status
     FROM books b
     ORDER BY b.area, b.code`
  );

  const allUsers = await all<Row>(
    db,
    `SELECT
        u.id, u.NUSP, u.name, u.email, u.role, u.class,
        (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id) as total_loans,
        (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id AND l.returned_at IS NULL) as active_loans
     FROM users u
     ORDER BY u.name`
  );

  const allDonators = await all<Row>(db, 'SELECT * FROM donators ORDER BY created_at DESC');

  return {
    generatedAt: new Date().toISOString(),
    statistics: { loans, users, books, donators },
    details: {
      activeLoans: activeLoansDetails,
      allBooks,
      allUsers,
      allDonators
    }
  };
}

const reports = new Hono<{ Bindings: Env }>();

reports.get('/loans', async (c) => {
  try {
    return c.json(await getLoansStatistics(c.env.DB));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

reports.get('/users', async (c) => {
  try {
    return c.json(await getUsersStatistics(c.env.DB));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

reports.get('/books', async (c) => {
  try {
    return c.json(await getBooksStatistics(c.env.DB));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

reports.get('/donators', async (c) => {
  try {
    const startDate = c.req.query('startDate') ?? null;
    const endDate = c.req.query('endDate') ?? null;
    return c.json(await getDonatorsStatistics(c.env.DB, startDate, endDate));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

reports.get('/complete', async (c) => {
  try {
    return c.json(await generateCompleteReport(c.env.DB));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default reports;
