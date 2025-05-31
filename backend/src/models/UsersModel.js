const { executeQuery, getQuery, allQuery } = require('../database/db');

/**
 * Model responsável pelo acesso ao banco de dados para a entidade usuário.
 */
class UsersModel {
    /**
     * Cria um novo usuário no banco de dados.
     */
    async createUser({ name, email, password_hash, role, NUSP }) {
        console.log("🟢 [createUser] Criando usuário:", { name, email, role, NUSP });
        return await executeQuery(
            `INSERT INTO users (name, NUSP, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            [name, NUSP, email, password_hash, role]
        );
    }

    /**
     * Busca usuário por email.
     */
    async getUserByEmail(email) {
        console.log("🟢 [getUserByEmail] email:", email);
        return await getQuery(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
    }

    /**
     * Busca usuário por ID.
     */
    async getUserById(id) {
        console.log("🟢 [getUserById] id:", id);
        return await getQuery(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );
    }

    /**
     * Lista todos os usuários (sem senha).
     */
    async getAllUsers() {
        console.log("🟢 [getAllUsers] Listando todos os usuários.");
        return await allQuery(
            `SELECT id, name, NUSP, email, role, created_at FROM users`
        );
    }

    /**
     * Deleta usuário por ID.
     */
    async deleteUserById(id) {
        console.log("🟢 [deleteUserById] id:", id);
        return await executeQuery(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );
    }

    /**
     * Busca usuário por NUSP.
     */
    async getUserByNUSP(NUSP) {
        console.log("🟢 [getUserByNUSP] NUSP:", NUSP);
        return await getQuery(
            `SELECT * FROM users WHERE NUSP = ?`,
            [NUSP]
        );
    }

    /**
     * Atualiza a senha do usuário
     */
    async updateUserPassword(id, password_hash) {
        console.log("🟢 [updateUserPassword] id:", id);
        return await executeQuery(
            `UPDATE users SET password_hash = ? WHERE id = ?`,
            [password_hash, id]
        );
    }
}

module.exports = new UsersModel();