/**
 * Responsabilidade: regras de notificacao de nudge para devolucao de livro.
 * Camada: service.
 * Entradas/Saidas: recebe contexto de borrower/requester e cria notificacao de nudge.
 * Dependencias criticas: LoansModel, coreNotification (via this) e logger compartilhado.
 */

const LoansModel = require('../../../../models/library/LoansModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Cria notificacao de cutucada quando alguem quer um livro emprestado.
     */
    async createNudgeNotification({ borrower_id, requester_id, book_id, book_title, loan_id }) {
        const message = `Alguem esta interessado no livro "${book_title || book_id}" que voce pegou emprestado. Que tal devolver logo para ajudar um colega? 😄`;
        const metadata = { requester_id, book_id, nudge_type: 'book_request' };

        const id = await this.createNotification({
            user_id: borrower_id,
            type: 'nudge',
            message,
            metadata,
            loan_id
        });

        if (loan_id) {
            try {
                const loan = await LoansModel.getLoanById(loan_id).catch(() => null);
                if (loan && loan.returned_at == null && loan.is_extended === 1) {
                    const changed = await LoansModel.shortenDueDateIfLongerThan(loan_id, 5);
                    if (changed) {
                        log.success('Prazo reduzido apos nudge em emprestimo estendido', { loan_id, target_days: 5 });
                    }
                }
            } catch (e) {
                log.warn('Falha ao aplicar reducao de prazo apos nudge', { loan_id, err: e.message });
            }

            await LoansModel.setLastNudged(loan_id).catch(() => {});
        }

        return id;
    }
};
