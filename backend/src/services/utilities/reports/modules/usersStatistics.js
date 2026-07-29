/**
 * Responsabilidade: gerar estatisticas de usuarios da biblioteca.
 * Camada: service (modulo do bloco utilities/reports).
 * Entradas/Saidas: sem argumentos; retorna resumo, usuarios por turma e top tomadores.
 * Dependencias criticas: db (allQuery/getQuery), UsersService e logger padronizado.
 */

const { allQuery, getQuery } = require('../../../../database/db');
const UsersService = require('../../../library/users/UsersService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: agrega estatisticas de usuarios (totais, por turma e top tomadores de emprestimo).
     * Onde e usada: ReportsController.getUsersStatistics/getUsersReportPDF e generateCompleteReport.
     * Dependencias chamadas: UsersService.getAllUsers, getQuery e allQuery.
     * Efeitos colaterais: nenhum alem de leitura no banco.
     */
    async getUsersStatistics() {
        log.start('Gerando estatísticas de usuários');

        try {
            // Total de usuários
            const totalUsers = await UsersService.getAllUsers();

            // Usuários ativos (com empréstimo nos últimos 6 meses)
            const activeUsers = await getQuery(
                `SELECT COUNT(DISTINCT user_id) as total
                 FROM loans
                 WHERE borrowed_at >= date('now', '-6 months')
                 AND user_id != 0`,
                []
            );

            // Usuários por turma/classe
            const usersByClass = await allQuery(
                `SELECT class, COUNT(*) as total
                 FROM users
                 WHERE class IS NOT NULL AND class != ''
                 GROUP BY class
                 ORDER BY total DESC`,
                []
            );

            // Usuários com empréstimos atrasados atualmente
            const usersWithOverdue = await getQuery(
                `SELECT COUNT(DISTINCT user_id) as total
                 FROM loans
                 WHERE returned_at IS NULL
                 AND due_date < datetime('now')
                 AND user_id != 0`,
                []
            );

            // Top usuários por empréstimos (histórico completo)
            const topBorrowers = await allQuery(
                `SELECT
                    u.id, u.name, u.role, u.class,
                    COUNT(l.id) as total_loans
                 FROM users u
                 LEFT JOIN loans l ON u.id = l.user_id
                 WHERE u.role = 'aluno'
                 GROUP BY u.id
                 HAVING total_loans > 0
                 ORDER BY total_loans DESC
                 LIMIT 10`,
                []
            );

            const result = {
                summary: {
                    total: totalUsers.length - 2 || 0,
                    active: activeUsers.total - 2 || 0,
                },
                usersByClass,
                topBorrowers,
            };

            log.success('Estatísticas de usuários geradas');
            return result;
        } catch (error) {
            log.error('Erro ao gerar estatísticas de usuários', { err: error.message });
            throw error;
        }
    }
};
