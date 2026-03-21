/**
 * Responsabilidade: operacoes de escrita e consultas base de doadores.
 * Camada: model.
 * Entradas/Saidas: persiste e busca registros da tabela donators.
 * Dependencias criticas: database/db.
 */

const { executeQuery, getQuery, allQuery } = require('../../../../database/db');

module.exports = {
    /**
     * O que faz: cria um novo registro de doador.
     * Onde e usada: DonatorsService.addDonator e fluxo de importacao CSV.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: insere linha na tabela donators.
     */
    async addDonator({ user_id = null, name = null, tag = null, book_id = null, donation_type, amount = null, contact = null, notes = null }) {
        const query = `
            INSERT INTO donators (user_id, name, tag, book_id, donation_type, amount, contact, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return executeQuery(query, [user_id, name, tag, book_id, donation_type, amount, contact, notes]);
    },

    /**
     * O que faz: remove um doador por id.
     * Onde e usada: DonatorsService.removeDonator.
     * Dependencias chamadas: executeQuery.
     * Efeitos colaterais: remove linha da tabela donators.
     */
    async removeDonator(id) {
        return executeQuery('DELETE FROM donators WHERE id = ?', [id]);
    },

    /**
     * O que faz: retorna todos os doadores ordenados por data.
     * Onde e usada: listagens e exportacao CSV.
     * Dependencias chamadas: allQuery.
     * Efeitos colaterais: nenhum.
     */
    async getAllDonators() {
        return allQuery('SELECT * FROM donators ORDER BY created_at DESC');
    },

    /**
     * O que faz: busca um doador por id.
     * Onde e usada: DonatorsService.getDonatorById.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum.
     */
    async getDonatorById(id) {
        return getQuery('SELECT * FROM donators WHERE id = ?', [id]);
    },

    /**
     * O que faz: busca doador associado a um livro.
     * Onde e usada: consultas de doacao por livro em outros fluxos.
     * Dependencias chamadas: getQuery.
     * Efeitos colaterais: nenhum.
     */
    async getDonatorByBookId(bookId) {
        return getQuery("SELECT * FROM donators WHERE book_id = ? AND donation_type = 'book' LIMIT 1", [bookId]);
    }
};
