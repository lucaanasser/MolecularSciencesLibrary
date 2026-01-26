const { executeQuery, getQuery, allQuery } = require('../database/db');
const { snakeToCamel } = require('../utils/caseConverter');

class PostCMModel {
    /**
     * Create a new post-CM entry
     * @param {Number} userId - User ID
     * @param {Object} data - Post-CM data
     * @returns {Promise<Object>} - Created entry
     */
    async create(userId, data) {
        console.log(`🔵 [PostCMModel] Criando entrada pós-CM para user: ${userId}`);

        const {
            tipo,
            instituicao,
            cargo,
            orientador,
            descricao,
            ano_inicio,
            ano_fim,
            github
        } = data;

        const result = await executeQuery(
            `INSERT INTO post_cm_info 
             (user_id, tipo, instituicao, cargo, orientador, descricao,
              ano_inicio, ano_fim, github)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, tipo, instituicao, cargo, orientador, descricao,
             ano_inicio, ano_fim, github]
        );

        console.log(`🟢 [PostCMModel] Entrada pós-CM criada com ID: ${result.lastID}`);
        const entry = await this.getById(result.lastID);
        return snakeToCamel(entry);
    }

    /**
     * Get post-CM entry by ID
     * @param {Number} postId - Post-CM ID
     * @returns {Promise<Object|null>} - Entry data or null
     */
    async getById(postId) {
        console.log(`🔵 [PostCMModel] Buscando entrada pós-CM: ${postId}`);
        
        const entry = await getQuery(
            `SELECT * FROM post_cm_info WHERE id = ?`,
            [postId]
        );

        return snakeToCamel(entry);
    }

    /**
     * Get all post-CM entries by user ID
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Entries array
     */
    async getByUserId(userId) {
        console.log(`🔵 [PostCMModel] Buscando entradas pós-CM de user: ${userId}`);
        
        const entries = await allQuery(
            `SELECT * FROM post_cm_info 
             WHERE user_id = ? 
             ORDER BY ano_inicio DESC`,
            [userId]
        );

        console.log(`🟢 [PostCMModel] ${entries.length} entradas encontradas`);
        return snakeToCamel(entries);
    }

    /**
     * Update post-CM entry
     * @param {Number} postId - Post-CM ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} - Updated entry
     */
    async update(postId, data) {
        console.log(`🔵 [PostCMModel] Atualizando entrada pós-CM: ${postId}`);

        const {
            tipo,
            instituicao,
            cargo,
            orientador,
            descricao,
            ano_inicio,
            ano_fim,
            github
        } = data;

        await executeQuery(
            `UPDATE post_cm_info 
             SET tipo = ?, instituicao = ?, cargo = ?, orientador = ?,
                 descricao = ?, ano_inicio = ?, ano_fim = ?, github = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [tipo, instituicao, cargo, orientador, descricao,
             ano_inicio, ano_fim, github, postId]
        );

        console.log(`🟢 [PostCMModel] Entrada pós-CM atualizada`);
        const entry = await this.getById(postId);
        return snakeToCamel(entry);
    }

    /**
     * Delete post-CM entry
     * @param {Number} postId - Post-CM ID
     * @returns {Promise<void>}
     */
    async delete(postId) {
        console.log(`🔵 [PostCMModel] Deletando entrada pós-CM: ${postId}`);
        
        await executeQuery(
            `DELETE FROM post_cm_info WHERE id = ?`,
            [postId]
        );

        console.log(`🟢 [PostCMModel] Entrada pós-CM deletada`);
    }

    /**
     * Add area to post-CM entry
     * @param {Number} postId - Post-CM ID
     * @param {String} label - Area label
     * @returns {Promise<Object>} - Created area
     */
    async addArea(postId, label) {
        console.log(`🔵 [PostCMModel] Adicionando área ao pós-CM: ${postId}`);

        const result = await executeQuery(
            `INSERT INTO post_cm_areas (post_cm_id, label) VALUES (?, ?)`,
            [postId, label]
        );

        console.log(`🟢 [PostCMModel] Área adicionada`);
        return snakeToCamel({ id: result.lastID, post_cm_id: postId, label });
    }

    /**
     * Remove area from post-CM entry
     * @param {Number} areaId - Area ID
     * @returns {Promise<void>}
     */
    async removeArea(areaId) {
        console.log(`🔵 [PostCMModel] Removendo área: ${areaId}`);
        
        await executeQuery(
            `DELETE FROM post_cm_areas WHERE id = ?`,
            [areaId]
        );

        console.log(`🟢 [PostCMModel] Área removida`);
    }

    /**
     * Get all areas for a post-CM entry
     * @param {Number} postId - Post-CM ID
     * @returns {Promise<Array>} - Areas array
     */
    async getAreas(postId) {
        console.log(`🔵 [PostCMModel] Buscando áreas do pós-CM: ${postId}`);
        
        const areas = await allQuery(
            `SELECT * FROM post_cm_areas WHERE post_cm_id = ?`,
            [postId]
        );

        return snakeToCamel(areas);
    }
}

module.exports = new PostCMModel();
