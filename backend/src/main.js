const express = require('express');
const cors = require('cors');
const path = require('path');
const booksRouter = require('./routes/BooksRoutes');
const usersRouter = require('./routes/UsersRoutes');
const loansRouter = require('./routes/LoansRoutes');
const notificationsRouter = require('./routes/NotificationsRoutes');
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

app.use(cors());
app.use(express.json());


// Rotas da API
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/notifications', notificationsRouter);

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

// Inicia o servidor na porta 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🟢 [main] Backend rodando na porta ${PORT}`);
});