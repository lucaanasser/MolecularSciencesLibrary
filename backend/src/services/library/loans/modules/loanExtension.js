const LoansModel = require('../../../../models/library/LoansModel');
const UsersModel = require('../../../../models/library/UsersModel');
const BooksModel = require('../../../../models/library/BooksModel');
const RulesService = require('../../../utilities/RulesService');
const EmailService = require('../../../utilities/EmailService');

module.exports = {
    /**
     * Compatibilidade com fluxo legado de extensao pendente.
     */
    async processPendingExtension() {
        console.log('🟡 [LoansService] processPendingExtension chamado, mas não há extensões pendentes persistidas neste fluxo.');
        return 0;
    },

    /**
     * Alias plural para manter compatibilidade com scripts antigos.
     */
    async processPendingExtensions() {
        return this.processPendingExtension();
    },

    /**
     * Alias usado por fluxos antigos de nudge em extensao.
     */
    async applyNudgeImpactIfNeeded(loan_id) {
        return this.applyNudgeInExtension(loan_id);
    },

    /**
     * Preview da extensao.
     */
    async previewExtendLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Preview de extensão: loan_id=${loan_id}, user_id=${user_id}`);

        const loan = await LoansModel.getLoanById(loan_id);
        if (!loan) {
            console.warn(`🟡 [LoansService] Empréstimo não encontrado ou já devolvido: loan_id=${loan_id}`);
            throw new Error('Empréstimo não encontrado ou já devolvido.');
        }

        const user = await UsersModel.getUserById(user_id);
        if (!user) {
            console.warn(`🟡 [LoansService] Usuário não encontrado: user_id=${user_id}`);
            throw new Error('Usuário não encontrado.');
        }

        const book = await BooksModel.getBookById(loan.book_id);
        if (!book) {
            console.warn(`🟡 [LoansService] Livro não encontrado: book_id=${loan.book_id}`);
            throw new Error('Livro não encontrado.');
        }

        const check = await this._checkExtensionRules(user, book, loan_id, user_id);
        if (!check.allowed) {
            console.warn(`🟡 [LoansService] Extensão não permitida: ${check.reason}`);
            throw new Error(check.reason || 'Extensão não permitida.');
        }

        const rules = await RulesService.getRules();
        const now = new Date();
        const addedDays = (rules.renewal_days || 7) * (rules.extension_block_multiplier || 3);
        const newDueDate = new Date(now);
        newDueDate.setDate(now.getDate() + addedDays);

        console.log(`🟢 [LoansService] Preview de extensão bem-sucedido: loan_id=${loan_id}, nova due_date=${newDueDate.toISOString()}, dias adicionados=${addedDays}`);
        return {
            new_due_date: newDueDate.toISOString(),
            message: `Nova data de devolução após extensão (calculada a partir de hoje, extensão adiciona ${addedDays} dias).`
        };
    },

    /**
     * Estende um emprestimo.
     */
    async extendLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Estendendo empréstimo: loan_id=${loan_id}${user_id ? ', user_id=' + user_id : ''}`);

        const preview = await this.previewExtendLoan(loan_id, user_id);
        await LoansModel.extendLoan(loan_id, preview.new_due_date);

        const updated = await LoansModel.getLoanById(loan_id);
        const book = await BooksModel.getBookById(updated.book_id);
        try {
            await EmailService.sendExtensionConfirmationEmail({
                user_id,
                book_title: book.title,
                due_date: updated.due_date
            });
        } catch (emailErr) {
            console.error('🟡 [LoansService] Erro ao enviar email de extensão (extensão realizada com sucesso):', emailErr.message);
        }

        console.log('🟢 [LoansService] Empréstimo estendido com sucesso:', updated);
        return { message: 'Empréstimo estendido com sucesso.', due_date: updated?.due_date };
    },

    /**
     * Aplica nudge em emprestimo estendido.
     */
    async applyNudgeInExtension(loan_id) {
        console.log(`🔵 [LoansService] Iniciando nudge de extensão: loan_id=${loan_id}`);

        const rules = await RulesService.getRules();
        const loan = await LoansModel.getLoanById(loan_id);

        if (loan.is_extended !== 1) {
            console.log(`🟡 [LoansService] Nudge não aplicável: empréstimo não está estendido (loan_id=${loan_id})`);
            return { changed: false };
        }

        const shortenedTarget = rules.shortened_due_days_after_nudge || 5;
        const changed = await LoansModel.shortenDueDateIfLongerThan(loan_id, shortenedTarget);
        if (!changed) {
            console.log(`🟡 [LoansService] Nudge não necessário: prazo já está igual ou menor que ${shortenedTarget} dias (loan_id=${loan_id})`);
            return { changed: false };
        }

        const updatedLoan = await LoansModel.getLoanById(loan_id);
        try {
            await EmailService.sendExtensionNudgeEmail({
                user_id: updatedLoan.user_id,
                book_title: updatedLoan.book_title,
                new_due_date: updatedLoan.due_date
            });
            console.log(`🟢 [LoansService] Email de nudge enviado para user_id=${updatedLoan.user_id}, loan_id=${loan_id}`);
        } catch (emailErr) {
            console.error('🟡 [LoansService] Erro ao enviar email de nudge (operação realizada com sucesso):', emailErr.message);
        }

        console.log(`🟢 [LoansService] Nudge de extensão aplicado com sucesso: loan_id=${loan_id}, nova due_date=${updatedLoan.due_date}`);
        return { changed: true, new_due_date: updatedLoan.due_date };
    },

    /**
     * Verifica se o emprestimo pode ser estendido.
     */
    async _checkExtensionRules(user, book, loan_id, user_id) {
        const rules = await RulesService.getRules();

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

        if (loan.is_extended === 1) {
            return { allowed: false, reason: 'Empréstimo já está estendido.' };
        }
        if ((loan.renewals ?? 0) < rules.max_renewals) {
            return { allowed: false, reason: 'Extensão só disponível após atingir o limite de renovações.' };
        }
        if (!loan.due_date) {
            return { allowed: false, reason: 'Data de devolução não definida.' };
        }

        const now = new Date();
        const dueDate = new Date(loan.due_date);
        if (dueDate < now) {
            return { allowed: false, reason: 'Empréstimo atrasado, não pode estender.' };
        }

        const allLoans = await LoansModel.getLoansByUser(user.id);
        const hasOverdue = allLoans.some(l => l.book.status);
        if (hasOverdue) {
            return { allowed: false, reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de estender qualquer empréstimo.' };
        }

        return { allowed: true, reason: '' };
    }
};
