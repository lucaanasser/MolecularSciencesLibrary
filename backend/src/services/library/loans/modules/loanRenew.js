const LoansModel = require('../../../../models/library/LoansModel');
const RulesService = require('../../../utilities/RulesService');
const EmailService = require('../../../utilities/EmailService');

module.exports = {
    /**
     * Gera uma previa da renovacao de um emprestimo.
     */
    async previewRenewLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Preview de renovação: loan_id=${loan_id}, user_id=${user_id}`);

        const loan = await LoansModel.getLoanById(loan_id);
        if (!loan) {
            console.warn(`🟡 [LoansService] Empréstimo não encontrado: loan_id=${loan_id}`);
            throw new Error('Empréstimo não encontrado.');
        }
        if (loan.returned_at) {
            console.warn(`🟡 [LoansService] Empréstimo já devolvido: loan_id=${loan_id}`);
            throw new Error('Empréstimo já foi devolvido.');
        }
        if (Number(loan.user_id) !== Number(user_id)) {
            console.warn(`🟡 [LoansService] Este empréstimo não pertence ao usuário: user_id=${user_id}, loan_id=${loan_id}`);
            throw new Error('Este empréstimo não pertence ao usuário informado.');
        }

        const check = await this._checkRenewRules(user_id, loan);
        if (!check.allowed) {
            console.warn(`🟡 [LoansService] Renovação não permitida: ${check.reason}`);
            throw new Error(check.reason || 'Renovação não permitida.');
        }

        console.log(`🟢 [LoansService] Preview de renovação bem-sucedido: loan_id=${loan_id}, nova due_date=${check.new_due_date}`);
        return {
            new_due_date: check.new_due_date,
            renewals_left: check.renewals_left,
            message: 'Nova data de devolução após renovação (calculada a partir de hoje).'
        };
    },

    /**
     * Realiza a renovacao de um emprestimo.
     */
    async renewLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Renovando empréstimo: loan_id=${loan_id}${user_id ? ', user_id=' + user_id : ''}`);

        let preview;
        try {
            console.log(`🔵 [LoansService] Validando renovação para loan_id=${loan_id}, user_id=${user_id}`);
            preview = await this.previewRenewLoan(loan_id, user_id);
        } catch (err) {
            console.error(`🔴 [LoansService] Renovação não permitida: ${err.message}`);
            throw err;
        }

        try {
            console.log(`🔵 [LoansService] Atualizando empréstimo com nova due_date: loan_id=${loan_id}, new_due_date=${preview.new_due_date}`);
            await LoansModel.renewLoan(loan_id, preview.new_due_date);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao atualizar empréstimo: ${err.message}`);
            throw err;
        }

        let loan;
        try {
            console.log(`🔵 [LoansService] Buscando dados do empréstimo atualizado: loan_id=${loan_id}`);
            loan = await LoansModel.getLoanById(loan_id);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar dados do empréstimo atualizado: ${err.message}`);
            throw err;
        }

        try {
            await EmailService.sendRenewalConfirmationEmail({
                user: loan.user,
                book_title: loan.book.title,
                due_date: preview.new_due_date
            });
        } catch (emailErr) {
            console.error('🟡 [LoansService] Erro ao enviar email de renovação (renovação realizada com sucesso):', emailErr.message);
        }

        console.log(`🟢 [LoansService] Empréstimo renovado com sucesso: loan_id=${loan_id}`);
        return loan;
    },

    /**
     * Verifica se o emprestimo pode ser renovado.
     */
    async _checkRenewRules(user_id, loan) {
        const rules = await RulesService.getRules();

        let userLoans;
        try {
            console.log(`🔵 [LoansService] Verificando empréstimos atrasados para usuário ${user_id}`);
            userLoans = await this.getUserLoans(user_id, 'active');
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar empréstimos do usuário para verificação de atrasos: ${err.message}`);
            throw err;
        }

        const hasOverdue = userLoans.some(l => l.is_overdue);
        if (hasOverdue) {
            return {
                allowed: false,
                reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de renovar qualquer empréstimo.'
            };
        }

        const maxRenewals = rules.max_renewals;
        const renewalsDone = loan.renewals;
        const renewalsLeft = maxRenewals - renewalsDone;
        if (renewalsDone >= maxRenewals) {
            return { allowed: false, reason: 'Limite de renovações atingido.', renewals_left: 0 };
        }

        const renewalDays = rules.renewal_days || 7;
        const nowDate = new Date();
        const newDueDate = new Date(nowDate);
        newDueDate.setDate(nowDate.getDate() + renewalDays);

        return {
            allowed: true,
            reason: '',
            renewals_left: renewalsLeft,
            new_due_date: newDueDate.toISOString()
        };
    }
};
