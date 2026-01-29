/**
 * Rotas para relatórios da biblioteca.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const express = require('express');
const router = express.Router();
const ReportsController = require('../../controllers/utilities/ReportsController');

// Empréstimos
router.get('/loans', (req, res) => ReportsController.getLoansStatistics(req, res));
router.get('/loans/pdf', (req, res) => ReportsController.getLoansReportPDF(req, res));

// Usuários
router.get('/users', (req, res) => ReportsController.getUsersStatistics(req, res));
router.get('/users/pdf', (req, res) => ReportsController.getUsersReportPDF(req, res));

// Acervo
router.get('/books', (req, res) => ReportsController.getBooksStatistics(req, res));
router.get('/books/pdf', (req, res) => ReportsController.getBooksReportPDF(req, res));

// Doadores
router.get('/donators', (req, res) => ReportsController.getDonatorsStatistics(req, res));
router.get('/donators/pdf', (req, res) => ReportsController.getDonatorsReportPDF(req, res));

// Relatório completo
router.get('/complete', (req, res) => ReportsController.getCompleteReport(req, res));
router.get('/complete/pdf', (req, res) => ReportsController.getCompleteReportPDF(req, res));

module.exports = router;
