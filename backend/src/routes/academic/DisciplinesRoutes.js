const express = require('express');
const router = express.Router();
const disciplinesController = require('../../controllers/academic/DisciplinesController');

/**
 * Rotas relacionadas a disciplinas da USP.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// Criar disciplina manualmente
router.post('/', (req, res) => {
    console.log("🔵 [DisciplinesRoutes] POST / - Criar disciplina manualmente");
    disciplinesController.createDiscipline(req, res);
});

// Busca por termo (autocomplete) - DEVE vir antes de /:codigo
router.get('/search', (req, res) => {
    console.log("🔵 [DisciplinesRoutes] GET /search - Buscar por termo");
    disciplinesController.searchDisciplines(req, res);
});

// Estatísticas das disciplinas - DEVE vir antes de /:codigo
router.get('/stats', (req, res) => {
    console.log("🔵 [DisciplinesRoutes] GET /stats - Obter estatísticas");
    disciplinesController.getStats(req, res);
});

// Conta total de disciplinas - DEVE vir antes de /:codigo
router.get('/count', (req, res) => {
    console.log("🔵 [DisciplinesRoutes] GET /count - Contar disciplinas");
    disciplinesController.countDisciplines(req, res);
});

// Lista todos os campi disponíveis - DEVE vir antes de /:codigo
router.get('/campi', (req, res) => {
    console.log("🔵 [DisciplinesRoutes] GET /campi - Buscar campi");
    disciplinesController.getCampi(req, res);
});

// Lista todas as unidades disponíveis - DEVE vir antes de /:codigo
router.get('/unidades', (req, res) => {
    console.log("🔵 [DisciplinesRoutes] GET /unidades - Buscar unidades");
    disciplinesController.getUnidades(req, res);
});

// Busca disciplinas com filtros opcionais
router.get('/', (req, res) => {
    console.log("🔵 [DisciplinesRoutes] GET / - Buscar disciplinas");
    disciplinesController.getDisciplines(req, res);
});

// Busca disciplina completa por código (com turmas, horários e professores)
router.get('/:codigo/full', (req, res) => {
    console.log(`🔵 [DisciplinesRoutes] GET /${req.params.codigo}/full - Buscar disciplina completa`);
    disciplinesController.getFullDiscipline(req, res);
});

// Busca disciplina por código
router.get('/:codigo', (req, res) => {
    console.log(`🔵 [DisciplinesRoutes] GET /${req.params.codigo} - Buscar disciplina`);
    disciplinesController.getDisciplineByCodigo(req, res);
});

module.exports = router;
