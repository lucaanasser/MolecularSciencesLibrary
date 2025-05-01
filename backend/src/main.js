const express = require('express');
const cors = require('cors');
const booksRouter = require('./routes/BooksRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/books', booksRouter);

// Rota de teste
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Handler para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Handler para erros não tratados
app.use((err, req, res, next) => {
  console.error('Erro global não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

// Inicia o servidor na porta 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});