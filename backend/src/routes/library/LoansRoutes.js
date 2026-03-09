/**
 * Rotas relacionadas a empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const express = require('express');
const router = express.Router();
const LoansController = require('../../controllers/library/LoansController');


// Criar empréstimo
router.post('/', (req, res) => {
    console.log("🔵 [LoansRoutes] POST / - Criar novo empréstimo");
    LoansController.borrowBook(req, res);
});

// Criar empréstimo como admin (sem senha)
router.post('/admin', (req, res) => {
    console.log("🔵 [LoansRoutes] POST /admin - Criar novo empréstimo (admin)");
    LoansController.borrowBookAsAdmin(req, res);
});

// Registrar devolução
router.post('/return', (req, res) => {
    console.log("🔵 [LoansRoutes] POST /return - Registrar devolução de empréstimo");
    LoansController.returnBook(req, res);
});

// Registrar uso interno (empréstimo fantasma)
router.post('/internal-use', (req, res) => {
    console.log("🔵 [LoansRoutes] POST /internal-use - Registrar uso interno");
    LoansController.registerInternalUse(req, res);
});

// Buscar empréstimos (filtro opcional por status)
router.get('/', (req, res) => {
    console.log("🔵 [LoansRoutes] GET - Buscar empréstimos com filtro de status");
    LoansController.getLoans(req, res);
});

// Buscar empréstimos de um usuário específico (filtro opcional por status)
router.get('/user/:userId', (req, res) => {
    console.log(`🔵 [LoansRoutes] GET /user/${req.params.userId} - Buscar empréstimos do usuário com filtro de status`);
    LoansController.getLoansByUser(req, res);
});

// Buscar empréstimos de um livro específico (filtro opcional por status)
router.get('/book/:bookId', (req, res) => {
    console.log(`🔵 [LoansRoutes] GET /book/${req.params.bookId} - Buscar empréstimos do livro com filtro de status`);
    LoansController.getLoansByBook(req, res);
});

/* ======================== ROTAS COM ID ======================== */
/*                   Atenção: devem vir por último                */

// Preview da renovação
router.post('/:id/preview-renew', (req, res) => {
    console.log('🔵 [LoansRoutes] POST /:id/preview-renew - Preview renovação');
    LoansController.previewRenewLoan(req, res);
});

// Renovar empréstimo
router.put('/:id/renew', (req, res) => {
    console.log('🔵 [LoansRoutes] PUT /:id/renew - Renovar empréstimo');
    LoansController.renewLoan(req, res);
});

// Preview da extensão
router.post('/:id/preview-extend', (req, res) => {
    console.log('🔵 [LoansRoutes] POST /:id/preview-extend - Preview extensão');
    LoansController.previewExtendLoan(req, res);
});

// Estender empréstimo
router.put('/:id/extend', (req, res) => {
    console.log('🔵 [LoansRoutes] PUT /:id/extend - Estender empréstimo');
    LoansController.extendLoan(req, res);
});

module.exports = router;