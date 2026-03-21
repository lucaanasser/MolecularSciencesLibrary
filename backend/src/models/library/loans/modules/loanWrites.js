/**
 * Responsabilidade: escritas de persistencia do dominio de emprestimos.
 * Camada: model.
 * Entradas/Saidas: executa INSERT/UPDATE de loans e retorna resultados de operacao.
 * Dependencias criticas: db (executeQuery) e logger compartilhado.
 */

const { executeQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria emprestimo e atualiza status do livro para emprestado.
     * Onde e usada: LoansService._borrowBookCore.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: persiste loan e atualiza tabela books.
     */
    async createLoan(book_id, user_id, due_date) {
        log.start('Criando emprestimo', { book_id, user_id });

        const dueDateSql = String(due_date).replace('T', ' ').replace(/\..*$/, '');

        try {
            await executeQuery(
                'INSERT INTO loans (book_id, user_id, borrowed_at, due_date, renewals) VALUES (?, ?, CURRENT_TIMESTAMP, ?, 0)',
                [book_id, user_id, dueDateSql]
            );

            await executeQuery("UPDATE books SET status = 'emprestado' WHERE id = ?", [book_id]);
            log.success('Emprestimo criado e status do livro atualizado', { book_id, user_id });
        } catch (err) {
            log.error('Erro ao criar emprestimo', { err: err.message, book_id, user_id });
            throw err;
        }
    },

    /**
     * O que faz: registra devolucao do emprestimo e reabre disponibilidade do livro.
     * Onde e usada: LoansService.returnBook.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza tabelas loans e books.
     */
    async returnBook(loan_id, book_id) {
        log.start('Registrando devolucao de emprestimo', { loan_id, book_id });

        try {
            await executeQuery(
                'UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL',
                [loan_id]
            );
            await executeQuery("UPDATE books SET status = 'disponível' WHERE id = ?", [book_id]);
            log.success('Devolucao registrada com sucesso', { loan_id, book_id });
        } catch (err) {
            log.error('Erro ao registrar devolucao', { err: err.message, loan_id, book_id });
            throw err;
        }
    },

    /**
     * O que faz: registra uso interno (emprestimo fantasma devolvido no ato).
     * Onde e usada: LoansService.registerInternalUse.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: persiste registro em loans para metricas.
     */
    async registerInternalUse(book_id) {
        log.start('Registrando uso interno', { book_id });

        try {
            await executeQuery(
                `INSERT INTO loans (book_id, user_id, borrowed_at, due_date, renewals, returned_at)
                 VALUES (?, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP)`,
                [book_id]
            );
            log.success('Uso interno registrado com sucesso', { book_id });
        } catch (err) {
            log.error('Erro ao registrar uso interno', { err: err.message, book_id });
            throw err;
        }
    },

    /**
     * O que faz: incrementa renovacao e atualiza due_date de emprestimo ativo.
     * Onde e usada: LoansService.renewLoan.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza tabela loans.
     */
    async renewLoan(loan_id, new_due_date) {
        log.start('Renovando emprestimo', { loan_id, new_due_date });

        try {
            await executeQuery(
                'UPDATE loans SET renewals = renewals + 1, due_date = ? WHERE id = ? AND returned_at IS NULL',
                [new_due_date, loan_id]
            );
            log.success('Emprestimo renovado com sucesso', { loan_id });
        } catch (err) {
            log.error('Erro ao renovar emprestimo', { err: err.message, loan_id });
            throw err;
        }
    },

    /**
     * O que faz: aplica extensao legado em emprestimo ativo.
     * Onde e usada: LoansService.extendLoan.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza due_date e marca is_extended.
     */
    async extendLoan(loan_id, new_due_date) {
        log.start('Aplicando extensao legado', { loan_id, new_due_date });

        try {
            await executeQuery(
                'UPDATE loans SET due_date = ?, is_extended = 1 WHERE id = ? AND returned_at IS NULL',
                [new_due_date, loan_id]
            );
            log.success('Extensao legado aplicada com sucesso', { loan_id });
        } catch (err) {
            log.error('Erro ao aplicar extensao legado', { err: err.message, loan_id });
            throw err;
        }
    },

    /**
     * O que faz: atualiza timestamp do ultimo nudge enviado.
     * Onde e usada: NotificationsService/nudge.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza coluna last_nudged_at.
     */
    async setLastNudged(loan_id) {
        try {
            await executeQuery('UPDATE loans SET last_nudged_at = CURRENT_TIMESTAMP WHERE id = ?', [loan_id]);
        } catch (err) {
            log.error('Erro ao atualizar last_nudged_at', { err: err.message, loan_id });
            throw err;
        }
    },

    /**
     * O que faz: reduz due_date de emprestimo estendido quando excede alvo de dias.
     * Onde e usada: LoansService.applyNudgeInExtension e NotificationsService.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: atualiza due_date se condicoes forem satisfeitas.
     */
    async shortenDueDateIfLongerThan(loan_id, targetDaysFromNow) {
        try {
            const result = await executeQuery(
                `UPDATE loans
                 SET due_date = datetime('now', '+'|| ? ||' days')
                 WHERE id = ?
                   AND returned_at IS NULL
                   AND is_extended = 1
                   AND (due_date IS NULL OR due_date > datetime('now', '+'|| ? ||' days'))`,
                [targetDaysFromNow, loan_id, targetDaysFromNow]
            );
            return result.changes > 0;
        } catch (err) {
            log.error('Erro ao encurtar due_date em nudge', { err: err.message, loan_id, targetDaysFromNow });
            throw err;
        }
    }
};
