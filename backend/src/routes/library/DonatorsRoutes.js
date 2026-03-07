const express = require('express');
const DonatorsController = require('../../controllers/library/DonatorsController');
const multer = require('multer');
const authenticateToken = require('../../middlewares/authenticateToken');
const router = express.Router();

// Configurar multer para upload de arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }
    next();
}

// Exportar doadores como CSV
router.get('/export/csv', DonatorsController.exportDonatorsToCSV);

// Importar doadores de CSV
router.post('/import/csv', authenticateToken, requireAdmin, upload.single('csvFile'), DonatorsController.importDonatorsFromCSV);

router.post('/', DonatorsController.addDonator);
router.delete('/:id', DonatorsController.removeDonator);
router.get('/', DonatorsController.getAllDonators);
router.get('/:id', DonatorsController.getDonatorById);
router.get('/filter', DonatorsController.getFilteredDonators);

module.exports = router;
