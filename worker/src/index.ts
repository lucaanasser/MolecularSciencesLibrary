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
import email from './routes/email';
import { handleInboundEmail } from './services/emailInbox';

export type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
  ENVIRONMENT?: string;
  JWT_SECRET?: string;
  KIOSK_ALLOWED_IP?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  FRONTEND_URL?: string;
  INBOX_NOTIFY_TO?: string; // Gmail do admin que recebe o aviso de mensagem nova em contato@
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
app.route('/api/email', email);

// Rotas ainda não portadas do Express respondem 404 explícito em vez de cair no SPA.
app.all('/api/*', (c) => c.json({ error: 'Endpoint ainda não migrado para o Worker' }, 404));

// Alem do fetch (API + assets), o Worker recebe email do Cloudflare Email Routing:
// a regra contato@ → "Send to a Worker" entrega no handler `email` (services/emailInbox.ts).
export default {
  fetch: app.fetch,
  email: handleInboundEmail
} satisfies ExportedHandler<Env>;
