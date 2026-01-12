/**
 * Controller responsável pelos endpoints de relatórios.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const ReportsService = require('../services/ReportsService');
const PDFGeneratorService = require('../services/PDFGeneratorService');

class ReportsController {
    /**
     * GET /api/reports/loans
     * Retorna estatísticas de empréstimos em JSON
     */
    async getLoansStatistics(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/loans');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getLoansStatistics(startDate, endDate);
            res.json(data);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/loans/pdf
     * Gera e retorna PDF de empréstimos
     */
    async getLoansReportPDF(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/loans/pdf');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getLoansStatistics(startDate, endDate);
            const pdfBuffer = await PDFGeneratorService.generateLoansReportPDF(data);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio_emprestimos_${new Date().toISOString().split('T')[0]}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/users
     * Retorna estatísticas de usuários em JSON
     */
    async getUsersStatistics(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/users');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getUsersStatistics(startDate, endDate);
            res.json(data);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/users/pdf
     * Gera e retorna PDF de usuários
     */
    async getUsersReportPDF(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/users/pdf');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getUsersStatistics(startDate, endDate);
            const pdfBuffer = await PDFGeneratorService.generateUsersReportPDF(data);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio_usuarios_${new Date().toISOString().split('T')[0]}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/books
     * Retorna estatísticas do acervo em JSON
     */
    async getBooksStatistics(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/books');
            const data = await ReportsService.getBooksStatistics();
            res.json(data);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/books/pdf
     * Gera e retorna PDF do acervo
     */
    async getBooksReportPDF(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/books/pdf');
            const data = await ReportsService.getBooksStatistics();
            const pdfBuffer = await PDFGeneratorService.generateBooksReportPDF(data);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio_acervo_${new Date().toISOString().split('T')[0]}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/donators
     * Retorna estatísticas de doadores em JSON
     */
    async getDonatorsStatistics(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/donators');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getDonatorsStatistics(startDate, endDate);
            res.json(data);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/donators/pdf
     * Gera e retorna PDF de doadores
     */
    async getDonatorsReportPDF(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/donators/pdf');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getDonatorsStatistics(startDate, endDate);
            const pdfBuffer = await PDFGeneratorService.generateDonatorsReportPDF(data);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio_doadores_${new Date().toISOString().split('T')[0]}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/complete
     * Retorna relatório completo em JSON
     */
    async getCompleteReport(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/complete');
            const data = await ReportsService.generateCompleteReport();
            res.json(data);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/reports/complete/pdf
     * Gera e retorna PDF completo com todos os dados
     */
    async getCompleteReportPDF(req, res) {
        try {
            console.log('🔵 [ReportsController] GET /reports/complete/pdf');
            const data = await ReportsService.generateCompleteReport();
            const pdfBuffer = await PDFGeneratorService.generateCompleteReportPDF(data);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio_completo_biblioteca_${new Date().toISOString().split('T')[0]}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('🔴 [ReportsController] Erro:', error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ReportsController();
