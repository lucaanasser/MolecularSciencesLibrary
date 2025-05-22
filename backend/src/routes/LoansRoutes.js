const express = require('express');
const router = express.Router();
const LoansController = require('../controllers/LoansController');

// Criar empréstimo
router.post('/', LoansController.borrowBook);

// Listar todos os empréstimos
router.get('/', LoansController.listLoans);

// Listar empréstimos de um usuário específico
router.get('/user/:userId', LoansController.listLoansByUser);

// Registrar devolução
router.post('/return', LoansController.returnBook);

module.exports = router;