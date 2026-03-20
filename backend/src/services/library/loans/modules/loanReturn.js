const LoansModel = require('../../../../models/library/LoansModel');
const EmailService = require('../../../utilities/EmailService');

module.exports = {
    /**
     * Registra a devolucao de um livro.
     */
    async returnBook(book_id) {
        const loans = await LoansModel.getLoansByBookId(book_id, true);
        if (!loans || loans.length === 0) {
            console.warn(`🟡 [LoansService] Nenhum empréstimo ativo encontrado para o livro ${book_id}`);
            throw new Error('Nenhum empréstimo ativo encontrado para este livro.');
        }

        const loan = loans[0];
        try {
            await LoansModel.returnBook(loan.id, book_id);
            console.log(`🟢 [LoansService] Devolução registrada com sucesso para loan_id=${loan.id}`);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao registrar devolução: ${err.message}`);
            throw err;
        }

        try {
            console.log(`🔵 [LoansService] Enviando email de confirmação de devolução para usuário ${loan.user.name}`);
            await EmailService.sendReturnConfirmationEmail({ user: loan.user, book_title: loan.book.title });
        } catch (emailErr) {
            console.warn('🟡 [LoansService] Erro ao enviar email de devolução (devolução registrada com sucesso):', emailErr.message);
        }

        console.log('🟢 [LoansService] Devolução registrada para empréstimo:', loan.id);
    }
};
