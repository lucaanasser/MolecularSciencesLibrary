const LoansModel = require('../../../../models/library/LoansModel');

module.exports = {
    /**
     * Busca emprestimos com filtro de status.
     * @param {'all'|'active'|'returned'} status
     */
    async getLoans(status = 'all') {
        console.log(`🔵 [LoansService] Buscando empréstimos (status=${status})`);
        try {
            const loans = await LoansModel.getAllLoans(status);
            console.log(`🟢 [LoansService] Empréstimos buscados com sucesso: ${loans.length} encontrados`);
            return loans;
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar empréstimos: ${err.message}`);
            throw err;
        }
    },

    /**
     * Busca emprestimos de um usuario com filtro de status.
     * @param {number} userId
     * @param {'all'|'active'|'returned'} status
     */
    async getUserLoans(userId, status = 'all') {
        console.log(`🔵 [LoansService] Buscando empréstimos do usuário ${userId} (status=${status})`);
        try {
            const loans = await LoansModel.getLoansByUser(userId, status);
            console.log(`🟢 [LoansService] Empréstimos encontrados para o usuário ${userId}: ${loans.length}`);
            return loans;
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar empréstimos do usuário ${userId}: ${err.message}`);
            throw err;
        }
    },

    /**
     * Verifica se um emprestimo esta atrasado.
     * @param {Object} loan
     * @returns {boolean}
     */
    isLoanOverdue(loan) {
        if (!loan || loan.returned_at) return false;
        if (!loan.due_date) {
            console.warn(`🟡 [LoansService] Empréstimo sem due_date definido: loan_id=${loan.id}`);
            throw new Error('Empréstimo sem data de devolução definida.');
        }
        const due = new Date(loan.due_date.replace(' ', 'T'));
        return due < new Date();
    },

    /**
     * Conta emprestimos com filtro de status.
     * @param {'all'|'active'|'returned'} status
     */
    async countLoans(status = 'all') {
        console.log(`🔵 [LoansService] Contando total de empréstimos com status "${status}"`);
        try {
            const result = await LoansModel.countLoans(status);
            console.log(`🟢 [LoansService] Contagem de empréstimos concluída: ${result}`);
            return result;
        } catch (error) {
            console.error(`🔴 [LoansService] Erro ao contar empréstimos: ${error.message}`);
            throw error;
        }
    },

    async getLoansByBookId(book_id, activeOnly = false) {
        return await LoansModel.getLoansByBookId(book_id, activeOnly);
    },

    /**
     * Lista emprestimos ativos com a flag de atraso calculada.
     * Mantido por compatibilidade com scripts legados.
     */
    async listActiveLoansWithOverdue() {
        console.log('🔵 [LoansService] Listando empréstimos ativos com cálculo de atraso');
        const loans = await this.getLoans('active');
        return loans.map((loan) => ({
            ...loan,
            is_overdue: this.isLoanOverdue(loan)
        }));
    },

    /**
     * Alias legado para listagem de emprestimos ativos.
     */
    async listActiveLoans() {
        return this.listActiveLoansWithOverdue();
    }
};
