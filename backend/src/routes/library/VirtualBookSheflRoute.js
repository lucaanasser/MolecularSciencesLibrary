// Rotas para a estante virtual
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const express = require('express');
const router = express.Router();
const VirtualBookShelfController = require('../../controllers/library/VirtualBookShelfController');

// Middleware de autenticação para rotas administrativas
const authenticateToken = require('../../middlewares/authenticateToken');

// GET /api/virtual-bookshelf - Obtém configurações das prateleiras
router.get('/', (req, res) => {
    console.log("🔵 [VirtualBookShelfRoutes] GET / - Obtendo configurações das prateleiras");
    VirtualBookShelfController.getShelvesConfig(req, res);
});

// PUT /api/virtual-bookshelf - Atualiza configurações das prateleiras (admin only)
router.put('/', authenticateToken, (req, res) => {
    console.log("🔵 [VirtualBookShelfRoutes] PUT / - Atualizando configurações das prateleiras");
    // Verificar se é admin
    if (req.user && req.user.role !== 'admin') {
        console.warn("🟡 [VirtualBookShelfRoutes] Acesso negado - usuário não é admin");
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem atualizar configurações.' });
    }
    VirtualBookShelfController.updateShelvesConfig(req, res);
});

// GET /api/virtual-bookshelf/books - Obtém todos os livros ordenados
router.get('/books', (req, res) => {
    console.log("🔵 [VirtualBookShelfRoutes] GET /books - Obtendo livros ordenados");
    VirtualBookShelfController.getOrderedBooks(req, res);
});

// PUT /api/virtual-bookshelf/shelf-start - Atualiza código inicial de uma prateleira (admin only)
router.put('/shelf-start', authenticateToken, (req, res) => {
    console.log("🔵 [VirtualBookShelfRoutes] PUT /shelf-start - Atualizando código inicial da prateleira");
    // Verificar se é admin
    if (req.user && req.user.role !== 'admin') {
        console.warn("🟡 [VirtualBookShelfRoutes] Acesso negado - usuário não é admin");
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem atualizar prateleiras.' });
    }
    VirtualBookShelfController.updateShelfStartCode(req, res);
});

// PUT /api/virtual-bookshelf/shelf-end - Atualiza código final de uma prateleira (admin only)
router.put('/shelf-end', authenticateToken, (req, res) => {
    console.log("🔵 [VirtualBookShelfRoutes] PUT /shelf-end - Atualizando código final da prateleira");
    // Verificar se é admin
    if (req.user && req.user.role !== 'admin') {
        console.warn("🟡 [VirtualBookShelfRoutes] Acesso negado - usuário não é admin");
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem atualizar prateleiras.' });
    }
    VirtualBookShelfController.updateShelfEndCode(req, res);
});

// GET /api/virtual-bookshelf/validate - Valida um código de livro
router.get('/validate', (req, res) => {
    console.log("🔵 [VirtualBookShelfRoutes] GET /validate - Validando código de livro");
    VirtualBookShelfController.validateBookCode(req, res);
});

// GET /api/virtual-bookshelf/shelf-books - Obtém livros de uma prateleira específica
router.get('/shelf-books', (req, res) => {
    console.log("🔵 [VirtualBookShelfRoutes] GET /shelf-books - Obtendo livros da prateleira");
    VirtualBookShelfController.getBooksForShelf(req, res);
});

// POST /api/virtual-bookshelf/shelf - Adiciona nova prateleira (admin only)
router.post('/shelf', authenticateToken, (req, res) => {
    console.log("🔵 [VirtualBookShelfRoutes] POST /shelf - Adicionando nova prateleira");
    if (req.user && req.user.role !== 'admin') {
        console.warn("🟡 [VirtualBookShelfRoutes] Acesso negado - usuário não é admin");
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem adicionar prateleiras.' });
    }
    VirtualBookShelfController.addShelf(req, res);
});

module.exports = router;