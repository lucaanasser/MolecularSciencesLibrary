/**
 * Responsabilidade: gerar estatisticas de doadores com filtros de periodo.
 * Camada: service (modulo do bloco utilities/reports).
 * Entradas/Saidas: recebe startDate/endDate opcionais; retorna resumo, series e listagens de doacoes.
 * Dependencias criticas: db (allQuery/getQuery) e logger padronizado.
 */

const { allQuery, getQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: agrega estatisticas de doadores (totais, por mes, top doadores e recentes) filtrando por periodo.
     * Onde e usada: ReportsController.getDonatorsStatistics/getDonatorsReportPDF e generateCompleteReport.
     * Dependencias chamadas: getQuery e allQuery com filtro dinamico de created_at.
     * Efeitos colaterais: nenhum alem de leitura no banco.
     */
    async getDonatorsStatistics(startDate = null, endDate = null) {
        log.start('Gerando estatísticas de doadores');

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

            log.success('Estatísticas de doadores geradas');
            return result;
        } catch (error) {
            log.error('Erro ao gerar estatísticas de doadores', { err: error.message });
            throw error;
        }
    }
};
