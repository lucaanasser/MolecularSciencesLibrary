/**
 * Responsabilidade: handlers HTTP de consultas de doadores.
 * Camada: controller.
 * Entradas/Saidas: recebe req/res e retorna consultas com status HTTP apropriado.
 * Dependencias criticas: DonatorsService e logger compartilhado.
 */

const DonatorsService = require('../../../../services/library/donators/DonatorsService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista todos os doadores.
     * Onde e usada: rota GET /api/donators.
     * Dependencias chamadas: DonatorsService.getAllDonators.
     * Efeitos colaterais: nenhum.
     */
    async getAllDonators(req, res) {
        try {
            const donators = await DonatorsService.getAllDonators();
            return res.json(donators);
        } catch (error) {
            log.error('Falha ao listar doadores', { err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: lista doadores com livros para mural.
     * Onde e usada: rota GET /api/donators/wall.
     * Dependencias chamadas: DonatorsService.getAllDonatorsWithBooks.
     * Efeitos colaterais: nenhum.
     */
    async getAllDonatorsWithBooks(req, res) {
        try {
            const donators = await DonatorsService.getAllDonatorsWithBooks();
            return res.json(donators);
        } catch (error) {
            log.error('Falha ao listar mural de doadores', { err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: busca doador por id e retorna 404 quando inexistente.
     * Onde e usada: rota GET /api/donators/:id.
     * Dependencias chamadas: DonatorsService.getDonatorById.
     * Efeitos colaterais: nenhum.
     */
    async getDonatorById(req, res) {
        try {
            const donator = await DonatorsService.getDonatorById(req.params.id);
            if (!donator) {
                return res.status(404).json({ error: 'Donator not found' });
            }
            return res.json(donator);
        } catch (error) {
            log.error('Falha ao buscar doador por id', { donator_id: req.params.id, err: error.message });
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: aplica filtros de consulta e retorna lista de doadores.
     * Onde e usada: rota GET /api/donators/filter.
     * Dependencias chamadas: DonatorsService.getFilteredDonators.
     * Efeitos colaterais: nenhum.
     */
    async getFilteredDonators(req, res) {
        try {
            const donators = await DonatorsService.getFilteredDonators(req.query || {});
            return res.json(donators);
        } catch (error) {
            log.error('Falha ao filtrar doadores', { err: error.message });
            return res.status(400).json({ error: error.message });
        }
    }
};
