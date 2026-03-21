/**
 * Responsabilidade: fluxo de preview e confirmacao de renovacao de emprestimos.
 * Camada: service.
 * Entradas/Saidas: recebe loan_id/user_id e atualiza due_date quando permitido.
 * Dependencias criticas: LoansModel, RulesService e EmailService.
 */

const LoansModel = require('../../../../models/library/LoansModel');
const RulesService = require('../../../utilities/RulesService');
const EmailService = require('../../../utilities/EmailService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: valida e simula renovacao retornando nova due_date prevista.
     * Onde e usada: renewHandlers.previewRenewLoan e renewLoan.
     * Dependencias chamadas: LoansModel.getLoanById e _checkRenewRules.
     * Efeitos colaterais: nenhum; somente validacao/simulacao.
     */
    async previewRenewLoan(loan_id, user_id) {
        log.start('Preview de renovacao solicitado', { loan_id, user_id });

        const loan = await LoansModel.getLoanById(loan_id);
        if (!loan) {
            log.warn('Emprestimo nao encontrado para preview de renovacao', { loan_id, user_id });
            throw new Error('Empréstimo não encontrado.');
        }
        if (loan.returned_at) {
            log.warn('Emprestimo ja devolvido; renovacao bloqueada', { loan_id, user_id });
            throw new Error('Empréstimo já foi devolvido.');
        }
        if (Number(loan.user_id) !== Number(user_id)) {
            log.warn('Emprestimo nao pertence ao usuario informado', { loan_id, user_id, owner_user_id: loan.user_id });
            throw new Error('Este empréstimo não pertence ao usuário informado.');
        }

        const check = await this._checkRenewRules(user_id, loan);
        if (!check.allowed) {
            log.warn('Renovacao nao permitida pelas regras', { loan_id, user_id, reason: check.reason });
            throw new Error(check.reason || 'Renovação não permitida.');
        }

        log.success('Preview de renovacao calculado com sucesso', { loan_id, user_id, new_due_date: check.new_due_date });
        return {
            new_due_date: check.new_due_date,
            renewals_left: check.renewals_left,
            message: 'Nova data de devolução após renovação (calculada a partir de hoje).'
        };
    },

    /**
     * O que faz: valida e confirma renovacao persistindo nova due_date.
     * Onde e usada: renewHandlers.renewLoan.
     * Dependencias chamadas: previewRenewLoan, LoansModel.renewLoan, LoansModel.getLoanById e EmailService.sendRenewalConfirmationEmail.
     * Efeitos colaterais: atualiza emprestimo e dispara email de confirmacao.
     */
    async renewLoan(loan_id, user_id) {
        log.start('Iniciando renovacao de emprestimo', { loan_id, user_id });

        let preview;
        try {
            preview = await this.previewRenewLoan(loan_id, user_id);
        } catch (err) {
            log.error('Renovacao bloqueada na validacao', { err: err.message, loan_id, user_id });
            throw err;
        }

        try {
            await LoansModel.renewLoan(loan_id, preview.new_due_date);
        } catch (err) {
            log.error('Erro ao atualizar emprestimo renovado', { err: err.message, loan_id, user_id, new_due_date: preview.new_due_date });
            throw err;
        }

        let loan;
        try {
            loan = await LoansModel.getLoanById(loan_id);
        } catch (err) {
            log.error('Erro ao buscar emprestimo apos renovacao', { err: err.message, loan_id, user_id });
            throw err;
        }

        try {
            await EmailService.sendRenewalConfirmationEmail({
                user: loan.user,
                book_title: loan.book.title,
                due_date: preview.new_due_date
            });
        } catch (emailErr) {
            log.warn('Falha no envio de email de renovacao (operacao principal concluida)', {
                err: emailErr.message,
                loan_id,
                user_id
            });
        }

        log.success('Emprestimo renovado com sucesso', { loan_id, user_id });
        return loan;
    },

    /**
     * O que faz: aplica regras de negocio para permitir/bloquear renovacao.
     * Onde e usada: previewRenewLoan.
     * Dependencias chamadas: RulesService.getRules e getUserLoans.
     * Efeitos colaterais: nenhum; apenas validacao.
     */
    async _checkRenewRules(user_id, loan) {
        const rules = await RulesService.getRules();

        let userLoans;
        try {
            userLoans = await this.getUserLoans(user_id, 'active');
        } catch (err) {
            log.error('Erro ao buscar emprestimos do usuario para validar renovacao', { err: err.message, user_id, loan_id: loan?.id });
            throw err;
        }

        const hasOverdue = userLoans.some((userLoan) => this._isOverdueLoan(userLoan, false));
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
