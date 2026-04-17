/**
 * Responsabilidade: declarar endpoints HTTP do dominio de emprestimos.
 * Camada: routes.
 * Entradas/Saidas: recebe requests REST em /api/loans e delega ao LoansController.
 * Dependencias criticas: LoansController modular e logger compartilhado.
 */

const express = require('express');
const router = express.Router();
const LoansController = require('../../controllers/library/loans/LoansController');
const { getLogger } = require('../../shared/logging/logger');

const log = getLogger(__filename);

// Criar empréstimo
router.post('/', (req, res) => {
    log.start('Encaminhando requisicao para criacao de emprestimo', { route: 'POST /' });
    LoansController.borrowBook(req, res);
});

// Criar empréstimo como admin (sem senha)
router.post('/admin', (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para POST /api/loans com fluxo padrao quando possivel', {
        route: 'POST /admin',
        replacement: 'POST /'
    });
    LoansController.borrowBookAsAdmin(req, res);
});

// Registrar devolução
router.post('/return', (req, res) => {
    log.start('Encaminhando requisicao para devolucao de emprestimo', { route: 'POST /return' });
    LoansController.returnBook(req, res);
});

// Registrar uso interno (empréstimo fantasma)
router.post('/internal-use', (req, res) => {
    log.start('Encaminhando requisicao para registro de uso interno', { route: 'POST /internal-use' });
    LoansController.registerInternalUse(req, res);
});

// Buscar empréstimos (filtro opcional por status)
router.get('/', (req, res) => {
    log.start('Encaminhando requisicao para listagem de emprestimos', { route: 'GET /' });
    LoansController.getLoans(req, res);
});

// Buscar empréstimos de um usuário específico (filtro opcional por status)
router.get('/user/:userId', (req, res) => {
    log.start('Encaminhando requisicao para listagem de emprestimos por usuario', {
        route: 'GET /user/:userId',
        user_id: req.params.userId
    });
    LoansController.getLoansByUser(req, res);
});

// Buscar empréstimos de um livro específico (filtro opcional por status)
router.get('/book/:bookId', (req, res) => {
    log.start('Encaminhando requisicao para listagem de emprestimos por livro', {
        route: 'GET /book/:bookId',
        book_id: req.params.bookId
    });
    LoansController.getLoansByBook(req, res);
});

/* ======================== ROTAS COM ID ======================== */
/*                   Atenção: devem vir por último                */

// Preview da renovação
router.post('/:id/preview-renew', (req, res) => {
    log.start('Encaminhando requisicao para preview de renovacao', { route: 'POST /:id/preview-renew', loan_id: req.params.id });
    LoansController.previewRenewLoan(req, res);
});

// Renovar empréstimo
router.put('/:id/renew', (req, res) => {
    log.start('Encaminhando requisicao para renovacao de emprestimo', { route: 'PUT /:id/renew', loan_id: req.params.id });
    LoansController.renewLoan(req, res);
});

// Preview da extensão
router.post('/:id/preview-extend', (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para POST /:id/preview-renew quando aplicavel', {
        route: 'POST /:id/preview-extend',
        replacement: 'POST /:id/preview-renew',
        loan_id: req.params.id
    });
    LoansController.previewExtendLoan(req, res);
});

// Estender empréstimo
router.put('/:id/extend', (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para PUT /:id/renew quando aplicavel', {
        route: 'PUT /:id/extend',
        replacement: 'PUT /:id/renew',
        loan_id: req.params.id
    });
    LoansController.extendLoan(req, res);
});

module.exports = router;