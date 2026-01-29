const express = require('express');
const DonatorsController = require('../../controllers/library/DonatorsController');
const multer = require('multer');
const router = express.Router();

// Configurar multer para upload de arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Exportar doadores como CSV
router.get('/export/csv', DonatorsController.exportDonatorsToCSV);

// Importar doadores de CSV
router.post('/import/csv', upload.single('csvFile'), DonatorsController.importDonatorsFromCSV);

router.post('/', DonatorsController.addDonator);
router.delete('/:id', DonatorsController.removeDonator);
router.get('/', DonatorsController.getAllDonators);
router.get('/:id', DonatorsController.getDonatorById);
router.get('/filter', DonatorsController.getFilteredDonators);

module.exports = router;
