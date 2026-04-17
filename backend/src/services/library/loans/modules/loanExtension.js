/**
 * Responsabilidade: fluxo legado de extensao e nudge de emprestimos.
 * Camada: service.
 * Entradas/Saidas: recebe loan_id/user_id e aplica regras de extensao.
 * Dependencias criticas: LoansModel, UsersModel, BooksModel, RulesService e EmailService.
 */

const LoansModel = require('../../../../models/library/LoansModel');
const UsersModel = require('../../../../models/library/UsersModel');
const BooksModel = require('../../../../models/library/BooksModel');
const RulesService = require('../../../utilities/RulesService');
const EmailService = require('../../../utilities/EmailService');
const { getLogger } = require('../../../../shared/logging/logger');
const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: mantem compatibilidade com fluxo legado de extensao pendente.
     * Onde e usada: scripts/rotinas legadas de extensao.
     * Dependencias chamadas: nenhuma externa.
     * Efeitos colaterais: nenhum; retorna contador zerado neste fluxo.
     */
    async processPendingExtension() {
        log.warn('processPendingExtension chamado, mas sem extensoes pendentes neste fluxo');
        return 0;
    },

    /**
     * O que faz: alias plural para manter compatibilidade com scripts antigos.
     * Onde e usada: integracoes legadas que usam nome plural.
     * Dependencias chamadas: processPendingExtension.
     * Efeitos colaterais: nenhum.
     */
    async processPendingExtensions() {
        return this.processPendingExtension();
    },

    /**
     * O que faz: alias legado para aplicacao de nudge em extensao.
     * Onde e usada: rotinas antigas de cobranca/notificacao.
     * Dependencias chamadas: applyNudgeInExtension.
     * Efeitos colaterais: pode reduzir due_date quando aplicavel.
     */
    async applyNudgeImpactIfNeeded(loan_id) {
        return this.applyNudgeInExtension(loan_id);
    },

    /**
     * O que faz: valida regras e simula extensao retornando nova due_date.
     * Onde e usada: renewHandlers.previewExtendLoan.
     * Dependencias chamadas: LoansModel, UsersModel, BooksModel, _checkExtensionRules e RulesService.
     * Efeitos colaterais: nenhum; apenas simulacao.
     */
    async previewExtendLoan(loan_id, user_id) {
        log.start('Preview de extensao solicitado', { loan_id, user_id });

        const loan = await LoansModel.getLoanById(loan_id);
        if (!loan) {
            log.warn('Emprestimo nao encontrado para preview de extensao', { loan_id, user_id });
            throw new Error('Empréstimo não encontrado ou já devolvido.');
        }

        const user = await UsersModel.getUserById(user_id);
        if (!user) {
            log.warn('Usuario nao encontrado para preview de extensao', { loan_id, user_id });
            throw new Error('Usuário não encontrado.');
        }

        const book = await BooksModel.getBookById(loan.book_id);
        if (!book) {
            log.warn('Livro nao encontrado para preview de extensao', { loan_id, user_id, book_id: loan.book_id });
            throw new Error('Livro não encontrado.');
        }

        const check = await this._checkExtensionRules(user, book, loan_id, user_id);
        if (!check.allowed) {
            log.warn('Extensao nao permitida pelas regras', { loan_id, user_id, reason: check.reason });
            throw new Error(check.reason || 'Extensão não permitida.');
        }

        const rules = await RulesService.getRules();
        const now = new Date();
        const addedDays = (rules.renewal_days || 7) * (rules.extension_block_multiplier || 3);
        const newDueDate = new Date(now);
        newDueDate.setDate(now.getDate() + addedDays);

        log.success('Preview de extensao calculado com sucesso', { loan_id, user_id, new_due_date: newDueDate.toISOString(), added_days: addedDays });
        return {
            new_due_date: newDueDate.toISOString(),
            message: `Nova data de devolução após extensão (calculada a partir de hoje, extensão adiciona ${addedDays} dias).`
        };
    },

    /**
     * O que faz: confirma extensao do emprestimo no fluxo legado.
     * Onde e usada: renewHandlers.extendLoan.
     * Dependencias chamadas: previewExtendLoan, LoansModel.extendLoan, LoansModel.getLoanById, BooksModel.getBookById e EmailService.
     * Efeitos colaterais: atualiza emprestimo e envia email de confirmacao.
     */
    async extendLoan(loan_id, user_id) {
        log.start('Iniciando extensao de emprestimo legado', { loan_id, user_id });

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
            log.warn('Falha no envio de email de extensao (operacao principal concluida)', {
                err: emailErr.message,
                loan_id,
                user_id
            });
        }

        log.success('Emprestimo estendido com sucesso', { loan_id, user_id, due_date: updated?.due_date });
        return { message: 'Empréstimo estendido com sucesso.', due_date: updated?.due_date };
    },

    /**
     * O que faz: aplica nudge para encurtar prazo de emprestimo estendido.
     * Onde e usada: scripts de notificacao/cobranca.
     * Dependencias chamadas: RulesService, LoansModel e EmailService.
     * Efeitos colaterais: atualiza due_date e pode enviar email de nudge.
     */
    async applyNudgeInExtension(loan_id) {
        log.start('Iniciando nudge de extensao', { loan_id });

        const rules = await RulesService.getRules();
        const loan = await LoansModel.getLoanById(loan_id);

        if (loan.is_extended !== 1) {
            log.warn('Nudge nao aplicavel: emprestimo nao estendido', { loan_id });
            return { changed: false };
        }

        const shortenedTarget = rules.shortened_due_days_after_nudge || 5;
        const changed = await LoansModel.shortenDueDateIfLongerThan(loan_id, shortenedTarget);
        if (!changed) {
            log.warn('Nudge nao necessario: due_date ja dentro do limite', { loan_id, shortened_target_days: shortenedTarget });
            return { changed: false };
        }

        const updatedLoan = await LoansModel.getLoanById(loan_id);
        try {
            await EmailService.sendExtensionNudgeEmail({
                user_id: updatedLoan.user_id,
                book_title: updatedLoan.book_title,
                new_due_date: updatedLoan.due_date
            });
            log.success('Email de nudge de extensao enviado', { loan_id, user_id: updatedLoan.user_id });
        } catch (emailErr) {
            log.warn('Falha no envio de email de nudge (operacao principal concluida)', {
                err: emailErr.message,
                loan_id,
                user_id: updatedLoan.user_id
            });
        }

        log.success('Nudge de extensao aplicado com sucesso', { loan_id, new_due_date: updatedLoan.due_date });
        return { changed: true, new_due_date: updatedLoan.due_date };
    },

    /**
     * O que faz: aplica regras de negocio para permitir/bloquear extensao.
     * Onde e usada: previewExtendLoan.
     * Dependencias chamadas: RulesService.getRules, LoansModel.getLoanById e LoansModel.getLoansByUser.
     * Efeitos colaterais: nenhum; apenas validacao.
     */
    async _checkExtensionRules(user, _book, loan_id, user_id) {
        const rules = await RulesService.getRules();

        const loan = await LoansModel.getLoanById(loan_id);
        if (!loan) {
            log.warn('Emprestimo nao encontrado na validacao de extensao', { loan_id, user_id });
            throw new Error('Empréstimo não encontrado.');
        }
        if (loan.returned_at) {
            log.warn('Emprestimo devolvido; extensao bloqueada', { loan_id, user_id });
            throw new Error('Empréstimo já foi devolvido.');
        }
        if (Number(loan.user_id) !== Number(user_id)) {
            log.warn('Emprestimo nao pertence ao usuario informado', { loan_id, user_id, owner_user_id: loan.user_id });
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
        const hasOverdue = allLoans.some((userLoan) => this._isOverdueLoan(userLoan, false));
        if (hasOverdue) {
            return { allowed: false, reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de estender qualquer empréstimo.' };
        }

        return { allowed: true, reason: '' };
    }
};
