/**
 * Responsabilidade: fluxo de devolucao de emprestimos.
 * Camada: service.
 * Entradas/Saidas: recebe book_id e conclui devolucao do emprestimo ativo.
 * Dependencias criticas: LoansModel e EmailService.
 */

const LoansModel = require('../../../../models/library/LoansModel');
const EmailService = require('../../../utilities/EmailService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: identifica emprestimo ativo do livro e registra devolucao.
     * Onde e usada: borrowHandlers.returnBook.
     * Dependencias chamadas: LoansModel.getLoansByBookId, LoansModel.returnBook e EmailService.sendReturnConfirmationEmail.
     * Efeitos colaterais: atualiza emprestimo/livro e dispara email de confirmacao.
     */
    async returnBook(book_id) {
        log.start('Iniciando fluxo de devolucao', { book_id });
        const loans = await LoansModel.getLoansByBookId(book_id, true);
        if (!loans || loans.length === 0) {
            log.warn('Nenhum emprestimo ativo encontrado para devolucao', { book_id });
            throw new Error('Nenhum empréstimo ativo encontrado para este livro.');
        }

        const loan = loans[0];
        try {
            await LoansModel.returnBook(loan.id, book_id);
            log.success('Devolucao registrada com sucesso', { loan_id: loan.id, book_id });
        } catch (err) {
            log.error('Erro ao registrar devolucao no model', { err: err.message, loan_id: loan.id, book_id });
            throw err;
        }

        try {
            log.start('Enviando email de confirmacao de devolucao', { loan_id: loan.id, user_id: loan.user?.id });
            await EmailService.sendReturnConfirmationEmail({ user: loan.user, book_title: loan.book.title });
        } catch (emailErr) {
            log.warn('Falha no envio de email de devolucao (operacao principal concluida)', {
                err: emailErr.message,
                loan_id: loan.id,
                book_id
            });
        }
    }
};
