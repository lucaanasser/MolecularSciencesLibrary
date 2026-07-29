/**
 * Responsabilidade: handlers HTTP JSON do bloco utilities/reports.
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints GET de estatisticas; delega ao ReportsService.
 * Dependencias criticas: ReportsService (fachada modular) e logger padronizado.
 */

const ReportsService = require('../../../../services/utilities/reports/ReportsService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: retorna estatisticas de emprestimos em JSON.
     * Onde e usada: rota GET /reports/loans.
     * Dependencias chamadas: ReportsService.getLoansStatistics.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getLoansStatistics(req, res) {
        try {
            log.start('GET /reports/loans');
            const data = await ReportsService.getLoansStatistics();
            res.json(data);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: retorna estatisticas de usuarios em JSON.
     * Onde e usada: rota GET /reports/users.
     * Dependencias chamadas: ReportsService.getUsersStatistics.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getUsersStatistics(req, res) {
        try {
            log.start('GET /reports/users');
            const data = await ReportsService.getUsersStatistics();
            res.json(data);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: retorna estatisticas do acervo em JSON.
     * Onde e usada: rota GET /reports/books.
     * Dependencias chamadas: ReportsService.getBooksStatistics.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getBooksStatistics(req, res) {
        try {
            log.start('GET /reports/books');
            const data = await ReportsService.getBooksStatistics();
            res.json(data);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: retorna estatisticas de doadores em JSON (com filtro opcional de periodo).
     * Onde e usada: rota GET /reports/donators.
     * Dependencias chamadas: ReportsService.getDonatorsStatistics.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getDonatorsStatistics(req, res) {
        try {
            log.start('GET /reports/donators');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getDonatorsStatistics(startDate, endDate);
            res.json(data);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: retorna relatorio completo consolidado em JSON.
     * Onde e usada: rota GET /reports/complete.
     * Dependencias chamadas: ReportsService.generateCompleteReport.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getCompleteReport(req, res) {
        try {
            log.start('GET /reports/complete');
            const data = await ReportsService.generateCompleteReport();
            res.json(data);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    }
};
