/**
 * Responsabilidade: handlers HTTP de estatísticas do Fórum (globais, contribuidores e por usuário).
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints GET de estatísticas; delega ao model.
 * Dependencias criticas: ForumModel e logger padronizado.
 */

const ForumModel = require('../../../../models/academic/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Estatísticas globais do fórum
     * GET /api/forum/stats
     */
    async getStats(req, res) {
        try {
            log.start('GET /stats - Estatísticas globais');

            const stats = await ForumModel.getGlobalStats();

            log.success('Estatísticas retornadas');
            res.json(stats);
        } catch (error) {
            log.error('Erro ao buscar estatísticas', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
        }
    },

    /**
     * Top contributors
     * GET /api/forum/top-contributors
     */
    async getTopContributors(req, res) {
        try {
            log.start('GET /top-contributors - Top contributors');

            const { limit = 5 } = req.query;
            const contributors = await ForumModel.getTopContributors(Number(limit));

            log.success('Top contributors retornados', { total: contributors.length });
            res.json(contributors);
        } catch (error) {
            log.error('Erro ao buscar top contributors', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar top contributors', details: error.message });
        }
    },

    /**
     * Estatísticas do usuário
     * GET /api/forum/users/:id/stats
     */
    async getUserStats(req, res) {
        try {
            const { id } = req.params;
            log.start('GET /users/:id/stats - Estatísticas do usuário', { id });

            const stats = await ForumModel.getUserStats(Number(id));

            log.success('Estatísticas do usuário retornadas');
            res.json(stats);
        } catch (error) {
            log.error('Erro ao buscar estatísticas do usuário', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
        }
    }
};
