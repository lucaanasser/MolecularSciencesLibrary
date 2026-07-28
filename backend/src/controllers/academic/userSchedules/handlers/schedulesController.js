/**
 * Responsabilidade: handlers HTTP de planos/grades do usuario (CRUD de schedules).
 * Camada: controller.
 * Entradas/Saidas: recebe req/res das rotas de user-schedules e delega ao service.
 * Dependencias criticas: UserSchedulesService e logger padronizado.
 */

const userSchedulesService = require('../../../../services/academic/userSchedules/UserSchedulesService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista todos os planos do usuario logado. GET /api/user-schedules
     * Onde e usada: rota GET /.
     * Dependencias chamadas: service.getUserSchedules.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getSchedules(req, res) {
        try {
            const userId = req.user.id;
            log.start('Listando planos do usuario', { userId });

            const schedules = await userSchedulesService.getUserSchedules(userId);
            log.success('Planos encontrados', { count: schedules.length });
            res.json(schedules);
        } catch (error) {
            log.error('Erro ao listar planos', { err: error.message });
            res.status(500).json({ error: 'Erro ao listar planos' });
        }
    },

    /**
     * O que faz: busca um plano por ID. GET /api/user-schedules/:id
     * Onde e usada: definido para uso legado (nao roteado atualmente).
     * Dependencias chamadas: service.getScheduleById.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getScheduleById(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            log.start('Buscando plano', { scheduleId });

            const schedule = await userSchedulesService.getScheduleById(scheduleId, userId);

            if (!schedule) {
                log.warn('Plano nao encontrado ou nao pertence ao usuario', { scheduleId });
                return res.status(404).json({ error: 'Plano não encontrado' });
            }

            log.success('Plano encontrado', { scheduleId });
            res.json(schedule);
        } catch (error) {
            log.error('Erro ao buscar plano', { err: error.message });
            res.status(500).json({ error: 'Erro ao buscar plano' });
        }
    },

    /**
     * O que faz: busca plano completo com turmas, horarios e customizadas. GET /api/user-schedules/:id/full
     * Onde e usada: rota GET /:scheduleId/full.
     * Dependencias chamadas: service.getFullSchedule.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getFullSchedule(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            log.start('Buscando plano completo', { scheduleId });

            const schedule = await userSchedulesService.getFullSchedule(scheduleId, userId);

            if (!schedule) {
                log.warn('Plano nao encontrado', { scheduleId });
                return res.status(404).json({ error: 'Plano não encontrado' });
            }

            log.success('Plano completo encontrado', { scheduleId });
            res.json(schedule);
        } catch (error) {
            log.error('Erro ao buscar plano completo', { err: error.message });
            res.status(500).json({ error: 'Erro ao buscar plano' });
        }
    },

    /**
     * O que faz: cria um novo plano. POST /api/user-schedules
     * Onde e usada: rota POST /.
     * Dependencias chamadas: service.createSchedule.
     * Efeitos colaterais: persiste novo plano em DB.
     */
    async createSchedule(req, res) {
        try {
            const userId = req.user.id;
            const { name } = req.body;
            log.start('Criando plano para usuario', { userId });

            const schedule = await userSchedulesService.createSchedule(userId, name);
            log.success('Plano criado', { scheduleId: schedule.id });
            res.status(201).json(schedule);
        } catch (error) {
            log.error('Erro ao criar plano', { err: error.message });
            res.status(500).json({ error: 'Erro ao criar plano' });
        }
    },

    /**
     * O que faz: atualiza um plano (nome/is_active). PUT /api/user-schedules/:id
     * Onde e usada: rota PUT /:scheduleId.
     * Dependencias chamadas: service.updateSchedule.
     * Efeitos colaterais: atualiza plano em DB.
     */
    async updateSchedule(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            const { name, is_active } = req.body;
            log.start('Atualizando plano', { scheduleId });

            const updated = await userSchedulesService.updateSchedule(scheduleId, userId, { name, is_active });

            if (!updated) {
                log.warn('Plano nao encontrado', { scheduleId });
                return res.status(404).json({ error: 'Plano não encontrado' });
            }

            log.success('Plano atualizado', { scheduleId });
            res.json(updated);
        } catch (error) {
            log.error('Erro ao atualizar plano', { err: error.message });
            res.status(500).json({ error: 'Erro ao atualizar plano' });
        }
    },

    /**
     * O que faz: soft delete de um plano. DELETE /api/user-schedules/:id
     * Onde e usada: rota DELETE /:scheduleId.
     * Dependencias chamadas: service.deleteSchedule.
     * Efeitos colaterais: marca plano como removido em DB.
     */
    async deleteSchedule(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(req.params.scheduleId);
            log.start('Deletando plano', { scheduleId });

            const deleted = await userSchedulesService.deleteSchedule(scheduleId, userId);

            if (!deleted) {
                log.warn('Plano nao encontrado', { scheduleId });
                return res.status(404).json({ error: 'Plano não encontrado' });
            }

            log.success('Plano deletado', { scheduleId });
            res.json({ success: true });
        } catch (error) {
            log.error('Erro ao deletar plano', { err: error.message });
            res.status(500).json({ error: 'Erro ao deletar plano' });
        }
    }
};
