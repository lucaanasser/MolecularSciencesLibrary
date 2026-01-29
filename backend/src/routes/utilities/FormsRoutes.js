const express = require('express');
const FormsController = require('../../controllers/utilities/FormsController');
const router = express.Router();

// Endpoint para submissão dos formulários de "Ajude a Biblioteca"
router.post('/submit', FormsController.submitForm);

module.exports = router;
