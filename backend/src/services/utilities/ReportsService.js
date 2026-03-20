/**
 * Service responsável pela geração de estatísticas e relatórios da biblioteca.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const { allQuery, getQuery } = require('../../database/db');

const BooksService = require('../library/BooksService');
const { areaMapping, subareaMapping } = require('../../utils/validBookAreas');
            
const LoansService = require('../library/loans/LoansService');
const UsersService = require('../library/UsersService');

class ReportsService {
        /**
     * Gera estatísticas detalhadas dos empréstimos da biblioteca.
     *
     * Retorno:
     * {
     *   summary: {
     *     total: number,           // Total de empréstimos realizados
     *     active: number,          // Empréstimos ativos (não devolvidos)
     *     overdue: number,         // Empréstimos atrasados
     *     internalUse: number,     // Empréstimos de uso interno (user_id = 2)
     *     external: number,        // Empréstimos externos (user_id != 2)
     *     renewalRate: string,     // Percentual de empréstimos que foram renovados pelo menos uma vez (ex: "42.5")
     *     avgRenewals: string      // Média de renovações por empréstimo (ex: "0.38")
     *   },
     *   loansByMonth: Array<{      // Lista de empréstimos por mês (últimos 12 meses)
     *     month: string,           
     *     total: number,           
     *     internal: number,        
     *     external: number         
     *   }>,
     *   loansByDayOfWeek: Array<{  // Distribuição percentual dos empréstimos por dia da semana
     *     day_name: string,        
     *     day_num: string,         
     *     percent: string          
     *   }>,
     *   topBooks: Array<{          // Top 10 livros mais emprestados
     *     id: number,
     *     title: string,
     *     authors: string,
     *     area: string,
     *     loan_count: number
     *   }>
     * }
     */
    async getLoansStatistics() {
        console.log(`🔵 [ReportsService] Gerando estatísticas de empréstimos`);
        
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
            console.log(loansByDayOfWeek)

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
    async getUsersStatistics() {
        console.log(`🔵 [ReportsService] Gerando estatísticas de usuários`);
        
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

            console.log(`🟢 [ReportsService] Estatísticas de usuários geradas`);
            return result;
        } catch (error) {
            console.error(`🔴 [ReportsService] Erro ao gerar estatísticas de usuários: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gera estatísticas detalhadas do acervo de livros da biblioteca.
     *
     * Retorno:
     * {
     *   summary: {
     *     total: number,                // Total de livros cadastrados no acervo
     *     numberOfSubareas: number,     // Soma total de subáreas distintas em todas as áreas
     *     circulationRate: string       // Percentual de livros que já foram emprestados pelo menos uma vez (ex: "78.2")
     *   },
     *   booksByArea: Array<{            // Lista de áreas com o total de livros em cada uma
     *     area: string,
     *     count: number
     *   }>,
     *   subareasByArea: Array<{         // Lista de áreas com o total de subáreas distintas em cada uma
     *     area: string,
     *     count: number
     *   }>,
     *   booksByLanguage: Array<{        // Lista dos principais idiomas com o total de livros em cada um
     *     language: string,
     *     count: number
     *   }>,
     *   recentlyAdded: Array<{          // Lista dos 10 livros mais recentemente adicionados
     *     id: number,
     *     title: string,
     *     author: string,
     *     area: string,
     *     created_at: string            // Data de adição (atualmente sempre 'now', pois não há campo real)
     *   }>
     * }
     *
     * Observação: O campo 'created_at' em 'recentlyAdded' é gerado com a data atual, pois a tabela de livros AINDA não possui campo de data de criação real.
     */
    async getBooksStatistics() {
        console.log(`🔵 [ReportsService] Gerando estatísticas do acervo`);
        
        try {
           
            /* ========== Dados do resumo ========== */
            
            // Total de livros
            const totalBooks = await BooksService.countBooks();

            // Total de subáreas
            let totalSubareas;

            // Livros nunca emprestados
            const neverBorrowed = await getQuery(
                `SELECT COUNT(*) as count 
                 FROM books b
                 WHERE NOT EXISTS (
                     SELECT 1 FROM loans l WHERE l.book_id = b.id
                 )`,
                []
            );

            // Taxa de circulação (livros com pelo menos 1 empréstimo / total)
            const circulationRate = (((totalBooks - (neverBorrowed?.count || 0)) / totalBooks) * 100).toFixed(1);

            /* ========== Relatórios detalhados ========== */
            
            // Livros por área
            const booksByArea = await BooksService.countBooksBy('area');

            // Subáreas por área
            const subareasByArea = {};
            for (const areaName in areaMapping) {
                const areaCode = areaMapping[areaName];
                subareasByArea[areaName] = Object.keys(subareaMapping[areaCode]);
            }
            totalSubareas = Object.values(subareasByArea).reduce((sum, list) => sum + list.length, 0);

            // Livros por idioma
            const booksByLanguage = await BooksService.countBooksBy('language');

            // Livros adicionados recentemente (baseado no id, pois books não tem created_at)
            // ESSE AQUI N FAZ SENTIDO, O ID É ALEATÓRIO. PRECISA RE-IMPLEMENTAR DEPOIS
            const recentlyAdded = await allQuery(
                `SELECT 
                    id, title, authors as author, area, 
                    datetime('now') as created_at
                 FROM books
                 ORDER BY id DESC
                 LIMIT 10`,
                []
            );

            const result = {
                summary: {
                    total: totalBooks || 0,
                    numberOfSubareas: totalSubareas || 0,
                    circulationRate
                },
                booksByArea,
                subareasByArea,
                booksByLanguage,
                recentlyAdded,
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

            console.log(`🟢 [ReportsService] Relatório completo gerado`);
            return result;
        } catch (error) {
            console.error(`🔴 [ReportsService] Erro ao gerar relatório completo: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ReportsService();
