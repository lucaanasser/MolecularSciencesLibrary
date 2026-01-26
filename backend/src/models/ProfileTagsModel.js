const areaTagsModel = require('./AreaTagsModel');

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
        return await areaTagsModel.addTag('profile', userId, label, category);
    }

    /**
     * Remove tag from profile
     * @param {Number} tagId - Tag ID
     * @returns {Promise<void>}
     */
    async remove(tagId) {
        console.log(`🔵 [ProfileTagsModel] Removendo tag: ${tagId}`);
        return await areaTagsModel.removeTag(tagId);
    }

    /**
     * Get all tags by user ID
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Tags array
     */
    async getByUserId(userId) {
        console.log(`🔵 [ProfileTagsModel] Buscando tags de user: ${userId}`);
        const tags = await areaTagsModel.getByEntity('profile', userId);
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
        return await areaTagsModel.getByCategory('profile', userId, category);
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
        
        const tags = await this.getByUserIdAndCategory(userId, category);
        return tags.some(t => t.label === label);
    }
}

module.exports = new ProfileTagsModel();
