/**
 * Responsabilidade: gerar estatisticas do acervo de livros da biblioteca.
 * Camada: service (modulo do bloco utilities/reports).
 * Entradas/Saidas: sem argumentos; retorna resumo, distribuicoes por area/idioma e recentes.
 * Dependencias criticas: db (allQuery/getQuery), BooksService, validBookAreas e logger.
 */

const { allQuery, getQuery } = require('../../../../database/db');
const BooksService = require('../../../library/BooksService');
const { areaMapping, subareaMapping } = require('../../../../utils/validBookAreas');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: agrega estatisticas do acervo (total, subareas, circulacao, por area/idioma e recentes).
     * Onde e usada: ReportsController.getBooksStatistics/getBooksReportPDF e generateCompleteReport.
     * Dependencias chamadas: BooksService.countBooks/countBooksBy, getQuery, allQuery e mappings de areas.
     * Efeitos colaterais: nenhum alem de leitura no banco.
     *
     * Observacao: 'created_at' em 'recentlyAdded' e gerado com a data atual, pois a tabela de
     * livros ainda nao possui campo de data de criacao real.
     */
    async getBooksStatistics() {
        log.start('Gerando estatísticas do acervo');

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

            log.success('Estatísticas do acervo geradas');
            return result;
        } catch (error) {
            log.error('Erro ao gerar estatísticas do acervo', { err: error.message });
            throw error;
        }
    }
};
