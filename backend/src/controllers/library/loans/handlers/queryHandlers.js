/**
 * Responsabilidade: handlers HTTP de consulta/listagem de emprestimos.
 * Camada: controller.
 * Entradas/Saidas: query params e path params para filtros de emprestimos.
 * Dependencias criticas: LoansService para consultas e calculo de atraso.
 */

const LoansService = require('../../../../services/library/loans/LoansService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista emprestimos por status e calcula flag de atraso.
     * Onde e usada: GET /api/loans em LoansRoutes.
     * Dependencias chamadas: LoansService.getLoans, LoansService.isLoanOverdue.
     * Efeitos colaterais: nenhum; apenas leitura de dados.
     */
    async getLoans(req, res) {
        const status = req.query.status || 'all';
        log.start('Buscando emprestimos', { status });

        try {
            const result = await LoansService.getLoans(status);
            const loans = result.map((loan) => ({
                ...loan,
                is_overdue: LoansService.isLoanOverdue(loan)
            }));

            log.success('Emprestimos encontrados', { status, total: loans.length });
            return res.json(loans);
        } catch (err) {
            log.error('Erro ao buscar emprestimos', { err: err.message, status });
            return res.status(500).json({ error: err.message });
        }
    },

    /**
     * O que faz: lista emprestimos de um usuario com filtro opcional por status.
     * Onde e usada: GET /api/loans/user/:userId em LoansRoutes.
     * Dependencias chamadas: LoansService.getUserLoans, LoansService.isLoanOverdue.
     * Efeitos colaterais: nenhum; apenas leitura de dados.
     */
    async getLoansByUser(req, res) {
        const user_id = req.params.userId;
        const status = req.query.status || 'all';

        if (!user_id) {
            log.warn('user_id ausente na consulta de emprestimos por usuario', { user_id, status });
            return res.status(400).json({ error: 'ID do usuario e obrigatorio' });
        }

        log.start('Buscando emprestimos por usuario', { user_id, status });

        try {
            const result = await LoansService.getUserLoans(user_id, status);
            const loans = result.map((loan) => ({
                ...loan,
                is_overdue: LoansService.isLoanOverdue(loan)
            }));

            log.success('Emprestimos por usuario encontrados', { user_id, status, total: loans.length });
            return res.json(loans);
        } catch (err) {
            log.error('Erro ao buscar emprestimos por usuario', { err: err.message, user_id, status });
            return res.status(500).json({ error: err.message });
        }
    },

    /**
     * O que faz: lista emprestimos de um livro, com opcao de somente ativos.
     * Onde e usada: GET /api/loans/book/:bookId em LoansRoutes.
     * Dependencias chamadas: LoansService.getLoansByBookId.
     * Efeitos colaterais: nenhum; apenas leitura de dados.
     */
    async getLoansByBook(req, res) {
        const book_id = req.params.bookId;
        const activeOnly = req.query.activeOnly === 'true';

        if (!book_id) {
            log.warn('book_id ausente na consulta por livro', { book_id, activeOnly });
            return res.status(400).json({ error: 'ID do livro e obrigatorio' });
        }

        log.start('Buscando emprestimos por livro', { book_id, activeOnly });

        try {
            const loans = await LoansService.getLoansByBookId(book_id, activeOnly);
            log.success('Emprestimos por livro encontrados', { book_id, activeOnly, total: loans.length });
            return res.json(loans);
        } catch (err) {
            log.error('Erro ao buscar emprestimos por livro', { err: err.message, book_id, activeOnly });
            return res.status(500).json({ error: err.message });
        }
    }
};
