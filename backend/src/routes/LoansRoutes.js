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

// Preview da renovação
router.post('/:id/preview-renew', (req, res) => {
    console.log('🔵 [LoansRoutes] POST /:id/preview-renew - Preview renovação');
    LoansController.previewRenewLoan(req, res);
});

// Listar empréstimos ativos de um usuário específico
router.get('/user/:userId/active', (req, res) => {
    console.log(`🔵 [LoansRoutes] GET /user/${req.params.userId}/active - Listar empréstimos ativos do usuário`);
    LoansController.listActiveLoansByUser(req, res);
});

// Extensão - preview
router.post('/:id/preview-extend', (req, res) => {
    console.log('🔵 [LoansRoutes] POST /:id/preview-extend - Preview extensão');
    LoansController.previewExtendLoan(req, res);
});
// Extensão - aplicar
router.put('/:id/extend', (req, res) => {
    console.log('🔵 [LoansRoutes] PUT /:id/extend - Estender empréstimo');
    LoansController.extendLoan(req, res);
});

// Solicitar extensão
router.post('/:id/request-extension', LoansController.requestExtension);

module.exports = router;