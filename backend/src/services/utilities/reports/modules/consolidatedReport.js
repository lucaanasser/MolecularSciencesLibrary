/**
 * Responsabilidade: consolidar todas as estatisticas e listagens em um relatorio completo.
 * Camada: service (modulo do bloco utilities/reports).
 * Entradas/Saidas: sem argumentos; retorna estatisticas agregadas + listagens detalhadas.
 * Dependencias criticas: db (allQuery), demais modulos via this.getX e logger padronizado.
 */

const { allQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: gera relatorio completo (loans/users/books/donators) sem filtros, com listagens detalhadas.
     * Onde e usada: ReportsController.getCompleteReport/getCompleteReportPDF.
     * Dependencias chamadas: this.getLoansStatistics/getUsersStatistics/getBooksStatistics/getDonatorsStatistics e allQuery.
     * Efeitos colaterais: nenhum alem de leitura no banco.
     */
    async generateCompleteReport() {
        log.start('Gerando relatório completo');

        try {
            const [loans, users, books, donators] = await Promise.all([
                this.getLoansStatistics(),
                this.getUsersStatistics(),
                this.getBooksStatistics(),
                this.getDonatorsStatistics()
            ]);

            // Lista completa de empréstimos ativos
            const activeLoansDetails = await allQuery(
                `SELECT
                    l.id as loan_id, l.borrowed_at, l.due_date, l.renewals,
                    b.id as book_id, b.code, b.title, b.authors,
                    u.id as user_id, u.name as user_name, u.NUSP
                 FROM loans l
                 JOIN books b ON l.book_id = b.id
                 LEFT JOIN users u ON l.user_id = u.id
                 WHERE l.returned_at IS NULL
                 ORDER BY l.due_date ASC`,
                []
            );

            // Lista completa do acervo
            const allBooks = await allQuery(
                `SELECT
                    b.id, b.code, b.title, b.authors, b.area, b.subarea,
                    b.edition, b.status,
                    CASE WHEN EXISTS (
                        SELECT 1 FROM loans l WHERE l.book_id = b.id AND l.returned_at IS NULL
                    ) THEN 'Emprestado' ELSE 'Disponível' END as status
                 FROM books b
                 ORDER BY b.area, b.code`,
                []
            );

            // Lista de usuários
            const allUsers = await allQuery(
                `SELECT
                    u.id, u.NUSP, u.name, u.email, u.role, u.class,
                    (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id) as total_loans,
                    (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id AND l.returned_at IS NULL) as active_loans
                 FROM users u
                 ORDER BY u.name`,
                []
            );

            // Lista de doadores
            const allDonators = await allQuery(
                `SELECT * FROM donators ORDER BY created_at DESC`,
                []
            );

            const result = {
                generatedAt: new Date().toISOString(),
                statistics: {
                    loans,
                    users,
                    books,
                    donators
                },
                details: {
                    activeLoans: activeLoansDetails,
                    allBooks,
                    allUsers,
                    allDonators
                }
            };

            log.success('Relatório completo gerado');
            return result;
        } catch (error) {
            log.error('Erro ao gerar relatório completo', { err: error.message });
            throw error;
        }
    }
};
