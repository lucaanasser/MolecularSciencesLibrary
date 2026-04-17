/**
 * Responsabilidade: declarar endpoints HTTP unificados de doadores.
 * Camada: routes.
 * Entradas/Saidas: recebe requests em /api/donators e delega para DonatorsController.
 * Dependencias criticas: DonatorsController, authenticateToken e logger compartilhado.
 */

const express = require('express');
const multer = require('multer');
const authenticateToken = require('../../../middlewares/authenticateToken');
const DonatorsController = require('../../../controllers/library/donators/DonatorsController');
const { getLogger } = require('../../../shared/logging/logger');

const router = express.Router();
const log = getLogger(__filename);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        log.warn('Acesso restrito a administradores', { route: `${req.method} ${req.originalUrl}` });
        return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }
    return next();
};

router.get('/export/csv', (req, res) => DonatorsController.exportDonatorsToCSV(req, res));
router.post('/import/csv', authenticateToken, requireAdmin, upload.single('csvFile'), (req, res) => DonatorsController.importDonatorsFromCSV(req, res));

router.post('/', (req, res) => DonatorsController.addDonator(req, res));
router.delete('/:id', (req, res) => DonatorsController.removeDonator(req, res));
router.get('/wall', (req, res) => DonatorsController.getAllDonatorsWithBooks(req, res));
router.get('/filter', (req, res) => DonatorsController.getFilteredDonators(req, res));
router.get('/', (req, res) => DonatorsController.getAllDonators(req, res));
router.get('/:id', (req, res) => DonatorsController.getDonatorById(req, res));

module.exports = router;
