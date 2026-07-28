/**
 * Responsabilidade: handlers HTTP de disciplinas customizadas dos planos do usuario.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas custom de user-schedules e delega ao service.
 * Dependencias criticas: UserSchedulesService e logger padronizado.
 */

const userSchedulesService = require('../../../../services/academic/userSchedules/UserSchedulesService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: adiciona uma disciplina customizada a um plano especifico. POST /api/user-schedules/:id/custom
     * Onde e usada: definido para uso legado (nao roteado atualmente).
     * Dependencias chamadas: service.addCustomDiscipline.
     * Efeitos colaterais: persiste disciplina customizada e horarios em DB.
     */
    async addCustomDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { nome, codigo, creditos_aula, creditos_trabalho, color, schedules } = req.body;
            log.start('Adicionando disciplina customizada ao plano', { scheduleId });

            if (!nome) {
                return res.status(400).json({ error: 'nome é obrigatório' });
            }

            if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
                return res.status(400).json({ error: 'schedules deve ser um array com pelo menos um horário' });
            }

            // Validar cada schedule
            for (const schedule of schedules) {
                if (!schedule.dia || !schedule.horario_inicio || !schedule.horario_fim) {
                    return res.status(400).json({ error: 'Cada schedule deve ter dia, horario_inicio e horario_fim' });
                }
            }

            const result = await userSchedulesService.addCustomDiscipline(scheduleId, userId, {
                nome, codigo, creditos_aula, creditos_trabalho, color, schedules
            });

            if (!result) {
                log.warn('Plano nao encontrado', { scheduleId });
                return res.status(404).json({ error: 'Plano não encontrado' });
            }

            log.success('Disciplina customizada adicionada', { scheduleId });
            res.status(201).json(result);
        } catch (error) {
            log.error('Erro ao adicionar disciplina customizada', { err: error.message });
            res.status(500).json({ error: 'Erro ao adicionar disciplina customizada' });
        }
    },

    /**
     * O que faz: cria disciplina customizada (alias sem scheduleId na rota). POST /api/user-schedules/custom-disciplines
     * Onde e usada: rota POST /custom-disciplines.
     * Dependencias chamadas: service.addCustomDiscipline (usando schedule_id do body).
     * Efeitos colaterais: persiste disciplina customizada e horarios em DB.
     */
    async createCustomDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const { nome, codigo, creditos_aula, creditos_trabalho, color, schedule_id, schedules } = req.body;
            log.start('Criando disciplina customizada para usuario', { userId });

            if (!nome) {
                return res.status(400).json({ error: 'nome é obrigatório' });
            }

            if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
                return res.status(400).json({ error: 'schedules deve ser um array com pelo menos um horário' });
            }

            // Validar cada schedule
            for (const schedule of schedules) {
                if (!schedule.dia || !schedule.horario_inicio || !schedule.horario_fim) {
                    return res.status(400).json({ error: 'Cada schedule deve ter dia, horario_inicio e horario_fim' });
                }
            }

            const result = await userSchedulesService.addCustomDiscipline(schedule_id, userId, {
                nome, codigo, creditos_aula, creditos_trabalho, color, schedules
            });

            log.success('Disciplina customizada criada', { id: result.id });
            res.status(201).json(result);
        } catch (error) {
            log.error('Erro ao criar disciplina customizada', { err: error.message });
            res.status(500).json({ error: 'Erro ao criar disciplina customizada' });
        }
    },

    /**
     * O que faz: lista todas as disciplinas customizadas do usuario. GET /api/user-schedules/custom-disciplines
     * Onde e usada: rota GET /custom-disciplines.
     * Dependencias chamadas: service.getCustomDisciplines.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getCustomDisciplines(req, res) {
        try {
            const userId = req.user.id;
            log.start('Listando disciplinas customizadas do usuario', { userId });

            const disciplines = await userSchedulesService.getCustomDisciplines(userId);

            log.success('Disciplinas customizadas encontradas', { count: disciplines.length });
            res.json(disciplines);
        } catch (error) {
            log.error('Erro ao listar disciplinas customizadas', { err: error.message });
            res.status(500).json({ error: 'Erro ao listar disciplinas customizadas' });
        }
    },

    /**
     * O que faz: atualiza uma disciplina customizada. PUT /api/user-schedules/custom/:customId
     * Onde e usada: rota PUT /custom-disciplines/:disciplineId.
     * Dependencias chamadas: service.updateCustomDiscipline.
     * Efeitos colaterais: atualiza disciplina customizada em DB.
     */
    async updateCustomDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const customId = parseInt(req.params.customId);
            const updates = req.body;
            log.start('Atualizando disciplina customizada', { customId });

            await userSchedulesService.updateCustomDiscipline(customId, userId, updates);

            log.success('Disciplina customizada atualizada', { customId });
            res.json({ success: true });
        } catch (error) {
            log.error('Erro ao atualizar disciplina customizada', { err: error.message });
            res.status(500).json({ error: 'Erro ao atualizar disciplina customizada' });
        }
    },

    /**
     * O que faz: remove uma disciplina customizada. DELETE /api/user-schedules/custom/:customId
     * Onde e usada: rota DELETE /custom-disciplines/:disciplineId.
     * Dependencias chamadas: service.deleteCustomDiscipline.
     * Efeitos colaterais: remove disciplina customizada em DB.
     */
    async deleteCustomDiscipline(req, res) {
        try {
            const userId = req.user.id;
            const customId = parseInt(req.params.customId);
            log.start('Removendo disciplina customizada', { customId });

            await userSchedulesService.deleteCustomDiscipline(customId, userId);

            log.success('Disciplina customizada removida', { customId });
            res.json({ success: true });
        } catch (error) {
            log.error('Erro ao remover disciplina customizada', { err: error.message });
            res.status(500).json({ error: 'Erro ao remover disciplina customizada' });
        }
    }
};
