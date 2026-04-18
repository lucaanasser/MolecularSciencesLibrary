const publicProfilesModel = require('../../models/academic/publicProfiles/PublicProfilesModel');
const advancedCyclesModel = require('../../models/academic/publicProfiles/AdvancedCyclesModel');
const profileDisciplinesModel = require('../../models/academic/publicProfiles/ProfileDisciplinesModel');
const internationalExperiencesModel = require('../../models/academic/publicProfiles/InternationalExperiencesModel');
const postCMModel = require('../../models/academic/publicProfiles/PostCMModel');
const profileTagsModel = require('../../models/academic/publicProfiles/ProfileTagsModel');
const profileFollowsModel = require('../../models/academic/publicProfiles/ProfileFollowsModel');
const { getQuery } = require('../../database/db');
const { ProfileTransformer } = require('./ProfileTransformer');

class PublicProfilesService {
    constructor() {
        this.profileTransformer = new ProfileTransformer();
    }

    /**
     * Get complete public profile with all related data
     * @param {Number} userId - User ID
     * @returns {Promise<Object>} - Complete profile object
     */
    async getCompleteProfile(userId) {
        console.log(`🔵 [PublicProfilesService] Buscando perfil completo de user: ${userId}`);

        // Get user basic info (nome, turma from users table)
        const user = await getQuery(
            `SELECT id, name, class, profile_image FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) {
            console.error(`🔴 [PublicProfilesService] Usuário não encontrado: ${userId}`);
            throw new Error('Usuário não encontrado');
        }

        // Get or create public profile
        let profile = await publicProfilesModel.getByUserId(userId);
        if (!profile) {
            console.log(`🟡 [PublicProfilesService] Perfil público não existe, criando...`);
            profile = await publicProfilesModel.createProfile(userId);
        }
        
        console.log(`🔍 [PublicProfilesService] Profile do DB:`, JSON.stringify(profile, null, 2));

        // Get all related data in parallel
        const [
            ciclosAvancados,
            disciplinas,
            experienciasInternacionais,
            posCM,
            tags,
            seguindo
        ] = await Promise.all([
            this.getAdvancedCyclesWithTags(userId),
            profileDisciplinesModel.getByUserId(userId),
            internationalExperiencesModel.getByUserId(userId),
            this.getPostCMWithAreas(userId),
            profileTagsModel.getByUserId(userId),
            profileFollowsModel.getFollowing(userId)
        ]);

        // Build complete profile object
        const completeProfile = {
            id: profile.id,
            userId: user.id,
            nome: user.name,
            turma: user.class,
            profileImage: user.profile_image,
            
            // Stats
            curso_origem: profile.curso_origem,
            area_interesse: profile.area_interesse,
            
            // Bio and quote
            bio: profile.bio,
            citacao: profile.citacao,
            citacao_autor: profile.citacao_autor,
            
            // Contact info
            email_publico: profile.email_publico,
            linkedin: profile.linkedin,
            lattes: profile.lattes,
            github: profile.github,
            site: profile.site,
            
            // Banner
            banner_choice: profile.banner_choice || profile.bannerChoice || 'purple',
            
            // Related data
            advanced_cycles: ciclosAvancados,
            disciplines: disciplinas,
            international_experiences: experienciasInternacionais,
            post_cm: posCM,
            tags,
            seguindo,
            
            // Timestamps
            created_at: profile.created_at,
            updated_at: profile.updated_at
        };

        console.log(`� [PublicProfilesService] Complete profile banner_choice:`, completeProfile.banner_choice);
        console.log(`�🟢 [PublicProfilesService] Perfil completo montado`);
        return completeProfile;
    }

    /**
     * Get advanced cycles with their tags
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Cycles with tags
     */
    async getAdvancedCyclesWithTags(userId) {
        const cycles = await advancedCyclesModel.getByUserId(userId);
        
        // Get tags for each cycle
        for (let cycle of cycles) {
            cycle.tags = await advancedCyclesModel.getTags(cycle.id);
        }
        
        return cycles;
    }

    /**
     * Get post-CM entries with their areas
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Post-CM entries with areas
     */
    async getPostCMWithAreas(userId) {
        const entries = await postCMModel.getByUserId(userId);
        
        // Get areas for each entry
        for (let entry of entries) {
            const areas = await postCMModel.getAreas(entry.id);
            entry.areas = areas.map(a => ({ id: a.id, label: a.label }));
        }
        
        return entries;
    }

    /**
     * Validate banner choice
     * @param {String} bannerChoice - Banner choice
     * @returns {Boolean} - True if valid
     */
    validateBannerChoice(bannerChoice) {
        const validBanners = ['purple', 'blue', 'green', 'red', 'orange', 'yellow'];
        return validBanners.includes(bannerChoice);
    }

    /**
     * Validate cycle tags limit (max 5: 2 area + 3 subarea)
     * @param {Number} cycleId - Cycle ID
     * @param {String} category - Tag category to add
     * @returns {Promise<Boolean>} - True if can add more tags
     */
    async canAddCycleTag(cycleId, category) {
        const tags = await advancedCyclesModel.getTags(cycleId);
        const areaTags = tags.filter(t => t.category === 'area');
        const subareaTags = tags.filter(t => t.category === 'subarea');

        if (tags.length >= 5) {
            return { canAdd: false, reason: 'Limite máximo de 5 tags por ciclo' };
        }

        if (category === 'area' && areaTags.length >= 2) {
            return { canAdd: false, reason: 'Limite máximo de 2 tags de área' };
        }

        if (category === 'subarea' && subareaTags.length >= 3) {
            return { canAdd: false, reason: 'Limite máximo de 3 tags de subárea' };
        }

        return { canAdd: true };
    }

    /**
     * Get user's follow statistics
     * @param {Number} userId - User ID
     * @returns {Promise<Object>} - Follow counts
     */
    async getFollowStats(userId) {
        return await profileFollowsModel.getCounts(userId);
    }

    /**
     * O que faz: prepara payload de perfil no schema esperado pelo site publico.
     * Camada: Service.
     * Entradas/Saidas: userId -> cmSchemaPayload.
     * Dependencias criticas: getCompleteProfile e ProfileTransformer.
     * Efeitos colaterais: nenhum.
     * @param {Number} userId ID do usuario
     * @returns {Promise<Object>} payload pronto para publicacao
     */
    async exportProfileToCMSchema(userId, selectedRosterName) {
        console.log(`🔵 [PublicProfilesService.exportProfileToCMSchema] Exportando perfil para schema CM: ${userId}`);
        const completeProfile = await this.getCompleteProfile(userId);
        const payload = this.profileTransformer.toCMSchema(completeProfile, { selectedRosterName });
        console.log(`🟢 [PublicProfilesService.exportProfileToCMSchema] Payload pronto para publicação`);
        return payload;
    }

    /**
     * Retorna nomes oficiais da roster da turma do usuario para selecao no frontend.
     * @param {Number} userId ID do usuario
     * @returns {Promise<{turma: string, students: string[]}>}
     */
    async getSandboxRosterOptions(userId) {
        const completeProfile = await this.getCompleteProfile(userId);
        const turma = String(completeProfile.turma || '').trim();
        const students = this.profileTransformer.loadRosterByClassYear(turma);

        return {
            turma,
            students
        };
    }
}

module.exports = new PublicProfilesService();
