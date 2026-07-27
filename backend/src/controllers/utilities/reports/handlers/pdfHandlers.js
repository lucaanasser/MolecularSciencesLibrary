/**
 * Responsabilidade: handlers HTTP de geracao de PDF do bloco utilities/reports.
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints GET /pdf; delega ao ReportsService + PDFGeneratorService.
 * Dependencias criticas: ReportsService, PDFGeneratorService e logger padronizado.
 */

const ReportsService = require('../../../../services/utilities/reports/ReportsService');
const PDFGeneratorService = require('../../../../services/utilities/PDFGeneratorService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

/**
 * O que faz: define headers de download de PDF e envia o buffer.
 * Onde e usada: todos os handlers de PDF deste modulo.
 * Dependencias chamadas: res.setHeader/res.send.
 * Efeitos colaterais: escreve headers e corpo na resposta HTTP.
 */
function sendPdf(res, buffer, filename) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
}

module.exports = {
    /**
     * O que faz: gera e retorna PDF de emprestimos.
     * Onde e usada: rota GET /reports/loans/pdf.
     * Dependencias chamadas: ReportsService.getLoansStatistics e PDFGeneratorService.generateLoansReportPDF.
     * Efeitos colaterais: envia arquivo PDF na resposta.
     */
    async getLoansReportPDF(req, res) {
        try {
            log.start('GET /reports/loans/pdf');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getLoansStatistics(startDate, endDate);
            const pdfBuffer = await PDFGeneratorService.generateLoansReportPDF(data);

            sendPdf(res, pdfBuffer, `relatorio_emprestimos_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: gera e retorna PDF de usuarios.
     * Onde e usada: rota GET /reports/users/pdf.
     * Dependencias chamadas: ReportsService.getUsersStatistics e PDFGeneratorService.generateUsersReportPDF.
     * Efeitos colaterais: envia arquivo PDF na resposta.
     */
    async getUsersReportPDF(req, res) {
        try {
            log.start('GET /reports/users/pdf');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getUsersStatistics(startDate, endDate);
            const pdfBuffer = await PDFGeneratorService.generateUsersReportPDF(data);

            sendPdf(res, pdfBuffer, `relatorio_usuarios_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: gera e retorna PDF do acervo.
     * Onde e usada: rota GET /reports/books/pdf.
     * Dependencias chamadas: ReportsService.getBooksStatistics e PDFGeneratorService.generateBooksReportPDF.
     * Efeitos colaterais: envia arquivo PDF na resposta.
     */
    async getBooksReportPDF(req, res) {
        try {
            log.start('GET /reports/books/pdf');
            const data = await ReportsService.getBooksStatistics();
            const pdfBuffer = await PDFGeneratorService.generateBooksReportPDF(data);

            sendPdf(res, pdfBuffer, `relatorio_acervo_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: gera e retorna PDF de doadores.
     * Onde e usada: rota GET /reports/donators/pdf.
     * Dependencias chamadas: ReportsService.getDonatorsStatistics e PDFGeneratorService.generateDonatorsReportPDF.
     * Efeitos colaterais: envia arquivo PDF na resposta.
     */
    async getDonatorsReportPDF(req, res) {
        try {
            log.start('GET /reports/donators/pdf');
            const { startDate, endDate } = req.query;
            const data = await ReportsService.getDonatorsStatistics(startDate, endDate);
            const pdfBuffer = await PDFGeneratorService.generateDonatorsReportPDF(data);

            sendPdf(res, pdfBuffer, `relatorio_doadores_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: gera e retorna PDF completo com todos os dados.
     * Onde e usada: rota GET /reports/complete/pdf.
     * Dependencias chamadas: ReportsService.generateCompleteReport e PDFGeneratorService.generateCompleteReportPDF.
     * Efeitos colaterais: envia arquivo PDF na resposta.
     */
    async getCompleteReportPDF(req, res) {
        try {
            log.start('GET /reports/complete/pdf');
            const data = await ReportsService.generateCompleteReport();
            const pdfBuffer = await PDFGeneratorService.generateCompleteReportPDF(data);

            sendPdf(res, pdfBuffer, `relatorio_completo_biblioteca_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            log.error('Erro', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    }
};
