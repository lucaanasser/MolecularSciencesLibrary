const { executeQuery, getQuery, allQuery } = require('../../../database/db');
const { snakeToCamel } = require('../../../utils/caseConverter');

class AreaTagsModel {
    /**
     * Add tag to an entity (profile, advanced_cycle, or post_cm)
     * @param {String} entityType - 'profile', 'advanced_cycle', or 'post_cm'
     * @param {Number} entityId - ID of the entity
     * @param {String} label - Tag label
     * @param {String} category - 'grande-area', 'area', or 'subarea'
     * @returns {Promise<Object>} - Created tag
     */
    async addTag(entityType, entityId, label, category) {
        console.log(`🔵 [AreaTagsModel] Adicionando tag ${category} "${label}" para ${entityType}:${entityId}`);
        
        // Validações
        const validEntityTypes = ['profile', 'advanced_cycle', 'post_cm'];
        if (!validEntityTypes.includes(entityType)) {
            throw new Error(`Tipo de entidade inválido: ${entityType}`);
        }

        const validCategories = ['grande-area', 'area', 'subarea', 'custom'];
        if (!validCategories.includes(category)) {
            throw new Error(`Categoria inválida: ${category}`);
        }

        // Verificar limites conforme o tipo de entidade
        const existingTags = await this.getByEntity(entityType, entityId);
        
        if (entityType === 'advanced_cycle') {
            // Ciclos avançados: max 5 tags (2 área + 3 subárea)
            const areaTags = existingTags.filter(t => t.category === 'area');
            const subareaTags = existingTags.filter(t => t.category === 'subarea');
            
            if (existingTags.length >= 5) {
                throw new Error('Limite máximo de 5 tags por ciclo avançado');
            }
            if (category === 'area' && areaTags.length >= 2) {
                throw new Error('Limite máximo de 2 tags de área');
            }
            if (category === 'subarea' && subareaTags.length >= 3) {
                throw new Error('Limite máximo de 3 tags de subárea');
            }
        }

        // Verificar se já existe
        const existing = await getQuery(
            `SELECT * FROM area_tags 
             WHERE entity_type = ? AND entity_id = ? AND label = ? AND category = ?`,
            [entityType, entityId, label, category]
        );

        if (existing) {
            console.log('🟡 [AreaTagsModel] Tag já existe');
            return snakeToCamel(existing);
        }

        // Inserir nova tag
        const result = await executeQuery(
            `INSERT INTO area_tags (entity_type, entity_id, label, category) 
             VALUES (?, ?, ?, ?)`,
            [entityType, entityId, label, category]
        );

        console.log(`🟢 [AreaTagsModel] Tag adicionada com ID: ${result.lastID}`);
        const tag = await this.getById(result.lastID);
        return snakeToCamel(tag);
    }

    /**
     * Get tag by ID
     * @param {Number} tagId - Tag ID
     * @returns {Promise<Object|null>} - Tag data or null
     */
    async getById(tagId) {
        const tag = await getQuery(
            `SELECT * FROM area_tags WHERE id = ?`,
            [tagId]
        );
        return tag ? snakeToCamel(tag) : null;
    }

    /**
     * Get all tags for an entity
     * @param {String} entityType - 'profile', 'advanced_cycle', or 'post_cm'
     * @param {Number} entityId - Entity ID
     * @returns {Promise<Array>} - Tags array
     */
    async getByEntity(entityType, entityId) {
        const tags = await allQuery(
            `SELECT * FROM area_tags 
             WHERE entity_type = ? AND entity_id = ? 
             ORDER BY created_at ASC`,
            [entityType, entityId]
        );
        return snakeToCamel(tags);
    }

    /**
     * Get tags by entity and category
     * @param {String} entityType - 'profile', 'advanced_cycle', or 'post_cm'
     * @param {Number} entityId - Entity ID
     * @param {String} category - Tag category
     * @returns {Promise<Array>} - Tags array
     */
    async getByCategory(entityType, entityId, category) {
        const tags = await allQuery(
            `SELECT * FROM area_tags 
             WHERE entity_type = ? AND entity_id = ? AND category = ? 
             ORDER BY created_at ASC`,
            [entityType, entityId, category]
        );
        return snakeToCamel(tags);
    }

    /**
     * Remove tag
     * @param {Number} tagId - Tag ID
     * @returns {Promise<void>}
     */
    async removeTag(tagId) {
        console.log(`🔵 [AreaTagsModel] Removendo tag: ${tagId}`);
        
        await executeQuery(
            `DELETE FROM area_tags WHERE id = ?`,
            [tagId]
        );

        console.log(`🟢 [AreaTagsModel] Tag removida`);
    }

    /**
     * Remove all tags from an entity
     * @param {String} entityType - 'profile', 'advanced_cycle', or 'post_cm'
     * @param {Number} entityId - Entity ID
     * @returns {Promise<void>}
     */
    async removeAllFromEntity(entityType, entityId) {
        console.log(`🔵 [AreaTagsModel] Removendo todas as tags de ${entityType}:${entityId}`);
        
        await executeQuery(
            `DELETE FROM area_tags WHERE entity_type = ? AND entity_id = ?`,
            [entityType, entityId]
        );

        console.log(`🟢 [AreaTagsModel] Tags removidas`);
    }

    /**
     * Get all unique tags by category (for suggestions)
     * @param {String} category - Tag category
     * @returns {Promise<Array>} - Unique labels
     */
    async getUniqueByCategory(category) {
        const tags = await allQuery(
            `SELECT DISTINCT label FROM area_tags 
             WHERE category = ? 
             ORDER BY label ASC`,
            [category]
        );
        return tags.map(t => t.label);
    }

    /**
     * Count tags for an entity
     * @param {String} entityType - 'profile', 'advanced_cycle', or 'post_cm'
     * @param {Number} entityId - Entity ID
     * @returns {Promise<Number>} - Tag count
     */
    async countByEntity(entityType, entityId) {
        const result = await getQuery(
            `SELECT COUNT(*) as count FROM area_tags 
             WHERE entity_type = ? AND entity_id = ?`,
            [entityType, entityId]
        );
        return result ? result.count : 0;
    }
}

module.exports = new AreaTagsModel();
