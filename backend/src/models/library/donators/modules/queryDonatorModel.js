/**
 * Responsabilidade: consultas agregadas e filtros de doadores.
 * Camada: model.
 * Entradas/Saidas: retorna listas filtradas e mural com dados de livros.
 * Dependencias criticas: database/db.
 */

const { allQuery } = require('../../../../database/db');

module.exports = {
    /**
     * O que faz: aplica filtros opcionais por tipo, nome e origem do doador.
     * Onde e usada: DonatorsService.getFilteredDonators.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async getFilteredDonators({ isUser, donationType, name }) {
        let query = 'SELECT * FROM donators WHERE 1=1';
        const params = [];

        if (isUser !== undefined) {
            query += isUser ? ' AND user_id IS NOT NULL' : ' AND user_id IS NULL';
        }
        if (donationType) {
            query += ' AND donation_type = ?';
            params.push(donationType);
        }
        if (name) {
            query += ' AND name LIKE ?';
            params.push(`%${name}%`);
        }

        query += ' ORDER BY created_at DESC';
        return allQuery(query, params);
    },

    /**
     * O que faz: lista doadores com metadados de livros para exibicao em mural.
     * Onde e usada: DonatorsService.getAllDonatorsWithBooks.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async getAllDonatorsWithBooks() {
        const query = `
            SELECT
                d.name, d.tag, d.donation_type, d.book_id, d.amount, d.created_at,
                b.title AS book_title, b.authors AS book_authors, b.code AS book_code
            FROM donators d
            LEFT JOIN books b ON d.book_id = b.id
            WHERE d.name IS NOT NULL AND d.name != ''
            ORDER BY d.name ASC, d.created_at DESC
        `;
        return allQuery(query);
    }
};
