/**
 * Responsabilidade: gerar estatisticas detalhadas dos emprestimos da biblioteca.
 * Camada: service (modulo do bloco utilities/reports).
 * Entradas/Saidas: sem argumentos; retorna resumo, series por mes/dia e top livros.
 * Dependencias criticas: db (allQuery/getQuery), LoansService e logger padronizado.
 */

const { allQuery, getQuery } = require('../../../../database/db');
const LoansService = require('../../../library/loans/LoansService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: agrega estatisticas de emprestimos (resumo, por mes, por dia da semana, top 10 livros).
     * Onde e usada: ReportsController.getLoansStatistics/getLoansReportPDF e generateCompleteReport.
     * Dependencias chamadas: LoansService.countLoans/getUserLoans, allQuery e getQuery.
     * Efeitos colaterais: nenhum alem de leitura no banco.
     *
     * Retorno:
     * {
     *   summary: {
     *     total: number,           // Total de emprestimos realizados
     *     active: number,          // Emprestimos ativos (nao devolvidos)
     *     overdue: number,         // Emprestimos atrasados
     *     internalUse: number,     // Emprestimos de uso interno (user_id = 2)
     *     external: number,        // Emprestimos externos (user_id != 2)
     *     renewalRate: string,     // Percentual de emprestimos que foram renovados pelo menos uma vez (ex: "42.5")
     *     avgRenewals: string      // Media de renovacoes por emprestimo (ex: "0.38")
     *   },
     *   loansByMonth: Array<{ month, total, internal, external }>,
     *   loansByDayOfWeek: Array<{ day_name, day_num, percent }>,
     *   topBooks: Array<{ id, title, authors, area, loan_count }>
     * }
     */
    async getLoansStatistics() {
        log.start('Gerando estatísticas de empréstimos');

        try {
            /* ========== Dados do resumo ========== */

            // Total de empréstimos
            const totalLoans = await LoansService.countLoans();

            // Empréstimos ativos (não devolvidos)
            const activeLoans = await LoansService.countLoans("active");

            // Empréstimos devolvidos
            const returnedLoans = await LoansService.countLoans("returned");

            // Empréstimos atrasados
            const overdueLoans = totalLoans - activeLoans - returnedLoans;


            /* ========== Relatórios detalhados ========== */

            // Uso interno (user_id = 2)
            const internalUseLoans = (await LoansService.getUserLoans(2)).length;

            // Empréstimos externos (user_id != 2)
            const externalLoans = totalLoans - internalUseLoans;

            // Empréstimos por mês (últimos 12 meses)
            const loansByMonth = await allQuery(
                `SELECT
                    strftime('%m/%Y', borrowed_at) as month,
                    COUNT(*) as total,
                    SUM(CASE WHEN user_id = 0 THEN 1 ELSE 0 END) as internal,
                    SUM(CASE WHEN user_id != 0 THEN 1 ELSE 0 END) as external,
                    strftime('%Y-%m', borrowed_at) as sort_key
                FROM loans
                WHERE borrowed_at >= date('now', '-12 months')
                GROUP BY sort_key
                ORDER BY sort_key ASC`
            );

            // Top 10 livros mais emprestados
            const topBooks = await allQuery(
                `SELECT
                    b.id, b.title, b.authors, b.area,
                    COUNT(l.id) as loan_count
                 FROM loans l
                 JOIN books b ON l.book_id = b.id
                 GROUP BY b.title
                 ORDER BY loan_count DESC
                 LIMIT 10`
            );

            // Taxa de renovação
            const renewalStats = await getQuery(
                `SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN renewals > 0 THEN 1 ELSE 0 END) as renewed,
                    AVG(renewals) as avg_renewals
                 FROM loans`
            );

            // Empréstimos por dia da semana
            const loansByDayOfWeekRaw = await allQuery(
                `SELECT
                    CASE strftime('%w', borrowed_at)
                        WHEN '0' THEN 'Domingo'
                        WHEN '1' THEN 'Segunda'
                        WHEN '2' THEN 'Terça'
                        WHEN '3' THEN 'Quarta'
                        WHEN '4' THEN 'Quinta'
                        WHEN '5' THEN 'Sexta'
                        WHEN '6' THEN 'Sábado'
                    END as day_name,
                    strftime('%w', borrowed_at) as day_num,
                    COUNT(*) as total
                 FROM loans
                 GROUP BY strftime('%w', borrowed_at)
                 ORDER BY day_num`
            );

            // Calcula o total de empréstimos no período
            const totalByWeek = loansByDayOfWeekRaw.reduce((sum, d) => sum + d.total, 0);

            // Calcula a porcentagem para cada dia
            const loansByDayOfWeek = loansByDayOfWeekRaw.map(d => ({
                day_name: d.day_name,
                day_num: d.day_num,
                percent: totalByWeek > 0 ? ((d.total / totalByWeek) * 100).toFixed(1) : "0.0"
            }));

            const result = {
                summary: {
                    total: totalLoans,
                    active: activeLoans,
                    overdue: overdueLoans,
                    internalUse: internalUseLoans || 0,
                    external: externalLoans || 0,
                    renewalRate: renewalStats?.total > 0
                        ? ((renewalStats.renewed / renewalStats.total) * 100).toFixed(1)
                        : 0,
                    avgRenewals: renewalStats?.avg_renewals?.toFixed(2) || 0
                },
                loansByMonth,
                loansByDayOfWeek,
                topBooks,
            };

            log.success('Estatísticas de empréstimos geradas');
            return result;
        } catch (error) {
            log.error('Erro ao gerar estatísticas de empréstimos', { err: error.message });
            throw error;
        }
    }
};
