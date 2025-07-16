const LoansService = require('../services/LoansService');

/**
 * Controller responsável pelas operações de empréstimo de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
const LoansController = {
    // Cria um novo empréstimo
    borrowBook: async (req, res) => {
        const { book_id, NUSP, password } = req.body;
        console.log(`🔵 [LoansController] Iniciando criação de empréstimo: book_id=${book_id}, NUSP=${NUSP}`);
        if (!book_id || !NUSP || !password) {
            console.warn(`🟡 [LoansController] Dados obrigatórios ausentes: book_id=${book_id}, NUSP=${NUSP}`);
            return res.status(400).json({ error: 'book_id, NUSP e password são obrigatórios' });
        }
        try {
            const loan = await LoansService.borrowBook(book_id, NUSP, password);
            console.log(`🟢 [LoansController] Empréstimo criado com sucesso:`, loan);
            res.status(201).json(loan);
        } catch (err) {
            console.error(`🔴 [LoansController] Erro ao criar empréstimo: ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    },

    // Lista todos os empréstimos com detalhes
    listLoans: async (req, res) => {
        console.log("🔵 [LoansController] Listando todos os empréstimos");
        try {
            const loans = await LoansService.listLoans();
            console.log(`🟢 [LoansController] Empréstimos encontrados: ${loans.length}`);
            res.json(loans);
        } catch (err) {
            console.error(`🔴 [LoansController] Erro ao listar empréstimos: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    },

    // Lista empréstimos de um usuário específico
    listLoansByUser: async (req, res) => {
        const userId = req.params.userId;
        console.log(`🔵 [LoansController] Listando empréstimos do usuário: userId=${userId}`);
        if (!userId) {
            console.warn("🟡 [LoansController] userId não fornecido");
            return res.status(400).json({ error: 'userId é obrigatório' });
        }
        try {
            const loans = await LoansService.listLoansByUser(userId);
            console.log(`🟢 [LoansController] Empréstimos do usuário ${userId} encontrados: ${loans.length}`);
            res.json(loans);
        } catch (err) {
            console.error(`🔴 [LoansController] Erro ao listar empréstimos do usuário: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    },

    // Registra devolução de um empréstimo
    // Agora não exige mais NUSP/senha, apenas o book_id
    returnBook: async (req, res) => {
        const { book_id } = req.body;
        console.log(`🔵 [LoansController] Iniciando devolução: book_id=${book_id}`);
        if (!book_id) {
            console.warn("🟡 [LoansController] book_id não fornecido para devolução");
            return res.status(400).json({ error: 'book_id é obrigatório' });
        }
        try {
            // Busca o empréstimo ativo para o livro
            const result = await LoansService.returnBookByBookId(book_id);
            console.log(`🟢 [LoansController] Devolução registrada com sucesso:`, result);
            res.json(result);
        } catch (err) {
            console.error(`🔴 [LoansController] Erro ao registrar devolução: ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    },

    // Lista todos os empréstimos ativos com status de atraso
    listActiveLoansWithOverdue: async (req, res) => {
        console.log("🔵 [LoansController] Listando empréstimos ativos com status de atraso");
        try {
            const loans = await LoansService.listActiveLoansWithOverdue();
            res.json(loans);
        } catch (err) {
            console.error(`🔴 [LoansController] Erro ao listar empréstimos ativos: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    },

    // Renova um empréstimo
    renewLoan: async (req, res) => {
        const { id } = req.params;
        const user_id = req.body.user_id; // ou obtenha do token, se necessário
        if (!user_id) return res.status(400).json({ error: 'user_id é obrigatório' });
        try {
            const result = await LoansService.renewLoan(Number(id), user_id);
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};

module.exports = LoansController;