const express = require('express');
const router = express.Router();
const LoansController = require('../controllers/LoansController');

/**
 * Rotas relacionadas a empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// Criar empréstimo
router.post('/', (req, res) => {
    console.log("🔵 [LoansRoutes] POST / - Criar novo empréstimo");
    LoansController.borrowBook(req, res);
});

// Listar todos os empréstimos
router.get('/', (req, res) => {
    console.log("🔵 [LoansRoutes] GET / - Listar todos os empréstimos");
    LoansController.listLoans(req, res);
});

// Listar empréstimos de um usuário específico
router.get('/user/:userId', (req, res) => {
    console.log(`🔵 [LoansRoutes] GET /user/${req.params.userId} - Listar empréstimos do usuário`);
    LoansController.listLoansByUser(req, res);
});

// Registrar devolução
router.post('/return', (req, res) => {
    console.log("🔵 [LoansRoutes] POST /return - Registrar devolução de empréstimo");
    LoansController.returnBook(req, res);
});

// Listar empréstimos ativos com status de atraso
router.get('/active', (req, res) => {
    console.log("🔵 [LoansRoutes] GET /active - Listar empréstimos ativos com status de atraso");
    LoansController.listActiveLoansWithOverdue(req, res);
});

// Renovar empréstimo
router.put('/:id/renew', (req, res) => {
    console.log('🔵 [LoansRoutes] PUT /:id/renew - Renovar empréstimo');
    LoansController.renewLoan(req, res);
});

module.exports = router;