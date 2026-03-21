// Corrige ReferenceError: File is not defined para undici/fetch
const { File, FormData, Blob } = require('formdata-node');
global.File = File;
global.FormData = FormData;
global.Blob = Blob;

const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

const booksRouter = require('./routes/library/BooksRoutes');
const usersRouter = require('./routes/library/UsersRoutes');
const loansRouter = require('./routes/library/LoansRoutes');
const badgesRouter = require('./routes/library/BadgesRoutes');
const donatorsRouter = require('./routes/library/DonatorsRoutes');
const virtualBookShelfRouter = require('./routes/library/VirtualBookSheflRoute');

const notificationsRouter = require('./routes/utilities/NotificationsRoutes');
const emailRouter = require('./routes/utilities/EmailRoutes');
const rulesRouter = require('./routes/utilities/RulesRoutes');
const formsRouter = require('./routes/utilities/FormsRoutes');
const reportsRouter = require('./routes/utilities/ReportsRoutes');

const disciplinesRouter = require('./routes/academic/DisciplinesRoutes');
const disciplineEvaluationsRouter = require('./routes/academic/DisciplineEvaluationsRoutes');
const userSchedulesRouter = require('./routes/academic/UserSchedulesRoutes');
const forumRouter = require('./routes/academic/ForumRoutes');
const publicProfilesRouter = require('./routes/academic/PublicProfilesRoutes');

require('dotenv').config();

/**
 * Arquivo principal do backend.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const app = express();

// Trust proxy para capturar IP real quando atrás de proxies / nginx
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (imagens de usuários, etc.)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
console.log('🟢 [main] Arquivos estáticos configurados em /images -> public/images');

// Rotas da API
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/email', emailRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/donators', donatorsRouter);
app.use('/api/virtual-bookshelf', virtualBookShelfRouter);
app.use('/api/forms', formsRouter);
app.use('/api/disciplines', disciplinesRouter);
app.use('/api/evaluations', disciplineEvaluationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/user-schedules', userSchedulesRouter);
app.use('/api/forum', forumRouter);
app.use('/api/profiles', publicProfilesRouter);

// Rota de teste
app.get('/api/ping', (req, res) => {
  console.log('🔵 [main] GET /api/ping - Teste de saúde');
  res.json({ message: 'pong' });
});

// Handler para rotas não encontradas
app.use((req, res) => {
  console.warn(`🟡 [main] Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Handler para erros não tratados
app.use((err, req, res, next) => {
  console.error('🔴 [main] Erro global não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

// Inicia o servidor HTTP e HTTPS
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Middleware para redirecionar HTTP para HTTPS em produção
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Criar servidor HTTP
const httpServer = http.createServer(app);

// Criar servidor HTTPS (apenas se os certificados existirem)
let httpsServer = null;
try {
  const sslKeyPath = '/etc/letsencrypt/live/bibliotecamoleculares.com/privkey.pem';
  const sslCertPath = '/etc/letsencrypt/live/bibliotecamoleculares.com/fullchain.pem';
  
  if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    const httpsOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath)
    };
    
    httpsServer = https.createServer(httpsOptions, app);
    
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`🟢 [main] Backend HTTPS rodando na porta ${HTTPS_PORT}`);
      console.log(`🔒 [main] Acesse: https://localhost:${HTTPS_PORT}`);
    });
  } else {
    console.log('🟡 [main] Certificados SSL não encontrados. Rodando apenas HTTP.');
    console.log(`🔍 [main] Procurando em: ${sslKeyPath} e ${sslCertPath}`);
  }
} catch (error) {
  console.error('🔴 [main] Erro ao configurar HTTPS:', error.message);
  console.log('🟡 [main] Continuando apenas com HTTP.');
}

// Servidor HTTP sempre ativo
httpServer.listen(HTTP_PORT, () => {
  console.log(`🟢 [main] Backend HTTP rodando na porta ${HTTP_PORT}`);
  console.log(`🌐 [main] Acesse: http://localhost:${HTTP_PORT}`);
});

module.exports = app; 