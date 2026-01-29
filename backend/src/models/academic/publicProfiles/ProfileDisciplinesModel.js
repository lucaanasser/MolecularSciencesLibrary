const { executeQuery, getQuery, allQuery } = require('../../../database/db');
const { snakeToCamel } = require('../../../utils/caseConverter');

class ProfileDisciplinesModel {
    /**
     * Create a new discipline
     * @param {Number} userId - User ID
     * @param {Object} data - Discipline data
     * @returns {Promise<Object>} - Created discipline
     */
    async create(userId, data) {
        console.log(`🔵 [ProfileDisciplinesModel] Criando disciplina para user: ${userId}`);

        const {
            codigo,
            nome,
            professor,
            ano,
            semestre,
            nota,
            avancado_id
        } = data;

        const result = await executeQuery(
            `INSERT INTO profile_disciplines 
             (user_id, codigo, nome, professor, ano, semestre, nota, avancado_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, codigo, nome, professor, ano, semestre, nota, avancado_id]
        );

        console.log(`🟢 [ProfileDisciplinesModel] Disciplina criada com ID: ${result.lastID}`);
        const discipline = await this.getById(result.lastID);
        return snakeToCamel(discipline);
    }

    /**
     * Get discipline by ID
     * @param {Number} discId - Discipline ID
     * @returns {Promise<Object|null>} - Discipline data or null
     */
    async getById(discId) {
        console.log(`🔵 [ProfileDisciplinesModel] Buscando disciplina: ${discId}`);
        
        const discipline = await getQuery(
            `SELECT * FROM profile_disciplines WHERE id = ?`,
            [discId]
        );

        return snakeToCamel(discipline);
    }

    /**
     * Get all disciplines by user ID
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Disciplines array
     */
    async getByUserId(userId) {
        console.log(`🔵 [ProfileDisciplinesModel] Buscando disciplinas de user: ${userId}`);
        
        const disciplines = await allQuery(
            `SELECT * FROM profile_disciplines 
             WHERE user_id = ? 
             ORDER BY ano DESC, semestre DESC`,
            [userId]
        );

        console.log(`🟢 [ProfileDisciplinesModel] ${disciplines.length} disciplinas encontradas`);
        return snakeToCamel(disciplines);
    }

    /**
     * Update discipline
     * @param {Number} discId - Discipline ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} - Updated discipline
     */
    async update(discId, data) {
        console.log(`🔵 [ProfileDisciplinesModel] Atualizando disciplina: ${discId}`);

        const {
            codigo,
            nome,
            professor,
            ano,
            semestre,
            nota,
            avancado_id
        } = data;

        await executeQuery(
            `UPDATE profile_disciplines 
             SET codigo = ?, nome = ?, professor = ?, ano = ?, 
                 semestre = ?, nota = ?, avancado_id = ?
             WHERE id = ?`,
            [codigo, nome, professor, ano, semestre, nota, avancado_id, discId]
        );

        console.log(`🟢 [ProfileDisciplinesModel] Disciplina atualizada`);
        const discipline = await this.getById(discId);
        return snakeToCamel(discipline);
    }

    /**
     * Delete discipline
     * @param {Number} discId - Discipline ID
     * @returns {Promise<void>}
     */
    async delete(discId) {
        console.log(`🔵 [ProfileDisciplinesModel] Deletando disciplina: ${discId}`);
        
        await executeQuery(
            `DELETE FROM profile_disciplines WHERE id = ?`,
            [discId]
        );

        console.log(`🟢 [ProfileDisciplinesModel] Disciplina deletada`);
    }

    /**
     * Get disciplines by advanced cycle ID
     * @param {Number} avancadoId - Advanced cycle ID
     * @returns {Promise<Array>} - Disciplines array
     */
    async getByAvancadoId(avancadoId) {
        console.log(`🔵 [ProfileDisciplinesModel] Buscando disciplinas do ciclo: ${avancadoId}`);
        
        const disciplines = await allQuery(
            `SELECT * FROM profile_disciplines 
             WHERE avancado_id = ? 
             ORDER BY ano DESC, semestre DESC`,
            [avancadoId]
        );

        console.log(`🟢 [ProfileDisciplinesModel] ${disciplines.length} disciplinas encontradas`);
        return snakeToCamel(disciplines);
    }
}

module.exports = new ProfileDisciplinesModel();
