import { Hono } from 'hono';
import books from './routes/books';
import users from './routes/users';
import loans from './routes/loans';
import rules from './routes/rules';
import badges from './routes/badges';
import notifications from './routes/notifications';
import reports from './routes/reports';
import donators from './routes/donators';
import virtualBookshelf from './routes/virtualBookshelf';
import userSchedules from './routes/userSchedules';
import forum from './routes/forum';
import disciplines from './routes/disciplines';
import disciplineEvaluations from './routes/disciplineEvaluations';
import academicDisciplines from './routes/academicDisciplines';

export type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
  ENVIRONMENT?: string;
  JWT_SECRET?: string;
  KIOSK_ALLOWED_IP?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  FRONTEND_URL?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/api/health', (c) =>
  c.json({ ok: true, runtime: 'cloudflare-workers', environment: c.env.ENVIRONMENT ?? 'dev' })
);

app.route('/api/books', books);
app.route('/api/users', users);
app.route('/api/loans', loans);
app.route('/api/rules', rules);
app.route('/api/badges', badges);
app.route('/api/notifications', notifications);
app.route('/api/reports', reports);
app.route('/api/donators', donators);
app.route('/api/virtual-bookshelf', virtualBookshelf);
app.route('/api/user-schedules', userSchedules);
app.route('/api/forum', forum);
app.route('/api/disciplines', disciplines);
app.route('/api/evaluations', disciplineEvaluations);
app.route('/api/academic/disciplines', academicDisciplines);

// Rotas ainda não portadas do Express respondem 404 explícito em vez de cair no SPA.
app.all('/api/*', (c) => c.json({ error: 'Endpoint ainda não migrado para o Worker' }, 404));

export default app;
