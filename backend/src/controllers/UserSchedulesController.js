// UserSchedulesController gerencia as operações de controle para grades/planos de usuários,
// conectando as rotas aos serviços.
// Padrão de logs:
// 🔵 Início de operação
// 🟢 Sucesso
// 🟡 Aviso/Fluxo alternativo
// 🔴 Erro

const userSchedulesService = require('../services/UserSchedulesService');

class UserSchedulesController {
    constructor() {
        // Bind dos métodos para manter o contexto
        this.getSchedules = this.getSchedules.bind(this);
        this.getScheduleById = this.getScheduleById.bind(this);
        this.getFullSchedule = this.getFullSchedule.bind(this);
        this.createSchedule = this.createSchedule.bind(this);
        this.updateSchedule = this.updateSchedule.bind(this);
        this.deleteSchedule = this.deleteSchedule.bind(this);
        this.addClass = this.addClass.bind(this);
        this.removeClass = this.removeClass.bind(this);
        this.updateClass = this.updateClass.bind(this);
        this.updateClassColor = this.updateClassColor.bind(this);
        this.addCustomDiscipline = this.addCustomDiscipline.bind(this);
        this.createCustomDiscipline = this.createCustomDiscipline.bind(this);
        this.getCustomDisciplines = this.getCustomDisciplines.bind(this);
        this.updateCustomDiscipline = this.updateCustomDiscipline.bind(this);
        this.deleteCustomDiscipline = this.deleteCustomDiscipline.bind(this);
        this.getConflicts = this.getConflicts.bind(this);
        this.checkConflicts = this.checkConflicts.bind(this);
        this.getCredits = this.getCredits.bind(this);
    }

    /**
     * Lista todos os planos do usuário logado
     * GET /api/user-schedules
     */
    async getSchedules(req, res) {
        try {
            const userId = req.user.id;
            console.log(`🔵 [UserSchedulesController] Listando planos do usuário ${userId}`);
            
            const schedules = await userSchedulesService.getUserSchedules(userId);
            console.log(`🟢 [UserSchedulesController] ${schedules.length} planos encontrados`);
            res.json(schedules);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao listar planos:", error.message);
            res.status(500).json({ error: 'Erro ao listar planos' });
        }
    }

