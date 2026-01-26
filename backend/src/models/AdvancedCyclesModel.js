const { executeQuery, getQuery, allQuery } = require('../database/db');
const { snakeToCamel } = require('../utils/caseConverter');

class AdvancedCyclesModel {
    /**
     * Create a new advanced cycle
     * @param {Number} userId - User ID
     * @param {Object} data - Cycle data
     * @returns {Promise<Object>} - Created cycle
     */
    async create(userId, data) {
        console.log(`🔵 [AdvancedCyclesModel] Criando ciclo avançado para user: ${userId}`);

        const {
            tema,
            orientador,
            coorientadores,
            instituto,
            universidade,
            semestres = 4,
            ano_inicio,
            ano_conclusao,
            descricao,
            color = '#14b8a6'
        } = data;

        // Convert coorientadores array to JSON string
        const coorientadoresJson = coorientadores ? JSON.stringify(coorientadores) : null;

        const result = await executeQuery(
            `INSERT INTO advanced_cycles 
             (user_id, tema, orientador, coorientadores, instituto, universidade, 
              semestres, ano_inicio, ano_conclusao, descricao, color)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, tema, orientador, coorientadoresJson, instituto, universidade,
             semestres, ano_inicio, ano_conclusao, descricao, color]
        );

        console.log(`🟢 [AdvancedCyclesModel] Ciclo criado com ID: ${result.lastID}`);
        const cycle = await this.getById(result.lastID);
        return snakeToCamel(cycle);
    }

    /**
     * Get cycle by ID
     * @param {Number} cycleId - Cycle ID
     * @returns {Promise<Object|null>} - Cycle data or null
     */
    async getById(cycleId) {
        console.log(`🔵 [AdvancedCyclesModel] Buscando ciclo: ${cycleId}`);
        
        const cycle = await getQuery(
            `SELECT * FROM advanced_cycles WHERE id = ?`,
            [cycleId]
        );

        if (cycle && cycle.coorientadores) {
            cycle.coorientadores = JSON.parse(cycle.coorientadores);
        }

        return snakeToCamel(cycle);
    }

    /**
     * Get all cycles by user ID
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Cycles array
     */
    async getByUserId(userId) {
        console.log(`🔵 [AdvancedCyclesModel] Buscando ciclos de user: ${userId}`);
        
        const cycles = await allQuery(
            `SELECT * FROM advanced_cycles WHERE user_id = ? ORDER BY ano_inicio DESC`,
            [userId]
        );

        // Parse coorientadores JSON
        cycles.forEach(cycle => {
            if (cycle.coorientadores) {
                cycle.coorientadores = JSON.parse(cycle.coorientadores);
            }
        });

        console.log(`🟢 [AdvancedCyclesModel] ${cycles.length} ciclos encontrados`);
        return snakeToCamel(cycles);
    }

    /**
     * Update cycle
     * @param {Number} cycleId - Cycle ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} - Updated cycle
     */
    async update(cycleId, data) {
        console.log(`🔵 [AdvancedCyclesModel] Atualizando ciclo: ${cycleId}`);

        const {
            tema,
            orientador,
            coorientadores,
            instituto,
            universidade,
            semestres,
            ano_inicio,
            ano_conclusao,
            descricao,
            color
        } = data;

        const coorientadoresJson = coorientadores ? JSON.stringify(coorientadores) : null;

        await executeQuery(
            `UPDATE advanced_cycles 
             SET tema = ?, orientador = ?, coorientadores = ?, instituto = ?, 
                 universidade = ?, semestres = ?, ano_inicio = ?, ano_conclusao = ?,
                 descricao = ?, color = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [tema, orientador, coorientadoresJson, instituto, universidade, semestres,
             ano_inicio, ano_conclusao, descricao, color, cycleId]
        );

        console.log(`🟢 [AdvancedCyclesModel] Ciclo atualizado`);
        const cycle = await this.getById(cycleId);
        return snakeToCamel(cycle);
    }

    /**
     * Delete cycle
     * @param {Number} cycleId - Cycle ID
     * @returns {Promise<void>}
     */
    async delete(cycleId) {
        console.log(`🔵 [AdvancedCyclesModel] Deletando ciclo: ${cycleId}`);
        
        await executeQuery(
            `DELETE FROM advanced_cycles WHERE id = ?`,
            [cycleId]
        );

        console.log(`🟢 [AdvancedCyclesModel] Ciclo deletado`);
    }

    /**
     * Add tag to cycle
     * @param {Number} cycleId - Cycle ID
     * @param {String} label - Tag label
     * @param {String} category - Tag category (area or subarea)
     * @returns {Promise<Object>} - Created tag
     */
    async addTag(cycleId, label, category) {
        console.log(`🔵 [AdvancedCyclesModel] Adicionando tag ao ciclo: ${cycleId}`);

        // Check current tag count and category distribution
        const tags = await this.getTags(cycleId);
        const areaTags = tags.filter(t => t.category === 'area');
        const subareaTags = tags.filter(t => t.category === 'subarea');

        if (tags.length >= 5) {
            console.error(`🔴 [AdvancedCyclesModel] Limite de 5 tags atingido`);
            throw new Error('Limite máximo de 5 tags por ciclo');
        }

        if (category === 'area' && areaTags.length >= 2) {
            console.error(`🔴 [AdvancedCyclesModel] Limite de 2 tags de área atingido`);
            throw new Error('Limite máximo de 2 tags de área');
        }

        if (category === 'subarea' && subareaTags.length >= 3) {
            console.error(`🔴 [AdvancedCyclesModel] Limite de 3 tags de subárea atingido`);
            throw new Error('Limite máximo de 3 tags de subárea');
        }

        const result = await executeQuery(
            `INSERT INTO advanced_cycle_tags (cycle_id, label, category) VALUES (?, ?, ?)`,
            [cycleId, label, category]
        );

        console.log(`🟢 [AdvancedCyclesModel] Tag adicionada`);
        return { id: result.lastID, cycle_id: cycleId, label, category };
    }

    /**
     * Remove tag from cycle
     * @param {Number} tagId - Tag ID
     * @returns {Promise<void>}
     */
    async removeTag(tagId) {
        console.log(`🔵 [AdvancedCyclesModel] Removendo tag: ${tagId}`);
        
        await executeQuery(
            `DELETE FROM advanced_cycle_tags WHERE id = ?`,
            [tagId]
        );

        console.log(`🟢 [AdvancedCyclesModel] Tag removida`);
    }

    /**
     * Get all tags for a cycle
     * @param {Number} cycleId - Cycle ID
     * @returns {Promise<Array>} - Tags array
     */
    async getTags(cycleId) {
        console.log(`🔵 [AdvancedCyclesModel] Buscando tags do ciclo: ${cycleId}`);
        
        const tags = await allQuery(
            `SELECT * FROM advanced_cycle_tags WHERE cycle_id = ?`,
            [cycleId]
        );

        return tags;
    }
}

module.exports = new AdvancedCyclesModel();
