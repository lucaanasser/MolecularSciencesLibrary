const express = require('express');
const router = express.Router();
const RulesController = require('../../controllers/utilities/RulesController');

// 🔵 Início de operação para cada rota
router.get('/', (req, res) => {
    console.log('🔵 [RulesRoutes] GET / - Buscar regras');
    RulesController.getRules(req, res);
});
router.put('/', (req, res) => {
    console.log('🔵 [RulesRoutes] PUT / - Atualizar regras');
    RulesController.updateRules(req, res);
});

module.exports = router;