    /**
     * Busca um plano por ID
     * GET /api/user-schedules/:id
     */
    async getScheduleById(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            console.log(`🔵 [UserSchedulesController] Buscando plano ${scheduleId}`);
            
            const schedule = await userSchedulesService.getScheduleById(scheduleId, userId);
            
            if (!schedule) {
                console.warn(`🟡 [UserSchedulesController] Plano não encontrado ou não pertence ao usuário`);
                return res.status(404).json({ error: 'Plano não encontrado' });
            }
            
            console.log(`🟢 [UserSchedulesController] Plano encontrado`);
            res.json(schedule);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao buscar plano:", error.message);
            res.status(500).json({ error: 'Erro ao buscar plano' });
        }
    }

    /**
     * Busca plano completo com turmas, horários e disciplinas customizadas
     * GET /api/user-schedules/:id/full
     */
    async getFullSchedule(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            console.log(`🔵 [UserSchedulesController] Buscando plano completo ${scheduleId}`);
            
            const schedule = await userSchedulesService.getFullSchedule(scheduleId, userId);
            
            if (!schedule) {
                console.warn(`🟡 [UserSchedulesController] Plano não encontrado`);
                return res.status(404).json({ error: 'Plano não encontrado' });
            }
            
            console.log(`🟢 [UserSchedulesController] Plano completo encontrado`);
            res.json(schedule);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao buscar plano completo:", error.message);
            res.status(500).json({ error: 'Erro ao buscar plano' });
        }
    }

    /**
     * Cria um novo plano
     * POST /api/user-schedules
     */
    async createSchedule(req, res) {
        try {
            const userId = req.user.id;
            const { name } = req.body;
            console.log(`🔵 [UserSchedulesController] Criando plano para usuário ${userId}`);
            
            const schedule = await userSchedulesService.createSchedule(userId, name);
            console.log(`🟢 [UserSchedulesController] Plano criado: ${schedule.id}`);
            res.status(201).json(schedule);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao criar plano:", error.message);
            res.status(500).json({ error: 'Erro ao criar plano' });
        }
    }

    /**
     * Atualiza um plano (nome)
     * PUT /api/user-schedules/:id
     */
    async updateSchedule(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { name, is_active } = req.body;
            console.log(`🔵 [UserSchedulesController] Atualizando plano ${scheduleId}`);
            
            const updated = await userSchedulesService.updateSchedule(scheduleId, userId, { name, is_active });
            
            if (!updated) {
                console.warn(`🟡 [UserSchedulesController] Plano não encontrado`);
                return res.status(404).json({ error: 'Plano não encontrado' });
            }
            
            console.log(`🟢 [UserSchedulesController] Plano atualizado`);
            res.json(updated);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao atualizar plano:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar plano' });
        }
    }

    /**
     * Soft delete de um plano
     * DELETE /api/user-schedules/:id
     */
    async deleteSchedule(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            console.log(`🔵 [UserSchedulesController] Deletando plano ${scheduleId}`);
            
            const deleted = await userSchedulesService.deleteSchedule(scheduleId, userId);
            
            if (!deleted) {
                console.warn(`🟡 [UserSchedulesController] Plano não encontrado`);
                return res.status(404).json({ error: 'Plano não encontrado' });
            }
            
            console.log(`🟢 [UserSchedulesController] Plano deletado`);
            res.json({ success: true });
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao deletar plano:", error.message);
            res.status(500).json({ error: 'Erro ao deletar plano' });
        }
    }

    /**
     * Adiciona uma turma ao plano
     * POST /api/user-schedules/:id/classes
     */
    async addClass(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { classId } = req.body;
            console.log(`🔵 [UserSchedulesController] Adicionando turma ${classId} ao plano ${scheduleId}`);
            
            if (!classId) {
                return res.status(400).json({ error: 'classId é obrigatório' });
            }

            const result = await userSchedulesService.addClassToSchedule(scheduleId, userId, classId);
            
            if (!result) {
                console.warn(`🟡 [UserSchedulesController] Plano não encontrado`);
                return res.status(404).json({ error: 'Plano não encontrado' });
            }
            
            console.log(`🟢 [UserSchedulesController] Turma adicionada`);
            res.status(201).json(result);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao adicionar turma:", error.message);
            res.status(500).json({ error: 'Erro ao adicionar turma' });
        }
    }

    /**
     * Remove uma turma do plano
     * DELETE /api/user-schedules/:id/classes/:classId
     */
    async removeClass(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const classId = parseInt(req.params.classId);
            console.log(`🔵 [UserSchedulesController] Removendo turma ${classId} do plano ${scheduleId}`);
            
            const removed = await userSchedulesService.removeClassFromSchedule(scheduleId, userId, classId);
            
            if (!removed) {
                console.warn(`🟡 [UserSchedulesController] Plano não encontrado`);
                return res.status(404).json({ error: 'Plano não encontrado' });
            }
            
            console.log(`🟢 [UserSchedulesController] Turma removida`);
            res.json({ success: true });
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao remover turma:", error.message);
            res.status(500).json({ error: 'Erro ao remover turma' });
        }
    }

    /**
     * Atualiza uma turma no plano (cor, visibilidade)
     * PUT /api/user-schedules/classes/:scheduleClassId
     */
    async updateClass(req, res) {
        try {
            const userId = req.user.id;
            const scheduleClassId = parseInt(req.params.scheduleClassId);
            const { color, is_visible } = req.body;
            console.log(`🔵 [UserSchedulesController] Atualizando turma ${scheduleClassId}`);
            
            await userSchedulesService.updateScheduleClass(scheduleClassId, userId, { color, is_visible });
            
            console.log(`🟢 [UserSchedulesController] Turma atualizada`);
            res.json({ success: true });
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao atualizar turma:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar turma' });
        }
    }

    /**
     * Adiciona uma disciplina customizada
     * POST /api/user-schedules/:id/custom
     */
    async addCustomDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { nome, codigo, dia, horario_inicio, horario_fim, color } = req.body;
            console.log(`🔵 [UserSchedulesController] Adicionando disciplina customizada ao plano ${scheduleId}`);
            
            if (!nome || !dia || !horario_inicio || !horario_fim) {
                return res.status(400).json({ error: 'nome, dia, horario_inicio e horario_fim são obrigatórios' });
            }

            const result = await userSchedulesService.addCustomDiscipline(scheduleId, userId, {
                nome, codigo, dia, horario_inicio, horario_fim, color
            });
            
            if (!result) {
                console.warn(`🟡 [UserSchedulesController] Plano não encontrado`);
                return res.status(404).json({ error: 'Plano não encontrado' });
            }
            
            console.log(`🟢 [UserSchedulesController] Disciplina customizada adicionada`);
            res.status(201).json(result);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao adicionar disciplina customizada:", error.message);
            res.status(500).json({ error: 'Erro ao adicionar disciplina customizada' });
        }
    }

    /**
     * Atualiza uma disciplina customizada
     * PUT /api/user-schedules/custom/:customId
     */
    async updateCustomDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const customId = parseInt(req.params.customId);
            const updates = req.body;
            console.log(`🔵 [UserSchedulesController] Atualizando disciplina customizada ${customId}`);
            
            await userSchedulesService.updateCustomDiscipline(customId, userId, updates);
            
            console.log(`🟢 [UserSchedulesController] Disciplina customizada atualizada`);
            res.json({ success: true });
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao atualizar disciplina customizada:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar disciplina customizada' });
        }
    }

    /**
     * Remove uma disciplina customizada
     * DELETE /api/user-schedules/custom/:customId
     */
    async deleteCustomDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const customId = parseInt(req.params.customId);
            console.log(`🔵 [UserSchedulesController] Removendo disciplina customizada ${customId}`);
            
            await userSchedulesService.deleteCustomDiscipline(customId, userId);
            
            console.log(`🟢 [UserSchedulesController] Disciplina customizada removida`);
            res.json({ success: true });
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao remover disciplina customizada:", error.message);
            res.status(500).json({ error: 'Erro ao remover disciplina customizada' });
        }
    }

    /**
     * Detecta conflitos de horário em um plano
     * GET /api/user-schedules/:id/conflicts
     */
    async getConflicts(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            console.log(`🔵 [UserSchedulesController] Detectando conflitos no plano ${scheduleId}`);
            
            const conflicts = await userSchedulesService.detectConflicts(scheduleId, userId);
            
            console.log(`🟢 [UserSchedulesController] ${conflicts.length} conflitos encontrados`);
            res.json(conflicts);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao detectar conflitos:", error.message);
            res.status(500).json({ error: 'Erro ao detectar conflitos' });
        }
    }

    /**
     * Calcula créditos de um plano
     * GET /api/user-schedules/:id/credits
     */
    async getCredits(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            console.log(`🔵 [UserSchedulesController] Calculando créditos do plano ${scheduleId}`);
            
            const credits = await userSchedulesService.calculateCredits(scheduleId, userId);
            
            console.log(`🟢 [UserSchedulesController] Créditos calculados`);
            res.json(credits);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao calcular créditos:", error.message);
            res.status(500).json({ error: 'Erro ao calcular créditos' });
        }
    }

    /**
     * Verifica conflitos antes de adicionar uma turma
     * POST /api/user-schedules/:scheduleId/check-conflicts
     */
    async checkConflicts(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { classId } = req.body;
            console.log(`🔵 [UserSchedulesController] Verificando conflitos para turma ${classId} no plano ${scheduleId}`);
            
            if (!classId) {
                return res.status(400).json({ error: 'classId é obrigatório' });
            }

            const conflicts = await userSchedulesService.checkConflictsForClass(scheduleId, userId, classId);
            
            console.log(`🟢 [UserSchedulesController] ${conflicts.length} conflitos encontrados`);
            res.json({ hasConflicts: conflicts.length > 0, conflicts });
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao verificar conflitos:", error.message);
            res.status(500).json({ error: 'Erro ao verificar conflitos' });
        }
    }

    /**
     * Lista todas as disciplinas customizadas do usuário
     * GET /api/user-schedules/custom-disciplines
     */
    async getCustomDisciplines(req, res) {
        try {
            const userId = req.user.id;
            console.log(`🔵 [UserSchedulesController] Listando disciplinas customizadas do usuário ${userId}`);
            
            const disciplines = await userSchedulesService.getCustomDisciplines(userId);
            
            console.log(`🟢 [UserSchedulesController] ${disciplines.length} disciplinas customizadas encontradas`);
            res.json(disciplines);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao listar disciplinas customizadas:", error.message);
            res.status(500).json({ error: 'Erro ao listar disciplinas customizadas' });
        }
    }

    /**
     * Cria uma disciplina customizada (alias para addCustomDiscipline sem scheduleId)
     * POST /api/user-schedules/custom-disciplines
     */
    async createCustomDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const { nome, codigo, dia, horario_inicio, horario_fim, color, schedule_id } = req.body;
            console.log(`🔵 [UserSchedulesController] Criando disciplina customizada para usuário ${userId}`);
            
            if (!nome || !dia || !horario_inicio || !horario_fim) {
                return res.status(400).json({ error: 'nome, dia, horario_inicio e horario_fim são obrigatórios' });
            }

            const result = await userSchedulesService.addCustomDiscipline(schedule_id, userId, {
                nome, codigo, dia, horario_inicio, horario_fim, color
            });
            
            console.log(`🟢 [UserSchedulesController] Disciplina customizada criada: ${result.id}`);
            res.status(201).json(result);
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao criar disciplina customizada:", error.message);
            res.status(500).json({ error: 'Erro ao criar disciplina customizada' });
        }
    }

    /**
     * Atualiza a cor de uma turma no plano
     * PATCH /api/user-schedules/:scheduleId/classes/:classId/color
     */
    async updateClassColor(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const classId = parseInt(req.params.classId);
            const { color } = req.body;
            console.log(`🔵 [UserSchedulesController] Atualizando cor da turma ${classId} no plano ${scheduleId}`);
            
            if (!color) {
                return res.status(400).json({ error: 'color é obrigatório' });
            }

            await userSchedulesService.updateScheduleClassColor(scheduleId, userId, classId, color);
            
            console.log(`🟢 [UserSchedulesController] Cor da turma atualizada`);
            res.json({ success: true });
        } catch (error) {
            console.error("🔴 [UserSchedulesController] Erro ao atualizar cor da turma:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar cor da turma' });
        }
    }
}

module.exports = new UserSchedulesController();
