const RulesModel = require('../../models/utilities/RulesModel');
const LoansModel = require('../../models/library/LoansModel');

const RulesService = {
    getRules: async () => {
        console.log('🔵 [RulesService] Buscando regras de empréstimo');
        try {
            const rules = await RulesModel.getRules();
            console.log('🟢 [RulesService] Regras obtidas:', rules);
            return rules;
        } catch (err) {
            console.error('🔴 [RulesService] Erro ao buscar regras:', err.message);
            throw err;
        }
    },

    updateRules: async (data) => {
        console.log('🔵 [RulesService] Atualizando regras:', data);
        try {
            await RulesModel.updateRules(data);
            const updated = await RulesModel.getRules();
            console.log('🟢 [RulesService] Regras atualizadas:', updated);
            return updated;
        } catch (err) {
            console.error('🔴 [RulesService] Erro ao atualizar regras:', err.message);
            throw err;
        }
    },
    

    propagateNewFields: async (data) => {
        console.log('🔵 [RulesService] Propagando novos campos de regras:', data);
        try {
            await RulesModel.propagateNewFields(data);
            const updated = await RulesModel.getRules();
            console.log('🟢 [RulesService] Novos campos de regras propagados:', updated);
            return updated;
        } catch (err) {
            console.error('🔴 [RulesService] Erro ao propagar novos campos de regras:', err.message);
            throw err;
        }
    },

    /**
     * Verifica se o usuário pode pegar o livro emprestado, de acordo com as regras do sistema.
     * RECEBE user e book
     * RETORNA { allowed: boolean, reason: string }
     */
    checkLoanRules: async (user, book) => {
        const rules = await RulesService.getRules();

        // 1. Verifica se o usuário atingiu limite de empréstimos ativos
        const userLoans = await LoansModel.getLoansByUser(user.id);
        const activeLoans = userLoans.filter(l => !l.returned_at);
        const MAX_ACTIVE_LOANS = rules.max_books_per_user || 5;
        if (activeLoans.length >= MAX_ACTIVE_LOANS) {
            return { allowed: false, reason: `Limite de ${MAX_ACTIVE_LOANS} empréstimos ativos atingido.` };
        }

        // 2. Verifica se o livro está reservado didaticamente
        if (book.is_reserved === 1) {
            return { allowed: false, reason: 'Este livro está reservado didaticamente e não pode ser emprestado durante o semestre.' };
        }

        // 3. Verifica se já existe empréstimo ativo para este livro
        const hasActiveLoan = await LoansModel.hasActiveLoan(book.id);
        if (hasActiveLoan) {
            return { allowed: false, reason: 'Este livro já está emprestado.' };
        }

        // 4. Calcula due_date segundo as regras
        const maxDays = rules.max_days || 7;
        const borrowedAt = new Date();
        const dueDate = new Date(borrowedAt);
        dueDate.setDate(borrowedAt.getDate() + maxDays);
        const dueDateISO = dueDate.toISOString();

        // Outras regras podem ser adicionadas aqui...
        return { allowed: true, reason: '', due_date: dueDateISO };
    },
    
    /**
     * Verifica se o empréstimo pode ser renovado, de acordo com as regras do sistema.
     * RECEBE user e book
     * RETORNA { allowed: boolean, reason: string }
     */
    checkRenewRules: async (user, book) => {
        const rules = await RulesService.getRules();
        
        // 1. Busca empréstimo ativo do usuário para o livro
        const loan = await LoansModel.getActiveLoanByUserAndBook(user.id, book.id);
        if (!loan || loan.returned_at) {
            return { allowed: false, reason: 'Empréstimo não encontrado ou já devolvido.' };
        }
        // 2. Busca todos os empréstimos do usuário
        const allLoans = await LoansModel.getLoansByUser(user.id);
        const now = new Date();
        const hasOverdue = allLoans.some(l => !l.returned_at && l.due_date && new Date(l.due_date) < now);
        if (hasOverdue) {
            return { allowed: false, reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de renovar qualquer empréstimo.' };
        }
        // 3. Verifica se usuário atingiu limite de renovações
        if ((loan.renewals ?? 0) >= rules.max_renewals) {
            return { allowed: false, reason: 'Limite de renovações atingido.' };
        }
        // Outras regras podem ser adicionadas aqui...
        return { allowed: true, reason: '' };
    },

    /**
     * Verifica se o empréstimo pode ser estendido, de acordo com as regras do sistema.
     * RECEBE user, book e loan.
     * RETORNA { allowed: boolean, reason: string }
     */
    checkExtendRules: async (user, book) => {
        const rules = await RulesService.getRules();
        // 1. Busca o empréstimo ativo do usuário para o livro
        const loan = await LoansModel.getActiveLoanByUserAndBook(user.id, book.id);
        if (!loan || loan.returned_at) {
            return { allowed: false, reason: 'Empréstimo não encontrado ou já devolvido.' };
        }
        // 2. Verifica se o empréstimo já foi estendido
        if (loan.is_extended === 1) {
            return { allowed: false, reason: 'Empréstimo já está estendido.' };
        }
        // 3. Verifica se atingiu o limite de renovações
        if ((loan.renewals ?? 0) < rules.max_renewals) {
            return { allowed: false, reason: 'Extensão só disponível após atingir o limite de renovações.' };
        }
        // 4. Verifica se a data de devolução está definida e não está atrasado
        if (!loan.due_date) {
            return { allowed: false, reason: 'Data de devolução não definida.' };
        }
        const now = new Date();
        const dueDate = new Date(loan.due_date);
        if (dueDate < now) {
            return { allowed: false, reason: 'Empréstimo atrasado, não pode estender.' };
        }
        // 5. Verifica se o usuário tem empréstimos atrasados
        const allLoans = await LoansModel.getLoansByUser(user.id);
        const hasOverdue = allLoans.some(l => !l.returned_at && l.due_date && new Date(l.due_date) < now);
        if (hasOverdue) {
            return { allowed: false, reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de estender qualquer empréstimo.' };
        }
        // Outras regras podem ser adicionadas aqui...
        return { allowed: true, reason: '' };
    },
};

module.exports = RulesService;