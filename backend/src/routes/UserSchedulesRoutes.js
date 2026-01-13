const express = require('express');
const router = express.Router();
const userSchedulesController = require('../controllers/UserSchedulesController');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * Rotas relacionadas às grades horárias dos usuários.
 * Todas as rotas requerem autenticação.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// ==================== PLANOS/GRADES ====================

// Lista todas as grades do usuário autenticado
router.get('/', (req, res) => {
    console.log("🔵 [UserSchedulesRoutes] GET / - Listar grades do usuário");
    userSchedulesController.getSchedules(req, res);
});

// Busca uma grade completa (com turmas e disciplinas customizadas)
router.get('/:scheduleId/full', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] GET /${req.params.scheduleId}/full - Buscar grade completa`);
    userSchedulesController.getFullSchedule(req, res);
});

// Cria uma nova grade
router.post('/', (req, res) => {
    console.log("🔵 [UserSchedulesRoutes] POST / - Criar nova grade");
    userSchedulesController.createSchedule(req, res);
});

// Atualiza uma grade (nome, cor de fundo, etc.)
router.put('/:scheduleId', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] PUT /${req.params.scheduleId} - Atualizar grade`);
    userSchedulesController.updateSchedule(req, res);
});

// Remove uma grade (soft delete)
router.delete('/:scheduleId', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] DELETE /${req.params.scheduleId} - Remover grade`);
    userSchedulesController.deleteSchedule(req, res);
});

// ==================== TURMAS NA GRADE ====================

// Adiciona uma turma à grade
router.post('/:scheduleId/classes', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] POST /${req.params.scheduleId}/classes - Adicionar turma`);
    userSchedulesController.addClass(req, res);
});

// Remove uma turma da grade
router.delete('/:scheduleId/classes/:classId', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] DELETE /${req.params.scheduleId}/classes/${req.params.classId} - Remover turma`);
    userSchedulesController.removeClass(req, res);
});

// Atualiza a cor de uma turma na grade
router.patch('/:scheduleId/classes/:classId/color', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] PATCH /${req.params.scheduleId}/classes/${req.params.classId}/color - Atualizar cor`);
    userSchedulesController.updateClassColor(req, res);
});

// ==================== DISCIPLINAS CUSTOMIZADAS ====================

// Lista disciplinas customizadas do usuário
router.get('/custom-disciplines', (req, res) => {
    console.log("🔵 [UserSchedulesRoutes] GET /custom-disciplines - Listar disciplinas customizadas");
    userSchedulesController.getCustomDisciplines(req, res);
});

// Cria uma disciplina customizada
router.post('/custom-disciplines', (req, res) => {
    console.log("🔵 [UserSchedulesRoutes] POST /custom-disciplines - Criar disciplina customizada");
    userSchedulesController.createCustomDiscipline(req, res);
});

// Atualiza uma disciplina customizada
router.put('/custom-disciplines/:disciplineId', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] PUT /custom-disciplines/${req.params.disciplineId} - Atualizar disciplina customizada`);
    userSchedulesController.updateCustomDiscipline(req, res);
});

// Remove uma disciplina customizada
router.delete('/custom-disciplines/:disciplineId', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] DELETE /custom-disciplines/${req.params.disciplineId} - Remover disciplina customizada`);
    userSchedulesController.deleteCustomDiscipline(req, res);
});

// ==================== CONFLITOS ====================

// Verifica conflitos ao adicionar uma turma
router.post('/:scheduleId/check-conflicts', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] POST /${req.params.scheduleId}/check-conflicts - Verificar conflitos`);
    userSchedulesController.checkConflicts(req, res);
});

// ==================== DISCIPLINAS NA LISTA (SIDEBAR) ====================

// Lista disciplinas da lista do plano
router.get('/:scheduleId/disciplines', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] GET /${req.params.scheduleId}/disciplines - Listar disciplinas da lista`);
    userSchedulesController.getDisciplines(req, res);
});

// Adiciona uma disciplina à lista do plano
router.post('/:scheduleId/disciplines', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] POST /${req.params.scheduleId}/disciplines - Adicionar disciplina à lista`);
    userSchedulesController.addDiscipline(req, res);
});

// Atualiza uma disciplina na lista do plano
router.put('/:scheduleId/disciplines/:disciplineId', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] PUT /${req.params.scheduleId}/disciplines/${req.params.disciplineId} - Atualizar disciplina`);
    userSchedulesController.updateDiscipline(req, res);
});

// Remove uma disciplina da lista do plano
router.delete('/:scheduleId/disciplines/:disciplineId', (req, res) => {
    console.log(`🔵 [UserSchedulesRoutes] DELETE /${req.params.scheduleId}/disciplines/${req.params.disciplineId} - Remover disciplina`);
    userSchedulesController.removeDiscipline(req, res);
});

module.exports = router;
