/**
 * Service responsável pela geração de estatísticas e relatórios da biblioteca.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const { allQuery, getQuery } = require('../../database/db');

class ReportsService {
    /**
     * Estatísticas de empréstimos com filtros de período
     * @param {string} startDate - Data início (ISO format)
     * @param {string} endDate - Data fim (ISO format)
     */
    async getLoansStatistics(startDate = null, endDate = null) {
        console.log(`🔵 [ReportsService] Gerando estatísticas de empréstimos: ${startDate} a ${endDate}`);
        
        try {
            let dateFilter = '';
            const params = [];
            
            if (startDate && endDate) {
                dateFilter = ' AND borrowed_at BETWEEN ? AND ?';
                params.push(startDate, endDate);
            } else if (startDate) {
                dateFilter = ' AND borrowed_at >= ?';
                params.push(startDate);
            } else if (endDate) {
                dateFilter = ' AND borrowed_at <= ?';
                params.push(endDate);
            }

            // Total de empréstimos no período
            const totalLoans = await getQuery(
                `SELECT COUNT(*) as total FROM loans WHERE 1=1 ${dateFilter}`,
                params
            );

            // Empréstimos ativos (não devolvidos)
            const activeLoans = await getQuery(
                `SELECT COUNT(*) as total FROM loans WHERE returned_at IS NULL ${dateFilter}`,
                params
            );

            // Empréstimos devolvidos
            const returnedLoans = await getQuery(
                `SELECT COUNT(*) as total FROM loans WHERE returned_at IS NOT NULL ${dateFilter}`,
                params
            );

            // Empréstimos atrasados (não devolvidos e vencidos)
            const overdueLoans = await getQuery(
                `SELECT COUNT(*) as total FROM loans 
                 WHERE returned_at IS NULL 
                 AND due_date < datetime('now') ${dateFilter}`,
                params
            );

            // Uso interno (student_id = 0)
            const internalUseLoans = await getQuery(
                `SELECT COUNT(*) as total FROM loans WHERE student_id = 0 ${dateFilter}`,
                params
            );

            // Empréstimos externos (student_id != 0)
            const externalLoans = await getQuery(
                `SELECT COUNT(*) as total FROM loans WHERE student_id != 0 ${dateFilter}`,
                params
            );

            // Empréstimos por mês (últimos 12 meses)
            const loansByMonth = await allQuery(
                `SELECT 
                    strftime('%Y-%m', borrowed_at) as month,
                    COUNT(*) as total,
                    SUM(CASE WHEN student_id = 0 THEN 1 ELSE 0 END) as internal,
                    SUM(CASE WHEN student_id != 0 THEN 1 ELSE 0 END) as external
                 FROM loans 
                 WHERE borrowed_at >= date('now', '-12 months') ${dateFilter}
                 GROUP BY strftime('%Y-%m', borrowed_at)
                 ORDER BY month ASC`,
                params
            );

            // Top 10 livros mais emprestados
            const topBooks = await allQuery(
                `SELECT 
                    b.id, b.code, b.title, b.authors,
                    COUNT(l.id) as loan_count
                 FROM loans l
                 JOIN books b ON l.book_id = b.id
                 WHERE 1=1 ${dateFilter}
                 GROUP BY b.id
                 ORDER BY loan_count DESC
                 LIMIT 10`,
                params
            );

            // Top 10 usuários mais ativos (excluindo uso interno)
            const topUsers = await allQuery(
                `SELECT 
                    u.id, u.name, u.NUSP, u.role,
                    COUNT(l.id) as loan_count
                 FROM loans l
                 JOIN users u ON l.student_id = u.id
                 WHERE l.student_id != 0 ${dateFilter}
                 GROUP BY u.id
                 ORDER BY loan_count DESC
                 LIMIT 10`,
                params
            );

            // Taxa de renovação
            const renewalStats = await getQuery(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN renewals > 0 THEN 1 ELSE 0 END) as renewed,
                    AVG(renewals) as avg_renewals
                 FROM loans WHERE 1=1 ${dateFilter}`,
                params
            );

            // Empréstimos por dia da semana
            const loansByDayOfWeek = await allQuery(
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
                 FROM loans WHERE 1=1 ${dateFilter}
                 GROUP BY strftime('%w', borrowed_at)
                 ORDER BY day_num`,
                params
            );

            const result = {
                summary: {
                    total: totalLoans?.total || 0,
                    active: activeLoans?.total || 0,
                    returned: returnedLoans?.total || 0,
                    overdue: overdueLoans?.total || 0,
                    internalUse: internalUseLoans?.total || 0,
                    external: externalLoans?.total || 0,
                    renewalRate: renewalStats?.total > 0 
                        ? ((renewalStats.renewed / renewalStats.total) * 100).toFixed(1) 
                        : 0,
                    avgRenewals: renewalStats?.avg_renewals?.toFixed(2) || 0
                },
                loansByMonth,
                topBooks,
                topUsers,
                loansByDayOfWeek,
                period: { startDate, endDate }
            };

            console.log(`🟢 [ReportsService] Estatísticas de empréstimos geradas`);
            return result;
        } catch (error) {
            console.error(`🔴 [ReportsService] Erro ao gerar estatísticas de empréstimos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Estatísticas de usuários com filtros de período
     */
    async getUsersStatistics(startDate = null, endDate = null) {
        console.log(`🔵 [ReportsService] Gerando estatísticas de usuários`);
        
        try {
            // Total de usuários
            const totalUsers = await getQuery(
                `SELECT COUNT(*) as total FROM users`,
                []
            );

            // Usuários por tipo (role)
            const usersByRole = await allQuery(
                `SELECT role, COUNT(*) as total FROM users GROUP BY role`,
                []
            );

            // Usuários ativos (com empréstimo nos últimos 6 meses)
            const activeUsers = await getQuery(
                `SELECT COUNT(DISTINCT student_id) as total 
                 FROM loans 
                 WHERE borrowed_at >= date('now', '-6 months') 
                 AND student_id != 0`,
                []
            );

            // Novos cadastros por mês (últimos 12 meses)
            const newUsersByMonth = await allQuery(
                `SELECT 
                    strftime('%Y-%m', created_at) as month,
                    COUNT(*) as total
                 FROM users 
                 WHERE created_at >= date('now', '-12 months')
                 GROUP BY strftime('%Y-%m', created_at)
                 ORDER BY month ASC`,
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
                `SELECT COUNT(DISTINCT student_id) as total 
                 FROM loans 
                 WHERE returned_at IS NULL 
                 AND due_date < datetime('now')
                 AND student_id != 0`,
                []
            );

            // Top usuários por empréstimos (histórico completo)
            const topBorrowers = await allQuery(
                `SELECT 
                    u.id, u.name, u.NUSP, u.role, u.class,
                    COUNT(l.id) as total_loans,
                    SUM(CASE WHEN l.id IS NOT NULL AND l.returned_at IS NULL THEN 1 ELSE 0 END) as active_loans
                 FROM users u
                 LEFT JOIN loans l ON u.id = l.student_id
                 WHERE u.id != 0
                 GROUP BY u.id
                 HAVING total_loans > 0
                 ORDER BY total_loans DESC
                 LIMIT 15`,
                []
            );

            const result = {
                summary: {
                    total: totalUsers?.total || 0,
                    active: activeUsers?.total || 0,
                    inactive: (totalUsers?.total || 0) - (activeUsers?.total || 0),
                    withOverdue: usersWithOverdue?.total || 0
                },
                usersByRole,
                newUsersByMonth,
                usersByClass,
                topBorrowers,
                period: { startDate, endDate }
            };

            console.log(`🟢 [ReportsService] Estatísticas de usuários geradas`);
            return result;
        } catch (error) {
            console.error(`🔴 [ReportsService] Erro ao gerar estatísticas de usuários: ${error.message}`);
            throw error;
        }
    }

    /**
     * Estatísticas do acervo (sem filtro de data - estado atual)
     */
    async getBooksStatistics() {
        console.log(`🔵 [ReportsService] Gerando estatísticas do acervo`);
        
        try {
            // Total de livros
            const totalBooks = await getQuery(
                `SELECT COUNT(*) as total FROM books`,
                []
            );

            // Livros por área
            const booksByArea = await allQuery(
                `SELECT area, COUNT(*) as total 
                 FROM books 
                 GROUP BY area 
                 ORDER BY total DESC`,
                []
            );

            // Livros em reserva didática
            const reservedBooks = await getQuery(
                `SELECT COUNT(*) as total FROM books WHERE is_reserved = 1`,
                []
            );

            // Livros disponíveis (não emprestados)
            const availableBooks = await getQuery(
                `SELECT COUNT(*) as total 
                 FROM books b
                 WHERE NOT EXISTS (
                     SELECT 1 FROM loans l 
                     WHERE l.book_id = b.id 
                     AND l.returned_at IS NULL
                 )`,
                []
            );

            // Livros emprestados atualmente
            const borrowedBooks = await getQuery(
                `SELECT COUNT(DISTINCT book_id) as total 
                 FROM loans 
                 WHERE returned_at IS NULL`,
                []
            );

            // Livros nunca emprestados
            const neverBorrowed = await getQuery(
                `SELECT COUNT(*) as total 
                 FROM books b
                 WHERE NOT EXISTS (
                     SELECT 1 FROM loans l WHERE l.book_id = b.id
                 )`,
                []
            );

            // Taxa de circulação (livros com pelo menos 1 empréstimo / total)
            const circulationRate = totalBooks?.total > 0
                ? (((totalBooks.total - (neverBorrowed?.total || 0)) / totalBooks.total) * 100).toFixed(1)
                : 0;

            // Livros por subárea (top 15)
            const booksBySubarea = await allQuery(
                `SELECT area, subarea, COUNT(*) as total 
                 FROM books 
                 GROUP BY area, subarea 
                 ORDER BY total DESC
                 LIMIT 15`,
                []
            );

            // Livros com mais empréstimos (histórico)
            const mostBorrowed = await allQuery(
                `SELECT 
                    b.id, b.code, b.title, b.authors, b.area,
                    COUNT(l.id) as loan_count,
                    SUM(CASE WHEN l.student_id = 0 THEN 1 ELSE 0 END) as internal_use
                 FROM books b
                 LEFT JOIN loans l ON b.id = l.book_id
                 GROUP BY b.id
                 HAVING loan_count > 0
                 ORDER BY loan_count DESC
                 LIMIT 20`,
                []
            );

            // Livros com mais uso interno
            const mostInternalUse = await allQuery(
                `SELECT 
                    b.id, b.code, b.title, b.authors, b.area,
                    COUNT(l.id) as internal_count
                 FROM books b
                 JOIN loans l ON b.id = l.book_id
                 WHERE l.student_id = 0
                 GROUP BY b.id
                 ORDER BY internal_count DESC
                 LIMIT 10`,
                []
            );

            // Livros adicionados recentemente (baseado no id, pois books não tem created_at)
            const recentlyAdded = await allQuery(
                `SELECT 
                    id, title, authors as author, area, 
                    datetime('now') as created_at
                 FROM books
                 ORDER BY id DESC
                 LIMIT 10`,
                []
            );

            // Livros por idioma (language é INTEGER: 1=Português, 2=Inglês, etc)
            const booksByLanguage = await allQuery(
                `SELECT 
                    CASE language
                        WHEN 1 THEN 'Português'
                        WHEN 2 THEN 'Inglês'
                        WHEN 3 THEN 'Espanhol'
                        WHEN 4 THEN 'Francês'
                        WHEN 5 THEN 'Alemão'
                        ELSE 'Outro'
                    END as language, 
                    COUNT(*) as total 
                 FROM books 
                 GROUP BY language 
                 ORDER BY total DESC
                 LIMIT 10`,
                []
            );

            // Livros com uso interno total
            const internalUseCount = await getQuery(
                `SELECT COUNT(DISTINCT book_id) as total 
                 FROM loans 
                 WHERE student_id = 0`,
                []
            );

            // Livros com uso interno - estatísticas detalhadas
            const internalUsageBooks = await allQuery(
                `SELECT 
                    b.id, b.title, b.authors as author,
                    SUM(CASE WHEN l.student_id = 0 THEN 1 ELSE 0 END) as internal_loans,
                    COUNT(l.id) as total_loans
                 FROM books b
                 JOIN loans l ON b.id = l.book_id
                 GROUP BY b.id
                 HAVING internal_loans > 0
                 ORDER BY internal_loans DESC
                 LIMIT 10`,
                []
            );

            const result = {
                summary: {
                    total: totalBooks?.total || 0,
                    available: availableBooks?.total || 0,
                    borrowed: borrowedBooks?.total || 0,
                    reserved: reservedBooks?.total || 0,
                    neverBorrowed: neverBorrowed?.total || 0,
                    internalUse: internalUseCount?.total || 0,
                    circulationRate
                },
                booksByArea,
                booksBySubarea,
                booksByLanguage,
                mostBorrowed: mostBorrowed.map(b => ({
                    id: b.id,
                    title: b.title,
                    author: b.authors,
                    area: b.area,
                    total_loans: b.loan_count,
                    is_available: b.internal_use < b.loan_count ? 1 : 0
                })),
                internalUsageBooks,
                recentlyAdded,
                mostInternalUse
            };

            console.log(`🟢 [ReportsService] Estatísticas do acervo geradas`);
            return result;
        } catch (error) {
            console.error(`🔴 [ReportsService] Erro ao gerar estatísticas do acervo: ${error.message}`);
            throw error;
        }
    }

    /**
     * Estatísticas de doadores com filtros de período
     */
    async getDonatorsStatistics(startDate = null, endDate = null) {
        console.log(`🔵 [ReportsService] Gerando estatísticas de doadores`);
        
        try {
            let dateFilter = '';
            const params = [];
            
            if (startDate && endDate) {
                dateFilter = ' AND created_at BETWEEN ? AND ?';
                params.push(startDate, endDate);
            } else if (startDate) {
                dateFilter = ' AND created_at >= ?';
                params.push(startDate);
            } else if (endDate) {
                dateFilter = ' AND created_at <= ?';
                params.push(endDate);
            }

            // Total de doadores
            const totalDonators = await getQuery(
                `SELECT COUNT(*) as total FROM donators WHERE 1=1 ${dateFilter}`,
                params
            );

            // Doações de livros
            const bookDonations = await getQuery(
                `SELECT COUNT(*) as total FROM donators WHERE donation_type = 'book' ${dateFilter}`,
                params
            );

            // Doações financeiras
            const moneyDonations = await getQuery(
                `SELECT 
                    COUNT(*) as total,
                    SUM(amount) as total_amount
                 FROM donators 
                 WHERE donation_type = 'money' ${dateFilter}`,
                params
            );

            // Doadores cadastrados vs não cadastrados
            const registeredDonators = await getQuery(
                `SELECT COUNT(*) as total FROM donators WHERE user_id IS NOT NULL ${dateFilter}`,
                params
            );

            // Doações por mês
            const donationsByMonth = await allQuery(
                `SELECT 
                    strftime('%Y-%m', created_at) as month,
                    COUNT(*) as total,
                    SUM(CASE WHEN donation_type = 'book' THEN 1 ELSE 0 END) as books,
                    SUM(CASE WHEN donation_type = 'money' THEN 1 ELSE 0 END) as money,
                    SUM(CASE WHEN donation_type = 'money' THEN amount ELSE 0 END) as money_total
                 FROM donators 
                 WHERE created_at >= date('now', '-12 months') ${dateFilter}
                 GROUP BY strftime('%Y-%m', created_at)
                 ORDER BY month ASC`,
                params
            );

            // Top doadores (por quantidade de doações)
            const topDonators = await allQuery(
                `SELECT 
                    id,
                    name,
                    contact,
                    COUNT(*) as total_donations,
                    SUM(CASE WHEN donation_type = 'book' THEN 1 ELSE 0 END) as books_donated,
                    SUM(CASE WHEN donation_type = 'money' THEN amount ELSE 0 END) as monetary_donated
                 FROM donators
                 WHERE 1=1 ${dateFilter}
                 GROUP BY name
                 ORDER BY total_donations DESC
                 LIMIT 10`,
                params
            );

            // Doações recentes
            const recentDonations = await allQuery(
                `SELECT 
                    d.id,
                    d.name as donator_name,
                    d.donation_type as type,
                    d.amount as value,
                    COALESCE(b.title, '') as book_title,
                    d.created_at
                 FROM donators d
                 LEFT JOIN books b ON d.book_id = b.id
                 WHERE 1=1 ${dateFilter}
                 ORDER BY d.created_at DESC
                 LIMIT 20`,
                params
            );

            const result = {
                summary: {
                    totalDonators: totalDonators?.total || 0,
                    totalDonations: (bookDonations?.total || 0) + (moneyDonations?.total || 0),
                    bookDonations: bookDonations?.total || 0,
                    monetaryDonations: moneyDonations?.total || 0,
                    totalMonetaryValue: moneyDonations?.total_amount || 0
                },
                donationsByMonth: donationsByMonth.map(m => ({
                    month: m.month,
                    books: m.books,
                    monetary: m.money
                })),
                topDonators,
                recentDonations,
                period: { startDate, endDate }
            };

            console.log(`🟢 [ReportsService] Estatísticas de doadores geradas`);
            return result;
        } catch (error) {
            console.error(`🔴 [ReportsService] Erro ao gerar estatísticas de doadores: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gera relatório completo consolidado (todos os dados sem filtros)
     */
    async generateCompleteReport() {
        console.log(`🔵 [ReportsService] Gerando relatório completo`);
        
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
                 LEFT JOIN users u ON l.student_id = u.id
                 WHERE l.returned_at IS NULL
                 ORDER BY l.due_date ASC`,
                []
            );

            // Lista completa do acervo
            const allBooks = await allQuery(
                `SELECT 
                    b.id, b.code, b.title, b.authors, b.area, b.subarea, 
                    b.edition, b.is_reserved,
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
                    (SELECT COUNT(*) FROM loans l WHERE l.student_id = u.id) as total_loans,
                    (SELECT COUNT(*) FROM loans l WHERE l.student_id = u.id AND l.returned_at IS NULL) as active_loans
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

            console.log(`🟢 [ReportsService] Relatório completo gerado`);
            return result;
        } catch (error) {
            console.error(`🔴 [ReportsService] Erro ao gerar relatório completo: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ReportsService();
