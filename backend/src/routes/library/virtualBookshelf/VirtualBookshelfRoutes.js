/**
 * Responsabilidade: declarar endpoints HTTP da estante virtual.
 * Camada: routes.
 * Entradas/Saidas: recebe requests em /api/virtual-bookshelf e delega ao VirtualBookshelfController.
 * Dependencias criticas: VirtualBookshelfController, authenticateToken e logger compartilhado.
 */

const express = require('express');
const VirtualBookshelfController = require('../../../controllers/library/virtualBookshelf/VirtualBookshelfController');
const authenticateToken = require('../../../middlewares/authenticateToken');
const { getLogger } = require('../../../shared/logging/logger');

const router = express.Router();
const log = getLogger(__filename);

/**
 * O que faz: aplica regra de autorizacao administrativa para rotas de comando.
 * Onde e usada: endpoints protegidos de alteracao de configuracao e prateleiras.
 * Dependencias chamadas: middleware authenticateToken (anterior na cadeia).
 * Efeitos colaterais: responde 403 quando usuario autenticado nao e admin.
 */
function ensureAdmin(req, res, next) {
    if (req.user && req.user.role !== 'admin') {
        log.warn('Acesso negado por perfil sem permissao administrativa', {
            route: req.route?.path,
            requester_id: req?.user?.id,
            role: req?.user?.role
        });
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem executar esta operacao.' });
    }

    return next();
}

// ENDPOINTS CANONICOS (NOVOS)
router.get('/shelves', (req, res) => {
    log.start('Encaminhando consulta de configuracao de prateleiras', { route: 'GET /shelves' });
    VirtualBookshelfController.getShelvesConfig(req, res);
});

router.put('/shelves/config', authenticateToken, ensureAdmin, (req, res) => {
    log.start('Encaminhando atualizacao completa de configuracao de prateleiras', {
        route: 'PUT /shelves/config',
        requester_id: req?.user?.id
    });
    VirtualBookshelfController.updateShelvesConfig(req, res);
});

router.get('/books/ordered', (req, res) => {
    log.start('Encaminhando consulta de livros ordenados', { route: 'GET /books/ordered' });
    VirtualBookshelfController.getOrderedBooks(req, res);
});

router.get('/books/validate', (req, res) => {
    log.start('Encaminhando validacao de codigo de livro', {
        route: 'GET /books/validate',
        code: req.query?.bookCode
    });
    VirtualBookshelfController.validateBookCode(req, res);
});

router.get('/shelves/:shelfNumber/:shelfRow/books', (req, res) => {
    log.start('Encaminhando consulta de livros por prateleira', {
        route: 'GET /shelves/:shelfNumber/:shelfRow/books',
        shelf_number: req.params.shelfNumber,
        shelf_row: req.params.shelfRow
    });
    VirtualBookshelfController.getBooksForShelf(req, res);
});

router.put('/shelves/:shelfNumber/:shelfRow/start-code', authenticateToken, ensureAdmin, (req, res) => {
    log.start('Encaminhando atualizacao de codigo inicial da prateleira', {
        route: 'PUT /shelves/:shelfNumber/:shelfRow/start-code',
        requester_id: req?.user?.id,
        shelf_number: req.params.shelfNumber,
        shelf_row: req.params.shelfRow
    });
    VirtualBookshelfController.updateShelfStartCode(req, res);
});

router.put('/shelves/:shelfNumber/:shelfRow/end-code', authenticateToken, ensureAdmin, (req, res) => {
    log.start('Encaminhando atualizacao de codigo final da prateleira', {
        route: 'PUT /shelves/:shelfNumber/:shelfRow/end-code',
        requester_id: req?.user?.id,
        shelf_number: req.params.shelfNumber,
        shelf_row: req.params.shelfRow
    });
    VirtualBookshelfController.updateShelfEndCode(req, res);
});

router.post('/shelves', authenticateToken, ensureAdmin, (req, res) => {
    log.start('Encaminhando criacao de nova prateleira', {
        route: 'POST /shelves',
        requester_id: req?.user?.id,
        shelf_number: req.body?.shelf_number,
        shelf_row: req.body?.shelf_row
    });
    VirtualBookshelfController.addShelf(req, res);
});

// ENDPOINTS LEGADOS (DEPRECATED) - COMPATIBILIDADE 1a ENTREGA
router.get('/', (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para GET /api/virtual-bookshelf/shelves', {
        route: 'GET /',
        replacement: '/shelves'
    });
    VirtualBookshelfController.getShelvesConfig(req, res);
});

router.put('/', authenticateToken, ensureAdmin, (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para PUT /api/virtual-bookshelf/shelves/config', {
        route: 'PUT /',
        replacement: '/shelves/config',
        requester_id: req?.user?.id
    });
    VirtualBookshelfController.updateShelvesConfig(req, res);
});

router.get('/books', (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para GET /api/virtual-bookshelf/books/ordered', {
        route: 'GET /books',
        replacement: '/books/ordered'
    });
    VirtualBookshelfController.getOrderedBooks(req, res);
});

router.get('/validate', (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para GET /api/virtual-bookshelf/books/validate', {
        route: 'GET /validate',
        replacement: '/books/validate',
        code: req.query?.bookCode
    });
    VirtualBookshelfController.validateBookCode(req, res);
});

router.get('/shelf-books', (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para GET /api/virtual-bookshelf/shelves/:shelfNumber/:shelfRow/books', {
        route: 'GET /shelf-books',
        replacement: '/shelves/:shelfNumber/:shelfRow/books',
        shelf_number: req.query?.shelf_number,
        shelf_row: req.query?.shelf_row
    });
    VirtualBookshelfController.getBooksForShelf(req, res);
});

router.put('/shelf-start', authenticateToken, ensureAdmin, (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para PUT /api/virtual-bookshelf/shelves/:shelfNumber/:shelfRow/start-code', {
        route: 'PUT /shelf-start',
        replacement: '/shelves/:shelfNumber/:shelfRow/start-code',
        requester_id: req?.user?.id,
        shelf_number: req.body?.shelf_number,
        shelf_row: req.body?.shelf_row
    });
    VirtualBookshelfController.updateShelfStartCode(req, res);
});

router.put('/shelf-end', authenticateToken, ensureAdmin, (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para PUT /api/virtual-bookshelf/shelves/:shelfNumber/:shelfRow/end-code', {
        route: 'PUT /shelf-end',
        replacement: '/shelves/:shelfNumber/:shelfRow/end-code',
        requester_id: req?.user?.id,
        shelf_number: req.body?.shelf_number,
        shelf_row: req.body?.shelf_row
    });
    VirtualBookshelfController.updateShelfEndCode(req, res);
});

router.post('/shelf', authenticateToken, ensureAdmin, (req, res) => {
    log.warn('Endpoint deprecated em uso; migrar para POST /api/virtual-bookshelf/shelves', {
        route: 'POST /shelf',
        replacement: '/shelves',
        requester_id: req?.user?.id,
        shelf_number: req.body?.shelf_number,
        shelf_row: req.body?.shelf_row
    });
    VirtualBookshelfController.addShelf(req, res);
});

module.exports = router;
