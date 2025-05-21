const { executeQuery, getQuery, allQuery } = require('../database/db');

class UsersModel {
    async createUser({ name, email, password_hash, role }) {
        return await executeQuery(
            `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
            [name, email, password_hash, role]
        );
    }

    async getUserByEmail(email) {
        return await getQuery(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
    }

    async getUserById(id) {
        return await getQuery(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );
    }

    async getAllUsers() {
        return await allQuery(
            `SELECT id, name, email, role, created_at FROM users`
        );
    }

    async deleteUserById(id) {
        return await executeQuery(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );
    }

    async getUserByNUSP(NUSP) {
        return await getQuery(
            `SELECT * FROM users WHERE NUSP = ?`,
            [NUSP]
        );
    }
}

module.exports = new UsersModel();