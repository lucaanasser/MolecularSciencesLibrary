const { executeQuery, getQuery, allQuery } = require('../../../database/db');
const { snakeToCamel } = require('../../../utils/caseConverter');

class InternationalExperiencesModel {
    /**
     * Create a new international experience
     * @param {Number} userId - User ID
     * @param {Object} data - Experience data
     * @returns {Promise<Object>} - Created experience
     */
    async create(userId, data) {
        console.log(`🔵 [InternationalExperiencesModel] Criando experiência internacional para user: ${userId}`);

        const {
            tipo,
            pais,
            instituicao,
            programa,
            orientador,
            descricao,
            ano_inicio,
            ano_fim,
            duracao_numero,
            duracao_unidade,
            avancado_id
        } = data;

        const result = await executeQuery(
            `INSERT INTO international_experiences 
             (user_id, tipo, pais, instituicao, programa, orientador, descricao,
              ano_inicio, ano_fim, duracao_numero, duracao_unidade, avancado_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, tipo, pais, instituicao, programa, orientador, descricao,
             ano_inicio, ano_fim, duracao_numero, duracao_unidade, avancado_id]
        );

        console.log(`🟢 [InternationalExperiencesModel] Experiência criada com ID: ${result.lastID}`);
        const experience = await this.getById(result.lastID);
        return snakeToCamel(experience);
    }

    /**
     * Get experience by ID
     * @param {Number} expId - Experience ID
     * @returns {Promise<Object|null>} - Experience data or null
     */
    async getById(expId) {
        console.log(`🔵 [InternationalExperiencesModel] Buscando experiência: ${expId}`);
        
        const experience = await getQuery(
            `SELECT * FROM international_experiences WHERE id = ?`,
            [expId]
        );

        return snakeToCamel(experience);
    }

    /**
     * Get all experiences by user ID
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Experiences array
     */
    async getByUserId(userId) {
        console.log(`🔵 [InternationalExperiencesModel] Buscando experiências de user: ${userId}`);
        
        const experiences = await allQuery(
            `SELECT * FROM international_experiences 
             WHERE user_id = ? 
             ORDER BY ano_inicio DESC`,
            [userId]
        );

        console.log(`🟢 [InternationalExperiencesModel] ${experiences.length} experiências encontradas`);
        return snakeToCamel(experiences);
    }

    /**
     * Update experience
     * @param {Number} expId - Experience ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} - Updated experience
     */
    async update(expId, data) {
        console.log(`🔵 [InternationalExperiencesModel] Atualizando experiência: ${expId}`);

        const {
            tipo,
            pais,
            instituicao,
            programa,
            orientador,
            descricao,
            ano_inicio,
            ano_fim,
            duracao_numero,
            duracao_unidade,
            avancado_id
        } = data;

        await executeQuery(
            `UPDATE international_experiences 
             SET tipo = ?, pais = ?, instituicao = ?, programa = ?, orientador = ?,
                 descricao = ?, ano_inicio = ?, ano_fim = ?, duracao_numero = ?,
                 duracao_unidade = ?, avancado_id = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [tipo, pais, instituicao, programa, orientador, descricao,
             ano_inicio, ano_fim, duracao_numero, duracao_unidade, avancado_id, expId]
        );

        console.log(`🟢 [InternationalExperiencesModel] Experiência atualizada`);
        const experience = await this.getById(expId);
        return snakeToCamel(experience);
    }

    /**
     * Delete experience
     * @param {Number} expId - Experience ID
     * @returns {Promise<void>}
     */
    async delete(expId) {
        console.log(`🔵 [InternationalExperiencesModel] Deletando experiência: ${expId}`);
        
        await executeQuery(
            `DELETE FROM international_experiences WHERE id = ?`,
            [expId]
        );

        console.log(`🟢 [InternationalExperiencesModel] Experiência deletada`);
    }
}

module.exports = new InternationalExperiencesModel();
