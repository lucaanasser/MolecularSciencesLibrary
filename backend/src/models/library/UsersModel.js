const { executeQuery, getQuery, allQuery } = require('../../database/db');

/**
 * Model responsável pelo acesso ao banco de dados para a entidade usuário.
 */
class UsersModel {
    /**
     * Cria um novo usuário no banco de dados.
     */
    async createUser({ name, email, phone, password_hash, role, NUSP, profile_image, class: userClass }) {
        console.log("🟢 [createUser] Criando usuário:", { name, email, phone, role, NUSP, profile_image, class: userClass });
        const result = await executeQuery(
            `INSERT INTO users (name, NUSP, email, phone, password_hash, role, profile_image, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, NUSP, email, phone, password_hash, role, profile_image, userClass || null]
        );
        return result.lastID;
    }

    /**
     * Busca usuário por email.
     */
    async getUserByEmail(email) {
        console.log("🟢 [getUserByEmail] email:", email);
        return await getQuery(
            `SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at, password_hash FROM users WHERE email = ?`,
            [email]
        );
    }

    /**
     * Busca usuário por ID.
     */
    async getUserById(id) {
        console.log("🟢 [getUserById] id:", id);
        return await getQuery(
            `SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at, password_hash FROM users WHERE id = ?`,
            [id]
        );
    }

    /**
     * Lista todos os usuários (sem senha).
     */
    async getAllUsers() {
        console.log("🟢 [getAllUsers] Listando todos os usuários.");
        return await allQuery(
            `SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at FROM users`
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
            `SELECT id, name, NUSP, email, phone, role, profile_image, class, created_at, password_hash FROM users WHERE NUSP = ?`,
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
     * Busca usuários por nome, NUSP ou turma (para autocomplete)
     * Retorna apenas dados públicos: id, name, class, profile_image, tags, curso_origem
     * 
     * @param {string} searchTerm - Termo de busca
     * @param {number} limit - Limite de resultados
     * @param {object} filters - Filtros opcionais: { tags: [], curso: string, disciplina: string, turma: string }
     */
    async searchUsers(searchTerm, limit = 1000, filters = {}) {
        console.log("🔵 [searchUsers] searchTerm:", searchTerm, "filters:", filters);
        
        let whereConditions = [];
        let params = [];
        
        // Condição de busca por termo
        if (searchTerm && searchTerm.length >= 2) {
            whereConditions.push(`(
                u.name LIKE ? COLLATE NOCASE 
                OR u.NUSP LIKE ? COLLATE NOCASE 
                OR u.class LIKE ? COLLATE NOCASE
            )`);
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        
        // Filtro por turma
        if (filters.turma) {
            whereConditions.push(`u.class = ?`);
            params.push(filters.turma);
        }
        
        // Filtro por curso de origem
        if (filters.curso) {
            whereConditions.push(`pp.curso_origem = ?`);
            params.push(filters.curso);
        }
        
        // Busca base com LEFT JOIN no perfil público
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';
        
        const users = await allQuery(
            `SELECT DISTINCT u.id, u.name, u.class, u.profile_image, pp.curso_origem
             FROM users u
             LEFT JOIN public_profiles pp ON pp.user_id = u.id
             ${whereClause}
             LIMIT ?`,
            [...params, limit]
        );
        
        // Para cada usuário, busca tags e disciplinas
        let usersWithData = await Promise.all(
            users.map(async (user) => {
                const tags = await allQuery(
                    `SELECT label FROM area_tags 
                     WHERE entity_type = 'profile' AND entity_id = ?
                     ORDER BY created_at`,
                    [user.id]
                );
                
                const disciplines = await allQuery(
                    `SELECT DISTINCT codigo FROM profile_disciplines
                     WHERE user_id = ?
                     ORDER BY ano DESC, semestre DESC
                     LIMIT 20`,
                    [user.id]
                );
                
                return {
                    ...user,
                    tags: tags.map(t => t.label),
                    disciplines: disciplines.map(d => d.codigo)
                };
            })
        );
        
        // Filtro por tags (client-side após buscar todos)
        if (filters.tags && filters.tags.length > 0) {
            usersWithData = usersWithData.filter(user => 
                filters.tags.some(filterTag => 
                    user.tags.some(userTag => 
                        userTag.toLowerCase().includes(filterTag.toLowerCase())
                    )
                )
            );
        }
        
        // Filtro por disciplina (client-side após buscar todos)
        if (filters.disciplina) {
            usersWithData = usersWithData.filter(user => 
                user.disciplines.some(d => 
                    d.toLowerCase().includes(filters.disciplina.toLowerCase())
                )
            );
        }
        
        return usersWithData;
    }
}

module.exports = new UsersModel();