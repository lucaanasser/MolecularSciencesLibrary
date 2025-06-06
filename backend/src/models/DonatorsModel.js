// Modelo para operações no banco de dados relacionadas a doadores (donators)
const { executeQuery, getQuery, allQuery } = require('../database/db');

/**
 * Estrutura esperada da tabela donators:
 * - id: INTEGER PRIMARY KEY AUTOINCREMENT
 * - user_id: INTEGER (nullable, se for usuário cadastrado)
 * - name: TEXT (nome do doador, obrigatório se não for usuário)
 * - book_id: INTEGER (nullable, id do livro doado se aplicável)
 * - donation_type: TEXT ('book' ou 'money')
 * - amount: REAL (nullable, valor doado se for doação financeira)
 * - contact: TEXT (opcional, email ou telefone do doador)
 * - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * - notes: TEXT (opcional, observações)
 */

class DonatorsModel {
    async addDonator({ user_id = null, name = null, book_id = null, donation_type, amount = null, contact = null, notes = null }) {
        const query = `
            INSERT INTO donators (user_id, name, book_id, donation_type, amount, contact, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return executeQuery(query, [user_id, name, book_id, donation_type, amount, contact, notes]);
    }

    async removeDonator(id) {
        const query = `DELETE FROM donators WHERE id = ?`;
        return executeQuery(query, [id]);
    }

    async getAllDonators() {
        const query = `SELECT * FROM donators ORDER BY created_at DESC`;
        return allQuery(query);
    }

    async getDonatorById(id) {
        const query = `SELECT * FROM donators WHERE id = ?`;
        return getQuery(query, [id]);
    }
}

module.exports = new DonatorsModel();
