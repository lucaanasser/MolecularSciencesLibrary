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
const booksRouter = require('./routes/BooksRoutes');
const usersRouter = require('./routes/UsersRoutes');
const loansRouter = require('./routes/LoansRoutes');
const notificationsRouter = require('./routes/NotificationsRoutes');
const rulesRouter = require('./routes/RulesRoutes');
const badgesRouter = require('./routes/BadgesRoutes');
const donatorsRouter = require('./routes/DonatorsRoutes');
const virtualBookShelfRouter = require('./routes/VirtualBookSheflRoute'); 
const formsRouter = require('./routes/FormsRoutes');
const disciplinesRouter = require('./routes/DisciplinesRoutes');
const disciplineEvaluationsRouter = require('./routes/DisciplineEvaluationsRoutes');
const reportsRouter = require('./routes/ReportsRoutes');
const userSchedulesRouter = require('./routes/UserSchedulesRoutes');
const forumRouter = require('./routes/ForumRoutes');
const publicProfilesRouter = require('./routes/PublicProfilesRoutes');
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


// Rotas da API
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/donators', donatorsRouter);
app.use('/api/virtual-bookshelf', virtualBookShelfRouter); // Adicione esta linha
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
  // Tenta primeiro os caminhos diretos do Let's Encrypt
  let sslKeyPath = '/etc/letsencrypt/live/bibliotecamoleculares.com/privkey.pem';
  let sslCertPath = '/etc/letsencrypt/live/bibliotecamoleculares.com/fullchain.pem';
  
  // Se não encontrar, tenta os caminhos locais
  if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
    sslKeyPath = '/app/ssl/private.key';
    sslCertPath = '/app/ssl/certificate.crt';
  }
  
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

module.exports = app; // (se necessário para testes)