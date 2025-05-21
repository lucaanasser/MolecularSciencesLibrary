const { executeQuery, getQuery, allQuery } = require('../database/db');

class UsersModel {
    async createUser({ name, email, password_hash, role, NUSP }) {
        console.log("🟢 [createUser] Criando usuário:", { name, email, role, NUSP });
        return await executeQuery(
            `INSERT INTO users (name, NUSP, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            [name, NUSP, email, password_hash, role]
        );
    }

    async getUserByEmail(email) {
        console.log("🟢 [getUserByEmail] email:", email);
        return await getQuery(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
    }

    async getUserById(id) {
        console.log("🟢 [getUserById] id:", id);
        return await getQuery(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );
    }

    async getAllUsers() {
        return await allQuery(
            `SELECT id, name, NUSP, email, role, created_at FROM users`
        );
    }

    async deleteUserById(id) {
        return await executeQuery(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );
    }

    async getUserByNUSP(NUSP) {
        console.log("🟢 [getUserByNUSP] NUSP:", NUSP);
        return await getQuery(
            `SELECT * FROM users WHERE NUSP = ?`,
            [NUSP]
        );
    }
}

module.exports = new UsersModel();