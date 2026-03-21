/**
 * Responsabilidade: consultas e utilitarios de leitura do dominio de emprestimos.
 * Camada: service.
 * Entradas/Saidas: lista emprestimos e calcula sinalizacao de atraso.
 * Dependencias criticas: LoansModel.
 */

const LoansModel = require('../../../../models/library/LoansModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista emprestimos com filtro opcional por status.
     * Onde e usada: queryHandlers.getLoans e scripts de relatorio.
     * Dependencias chamadas: LoansModel.getAllLoans.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getLoans(status = 'all') {
        log.start('Buscando emprestimos', { status });
        try {
            const loans = await LoansModel.getAllLoans(status);
            log.success('Emprestimos buscados com sucesso', { status, total: loans.length });
            return loans;
        } catch (err) {
            log.error('Erro ao buscar emprestimos', { err: err.message, status });
            throw err;
        }
    },

    /**
     * O que faz: lista emprestimos de um usuario com filtro opcional por status.
     * Onde e usada: queryHandlers.getLoansByUser e regras de renovacao/extensao.
     * Dependencias chamadas: LoansModel.getLoansByUser.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getUserLoans(userId, status = 'all') {
        log.start('Buscando emprestimos do usuario', { user_id: userId, status });
        try {
            const loans = await LoansModel.getLoansByUser(userId, status);
            log.success('Emprestimos do usuario encontrados', { user_id: userId, status, total: loans.length });
            return loans;
        } catch (err) {
            log.error('Erro ao buscar emprestimos do usuario', { err: err.message, user_id: userId, status });
            throw err;
        }
    },

    /**
     * O que faz: retorna se um emprestimo esta atrasado com base no due_date.
     * Onde e usada: handlers de consulta e regras de renovacao/extensao.
     * Dependencias chamadas: _isOverdueLoan.
     * Efeitos colaterais: nenhum; calculo em memoria.
     */
    isLoanOverdue(loan) {
        return this._isOverdueLoan(loan, true);
    },

    /**
     * O que faz: conta emprestimos por status.
     * Onde e usada: ReportsService e dashboards.
     * Dependencias chamadas: LoansModel.countLoans.
     * Efeitos colaterais: nenhum; leitura agregada.
     */
    async countLoans(status = 'all') {
        log.start('Contando emprestimos', { status });
        try {
            const result = await LoansModel.countLoans(status);
            log.success('Contagem de emprestimos concluida', { status, total: result });
            return result;
        } catch (error) {
            log.error('Erro ao contar emprestimos', { err: error.message, status });
            throw error;
        }
    },

    /**
     * O que faz: busca emprestimos por livro com opcao de filtrar apenas ativos.
     * Onde e usada: queryHandlers.getLoansByBook.
     * Dependencias chamadas: LoansModel.getLoansByBookId.
     * Efeitos colaterais: nenhum; leitura de dados.
     */
    async getLoansByBookId(book_id, activeOnly = false) {
        return await LoansModel.getLoansByBookId(book_id, activeOnly);
    },

    /**
     * O que faz: lista emprestimos ativos incluindo flag calculada de atraso.
     * Onde e usada: scripts legados de notificacao.
     * Dependencias chamadas: getLoans e _isOverdueLoan.
     * Efeitos colaterais: nenhum; leitura e enriquecimento de payload.
     */
    async listActiveLoansWithOverdue() {
        log.start('Listando emprestimos ativos com calculo de atraso');
        const loans = await this.getLoans('active');
        return loans.map((loan) => ({
            ...loan,
            is_overdue: this._isOverdueLoan(loan, false)
        }));
    },

    /**
     * O que faz: alias legado para listagem de emprestimos ativos com atraso.
     * Onde e usada: integracoes antigas que ainda usam assinatura anterior.
     * Dependencias chamadas: listActiveLoansWithOverdue.
     * Efeitos colaterais: nenhum.
     */
    async listActiveLoans() {
        return this.listActiveLoansWithOverdue();
    },

    /**
     * O que faz: helper central para avaliar atraso sem duplicar regra entre modulos.
     * Onde e usada: isLoanOverdue, listActiveLoansWithOverdue e modulos de renovacao/extensao.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: opcionalmente lanca erro quando due_date ausente.
     */
    _isOverdueLoan(loan, throwOnMissingDueDate = false) {
        if (!loan || loan.returned_at) return false;

        if (!loan.due_date) {
            log.warn('Emprestimo sem due_date definido', { loan_id: loan?.id });
            if (throwOnMissingDueDate) {
                throw new Error('Emprestimo sem data de devolucao definida.');
            }
            return false;
        }

        const due = new Date(String(loan.due_date).replace(' ', 'T'));
        return due < new Date();
    }
};
