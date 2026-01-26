const { executeQuery, getQuery, allQuery } = require('../database/db');
const { snakeToCamel } = require('../utils/caseConverter');

class ProfileTagsModel {
    /**
     * Add tag to profile
     * @param {Number} userId - User ID
     * @param {String} label - Tag label
     * @param {String} category - Tag category (grande-area, area, subarea, custom)
     * @returns {Promise<Object>} - Created tag
     */
    async add(userId, label, category) {
        console.log(`🔵 [ProfileTagsModel] Adicionando tag ao perfil de user: ${userId}`);

        const result = await executeQuery(
            `INSERT INTO profile_tags (user_id, label, category) VALUES (?, ?, ?)`,
            [userId, label, category]
        );

        console.log(`🟢 [ProfileTagsModel] Tag adicionada com ID: ${result.lastID}`);
        return snakeToCamel({ id: result.lastID, user_id: userId, label, category });
    }

    /**
     * Remove tag from profile
     * @param {Number} tagId - Tag ID
     * @returns {Promise<void>}
     */
    async remove(tagId) {
        console.log(`🔵 [ProfileTagsModel] Removendo tag: ${tagId}`);
        
        await executeQuery(
            `DELETE FROM profile_tags WHERE id = ?`,
            [tagId]
        );

        console.log(`🟢 [ProfileTagsModel] Tag removida`);
    }

    /**
     * Get all tags by user ID
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Tags array
     */
    async getByUserId(userId) {
        console.log(`🔵 [ProfileTagsModel] Buscando tags de user: ${userId}`);
        
        const tags = await allQuery(
            `SELECT * FROM profile_tags WHERE user_id = ? ORDER BY created_at ASC`,
            [userId]
        );

        console.log(`🟢 [ProfileTagsModel] ${tags.length} tags encontradas`);
        return tags;
    }

    /**
     * Get tags by user ID and category
     * @param {Number} userId - User ID
     * @param {String} category - Tag category
     * @returns {Promise<Array>} - Tags array
     */
    async getByUserIdAndCategory(userId, category) {
        console.log(`🔵 [ProfileTagsModel] Buscando tags (${category}) de user: ${userId}`);
        
        const tags = await allQuery(
            `SELECT * FROM profile_tags WHERE user_id = ? AND category = ? ORDER BY created_at ASC`,
            [userId, category]
        );

        console.log(`🟢 [ProfileTagsModel] ${tags.length} tags encontradas`);
        return snakeToCamel(tags);
    }

    /**
     * Check if tag exists for user
     * @param {Number} userId - User ID
     * @param {String} label - Tag label
     * @param {String} category - Tag category
     * @returns {Promise<Boolean>} - True if exists
     */
    async exists(userId, label, category) {
        console.log(`🔵 [ProfileTagsModel] Verificando existência de tag`);
        
        const tag = await getQuery(
            `SELECT * FROM profile_tags WHERE user_id = ? AND label = ? AND category = ?`,
            [userId, label, category]
        );

        return !!tag;
    }
}

module.exports = new ProfileTagsModel();
