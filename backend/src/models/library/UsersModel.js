const { executeQuery, getQuery, allQuery } = require('../../database/db');

/**
 * Model responsável pelo acesso ao banco de dados para a entidade usuário.
 */
class UsersModel {
    /**
     * Cria um novo usuário no banco de dados.
     */
    async createUser({ name, email, NUSP, phone, class: userClass}) {
        
        // Preenche valores padrão
        const role = "aluno";
        const profile_image = null;
        const password_hash = null;
        console.log("🟢 [createUser] Criando usuário:", { name, email, phone, role, NUSP, profile_image, class: userClass });
        
        // Insere o usuário no banco e retorna o ID gerado
        const result = await executeQuery(
            `INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image, class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, NUSP, email, phone, password_hash, role, profile_image, userClass, 'active']
        );
        return result.lastID;
    }

    /**
     * Busca usuário por email.
     */
    async getUserByEmail(email) {
        console.log("🟢 [getUserByEmail] email:", email);
        return await getQuery(
            `SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at, password_hash, status FROM users WHERE email = ?`,
            [email]
        );
    }

    /**
     * Busca usuário por ID.
     */
    async getUserById(id) {
        console.log("🟢 [getUserById] id:", id);
        return await getQuery(
            `SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at, password_hash, status FROM users WHERE id = ?`,
            [id]
        );
    }

    /**
     * Lista todos os usuários (sem senha).
     */
    async getAllUsers() {
        console.log("🟢 [getAllUsers] Listando todos os usuários.");
        return await allQuery(
            `SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at FROM users WHERE status != 'pending'`
        );
    }

    /**
     * Lista todos os usuários COM password_hash (apenas para export CSV).
     */
    async getAllUsersForExport() {
        console.log("🟢 [getAllUsersForExport] Listando todos os usuários com password_hash para export.");
        return await allQuery(
            `SELECT id, name, NUSP, email, phone, password_hash, role, profile_image, class, created_at FROM users`
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
            `SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at, password_hash, status FROM users WHERE NUSP = ?`,
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

    /**
     * Atualiza a imagem de perfil do usuário
     */
    async updateUserProfileImage(id, profile_image) {
        // Garante que o caminho seja sempre /images/nomedaimagem.png
        let imagePath = profile_image;
        if (profile_image && !profile_image.startsWith("/images/")) {
            const fileName = profile_image.split("/").pop();
            imagePath = `/images/${fileName}`;
        }
        console.log("🟢 [updateUserProfileImage] id:", id, "profile_image:", imagePath);
        return await executeQuery(
            `UPDATE users SET profile_image = ? WHERE id = ?`,
            [imagePath, id]
        );
    }

    /**
     * Busca usuário por telefone.
     */
    async getUserByPhone(phone) {
        console.log("🟢 [getUserByPhone] phone:", phone);
        return await getQuery(
            `SELECT id, name, NUSP, email, phone, role, status FROM users WHERE phone = ?`,
            [phone]
        );
    }

    /**
     * Cria usuário com status 'pending' (auto-cadastro aguardando aprovação).
     */
    async createPendingUser({ name, email, NUSP, phone, class: userClass }) {
        const role = "aluno";
        const profile_image = null;
        const password_hash = null;
        const status = "pending";
        console.log("🟢 [createPendingUser] Criando usuário pendente:", { name, email, phone, NUSP, class: userClass });
        const result = await executeQuery(
            `INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image, class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, NUSP, email, phone, password_hash, role, profile_image, userClass, status]
        );
        return result.lastID;
    }

    /**
     * Retorna todos os usuários com status 'pending'.
     */
    async getPendingUsers() {
        console.log("🟢 [getPendingUsers] Listando usuários pendentes.");
        return await allQuery(
            `SELECT id, name, NUSP, email, phone, class, created_at FROM users WHERE status = 'pending' ORDER BY created_at ASC`
        );
    }

    /**
     * Aprova usuário: muda status de 'pending' para 'active'.
     */
    async approveUser(id) {
        console.log("🟢 [approveUser] Aprovando usuário id:", id);
        return await executeQuery(
            `UPDATE users SET status = 'active' WHERE id = ?`,
            [id]
        );
    }

    /**
     * Retorna todos os administradores ativos do sistema.
     */
    async getAllAdmins() {
        console.log("🟢 [getAllAdmins] Listando administradores ativos.");
        return await allQuery(
            `SELECT id, name, email FROM users WHERE role = 'admin' AND status = 'active'`
        );
    }

    /**
     * Busca usuários por nome, NUSP ou email (para autocomplete)
     * @param {string} searchTerm - Termo de busca
     * @param {number} limit - Limite de resultados
     */
    async searchUsers(searchTerm, limit = 100) {
        console.log("🔵 [searchUsers] searchTerm:", searchTerm);
        let whereConditions = [];
        let params = [];
        if (searchTerm && searchTerm.length > 0) {
            whereConditions.push(`(
                name LIKE ? COLLATE NOCASE 
                OR NUSP LIKE ? COLLATE NOCASE 
                OR email LIKE ? COLLATE NOCASE
            )`);
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        // Sempre exclui usuários com cadastro pendente
        whereConditions.push(`status != 'pending'`);
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        const users = await allQuery(
            `SELECT id, name, NUSP, email, phone, class, profile_image, role FROM users
             ${whereClause}
             LIMIT ?`,
            [...params, limit]
        );
        return users;
    }
}

module.exports = new UsersModel();