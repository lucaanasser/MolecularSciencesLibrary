const LoansService = require('../services/LoansService');

const LoansController = {
    // Cria um novo empréstimo
    borrowBook: async (req, res) => {
        const { book_id, NUSP, password } = req.body;
        if (!book_id || !NUSP || !password) {
            console.log(`[LoansController] Dados obrigatórios ausentes: book_id=${book_id}, NUSP=${NUSP}`);
            return res.status(400).json({ error: 'book_id, NUSP e password são obrigatórios' });
        }
        try {
            const loan = await LoansService.borrowBook(book_id, NUSP, password);
            res.status(201).json(loan);
        } catch (err) {
            console.log(`[LoansController] Erro ao criar empréstimo: ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    },

    // Lista todos os empréstimos com detalhes
    listLoans: async (req, res) => {
        try {
            const loans = await LoansService.listLoans();
            res.json(loans);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Lista empréstimos de um usuário específico
    listLoansByUser: async (req, res) => {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId é obrigatório' });
        }
        try {
            const loans = await LoansService.listLoansByUser(userId);
            res.json(loans);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Registra devolução de um empréstimo
    returnBook: async (req, res) => {
        const { NUSP, password, book_id } = req.body;
        if (!NUSP || !password || !book_id) {
            return res.status(400).json({ error: 'NUSP, password e book_id são obrigatórios' });
        }
        try {
            const result = await LoansService.returnBookByUserAndBook(NUSP, password, book_id);
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};

module.exports = LoansController;