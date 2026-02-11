const LoansService = require('../../services/library/LoansService');

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
            return res.status(400).json({ error: 'ID do livro, NUSP e senha são obrigatórios' });
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

    // Cria um novo empréstimo como admin (sem senha)
    borrowBookAsAdmin: async (req, res) => {
        const { book_id, NUSP } = req.body;
        console.log(`🔵 [LoansController] [ADMIN] Iniciando criação de empréstimo: book_id=${book_id}, NUSP=${NUSP}`);
        if (!book_id || !NUSP) {
            console.warn(`🟡 [LoansController] [ADMIN] Dados obrigatórios ausentes: book_id=${book_id}, NUSP=${NUSP}`);
            return res.status(400).json({ error: 'ID do livro e NUSP são obrigatórios' });
        }
        try {
            const loan = await LoansService.borrowBookAsAdmin(book_id, NUSP);
            console.log(`🟢 [LoansController] [ADMIN] Empréstimo criado com sucesso:`, loan);
            res.status(201).json(loan);
        } catch (err) {
            console.error(`🔴 [LoansController] [ADMIN] Erro ao criar empréstimo: ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    },

    // Registra devolução de um empréstimo
    returnBook: async (req, res) => {
        const { book_id } = req.body;
        console.log(`🔵 [LoansController] Iniciando devolução: book_id=${book_id}`);
        if (!book_id) {
            console.warn("🟡 [LoansController] ID do livro não fornecido para devolução");
            return res.status(400).json({ error: 'ID do livro é obrigatório' });
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

    // Registra uso interno de livro (empréstimo fantasma)
    registerInternalUse: async (req, res) => {
        const { book_id } = req.body;
        console.log(`🔵 [LoansController] Registrando uso interno: book_id=${book_id}`);

        if (!book_id) {
            console.warn("🟡 [LoansController] book_id não fornecido para uso interno");
            return res.status(400).json({ error: 'ID do livro é obrigatório' });
        }

        try {
            const result = await LoansService.registerInternalUse(book_id);
            console.log("🟢 [LoansController] Uso interno registrado com sucesso");
            res.status(201).json(result);
        } catch (err) {
            console.error(`🔴 [LoansController] Erro ao registrar uso interno: ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    },

    // Preview da renovação
    previewRenewLoan: async (req, res) => {
        const loan_id = req.params.id;
        const { user_id } = req.body;
        console.log(`🔵 [LoansController] Preview renovação: loan_id=${loan_id}, user_id=${user_id}`);
        if (!loan_id || !user_id) {
            return res.status(400).json({ error: 'ID do empréstimo e ID do usuário são obrigatórios' });
        }
        try {
            const preview = await LoansService.previewRenewLoan(loan_id, user_id);
            res.json(preview);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // Renova um empréstimo
    renewLoan: async (req, res) => {
        const { id } = req.params;
        const user_id = req.body.user_id; // ou obtenha do token, se necessário
        if (!user_id) return res.status(400).json({ error: 'ID do usuário é obrigatório' });
        try {
            const result = await LoansService.renewLoan(Number(id), user_id);
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // Preview da extensão
    previewExtendLoan: async (req, res) => {
        try {
            const { id } = req.params; // loan id
            const { user_id } = req.body;
            const data = await LoansService.previewExtendLoan(Number(id), Number(user_id));
            res.json(data);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // Extensão de empréstimo
    extendLoan: async (req, res) => {
        try {
            const { id } = req.params;
            const { user_id } = req.body;
            const data = await LoansService.extendLoan(Number(id), Number(user_id));
            res.json(data);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // Lista todos os empréstimos
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

    // Lista empréstimos de um usuário específico
    listLoansByUser: async (req, res) => {
        const userId = req.params.userId;
        console.log(`🔵 [LoansController] Listando empréstimos do usuário: userId=${userId}`);
        if (!userId) {
            console.warn("🟡 [LoansController] ID do usuário não fornecido");
            return res.status(400).json({ error: 'ID do usuário é obrigatório' });
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

    // Lista empréstimos ativos de um usuário específico
    listActiveLoansByUser: async (req, res) => {
        const userId = req.params.userId;
        console.log(`🔵 [LoansController] Listando empréstimos ativos do usuário: userId=${userId}`);
        if (!userId) {
            console.warn("🟡 [LoansController] ID do usuário não fornecido");
            return res.status(400).json({ error: 'ID do usuário é obrigatório' });
        }
        try {
            const loans = await LoansService.listActiveLoansByUser(userId);
            console.log(`🟢 [LoansController] Empréstimos ativos do usuário ${userId} encontrados: ${loans.length}`);
            res.json(loans);
        } catch (err) {
            console.error(`🔴 [LoansController] Erro ao listar empréstimos ativos do usuário: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    },
    
};

module.exports = LoansController;