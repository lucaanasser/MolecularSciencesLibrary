const { executeQuery, getQuery, allQuery } = require('../../../database/db');
const { snakeToCamel } = require('../../../utils/caseConverter');

class PublicProfilesModel {
    /**
     * Create a new public profile for a user
     * @param {Number} userId - User ID
     * @returns {Promise<Object>} - Created profile
     */
    async createProfile(userId) {
        console.log(`🔵 [PublicProfilesModel] Criando perfil público para user: ${userId}`);
        
        const result = await executeQuery(
            `INSERT INTO public_profiles (user_id, banner_choice) VALUES (?, ?)`,
            [userId, 'purple']
        );

        console.log(`🟢 [PublicProfilesModel] Perfil criado com ID: ${result.lastID}`);
        const profile = await this.getByUserId(userId);
        return snakeToCamel(profile);
    }

    /**
     * Get public profile by user ID
     * @param {Number} userId - User ID
     * @returns {Promise<Object|null>} - Profile data or null
     */
    async getByUserId(userId) {
        console.log(`🔵 [PublicProfilesModel] Buscando perfil público de user: ${userId}`);
        
        const profile = await getQuery(
            `SELECT id, user_id, turma, curso_origem, area_interesse, bio, citacao, citacao_autor, 
                    email_publico, linkedin, lattes, github, site, banner_choice, 
                    created_at, updated_at 
             FROM public_profiles 
             WHERE user_id = ?`,
            [userId]
        );

        if (profile) {
            console.log(`🟢 [PublicProfilesModel] Perfil encontrado`);
            console.log(`🔍 [PublicProfilesModel] Profile raw do DB:`, JSON.stringify(profile, null, 2));
        } else {
            console.log(`🟡 [PublicProfilesModel] Perfil não encontrado`);
        }

        const converted = snakeToCamel(profile);
        console.log(`🔍 [PublicProfilesModel] Profile convertido:`, JSON.stringify(converted, null, 2));
        return converted;
    }

    /**
     * Update public profile
     * @param {Number} userId - User ID
     * @param {Object} data - Profile data to update
     * @returns {Promise<Object>} - Updated profile
     */
    async update(userId, data) {
        console.log(`🔵 [PublicProfilesModel] Atualizando perfil de user: ${userId}`);

        const {
            turma,
            curso_origem,
            area_interesse,
            bio,
            citacao,
            citacao_autor,
            email_publico,
            linkedin,
            lattes,
            github,
            site
        } = data;

        await executeQuery(
            `UPDATE public_profiles 
             SET turma = ?, 
                 curso_origem = ?, 
                 area_interesse = ?,
                 bio = ?,
                 citacao = ?,
                 citacao_autor = ?,
                 email_publico = ?,
                 linkedin = ?,
                 lattes = ?,
                 github = ?,
                 site = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [turma, curso_origem, area_interesse, bio, citacao, citacao_autor, 
             email_publico, linkedin, lattes, github, site, userId]
        );

        console.log(`🟢 [PublicProfilesModel] Perfil atualizado`);
        const profile = await this.getByUserId(userId);
        return snakeToCamel(profile);
    }

    /**
     * Update profile banner choice
     * @param {Number} userId - User ID
     * @param {String} bannerChoice - Banner choice (purple, blue, green, red, orange, yellow)
     * @returns {Promise<Object>} - Updated profile
     */
    async updateBanner(userId, bannerChoice) {
        console.log(`🔵 [PublicProfilesModel] Atualizando banner de user: ${userId} para: ${bannerChoice}`);

        const validBanners = ['purple', 'blue', 'green', 'red', 'orange', 'yellow'];
        if (!validBanners.includes(bannerChoice)) {
            console.error(`🔴 [PublicProfilesModel] Banner inválido: ${bannerChoice}`);
            throw new Error('Banner inválido. Escolha entre: purple, blue, green, red, orange, yellow');
        }

        await executeQuery(
            `UPDATE public_profiles 
             SET banner_choice = ?, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [bannerChoice, userId]
        );

        console.log(`🟢 [PublicProfilesModel] Banner atualizado`);
        const profile = await this.getByUserId(userId);
        return snakeToCamel(profile);
    }

    /**
     * Get all public profiles
     * @returns {Promise<Array>} - All profiles
     */
    async getAll() {
        console.log(`🔵 [PublicProfilesModel] Buscando todos os perfis públicos`);
        
        const profiles = await allQuery(
            `SELECT * FROM public_profiles ORDER BY created_at DESC`
        );

        console.log(`🟢 [PublicProfilesModel] ${profiles.length} perfis encontrados`);
        return snakeToCamel(profiles);
    }
}

module.exports = new PublicProfilesModel();
