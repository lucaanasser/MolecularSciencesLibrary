/**
 * Responsabilidade: montagem do perfil publico completo e regras relacionadas de ciclos/tags/follows.
 * Camada: service.
 * Entradas/Saidas: recebe userId; retorna perfil consolidado e dados derivados para controllers.
 * Dependencias criticas: models de publicProfiles, getQuery e logger padronizado.
 */

const publicProfilesModel = require('../../../../models/academic/publicProfiles/PublicProfilesModel');
const advancedCyclesModel = require('../../../../models/academic/publicProfiles/AdvancedCyclesModel');
const profileDisciplinesModel = require('../../../../models/academic/publicProfiles/ProfileDisciplinesModel');
const internationalExperiencesModel = require('../../../../models/academic/publicProfiles/InternationalExperiencesModel');
const postCMModel = require('../../../../models/academic/publicProfiles/PostCMModel');
const profileTagsModel = require('../../../../models/academic/publicProfiles/ProfileTagsModel');
const profileFollowsModel = require('../../../../models/academic/publicProfiles/ProfileFollowsModel');
const { getQuery } = require('../../../../database/db');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: monta o perfil publico completo com todos os dados relacionados.
     * Onde e usada: PublicProfilesController e demais fluxos de exportacao/sandbox.
     * Dependencias chamadas: getQuery, publicProfilesModel, getAdvancedCyclesWithTags, getPostCMWithAreas e models de dados relacionados.
     * Efeitos colaterais: pode criar o perfil publico caso ainda nao exista.
     * @param {Number} userId - User ID
     * @returns {Promise<Object>} - Complete profile object
     */
    async getCompleteProfile(userId) {
        log.start('Buscando perfil completo', { user_id: userId });

        // Get user basic info (nome, turma from users table)
        const user = await getQuery(
            `SELECT id, name, class, profile_image FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) {
            log.error('Usuario nao encontrado', { user_id: userId });
            throw new Error('Usuário não encontrado');
        }

        // Get or create public profile
        let profile = await publicProfilesModel.getByUserId(userId);
        if (!profile) {
            log.warn('Perfil publico nao existe, criando', { user_id: userId });
            profile = await publicProfilesModel.createProfile(userId);
        }

        log.start('Profile carregado do DB', { profile_id: profile.id });

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

        log.success('Perfil completo montado', { banner_choice: completeProfile.banner_choice });
        return completeProfile;
    },

    /**
     * O que faz: busca ciclos avancados do usuario e anexa as tags de cada ciclo.
     * Onde e usada: getCompleteProfile.
     * Dependencias chamadas: advancedCyclesModel.getByUserId e advancedCyclesModel.getTags.
     * Efeitos colaterais: leitura em DB.
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
    },

    /**
     * O que faz: busca entradas pos-CM e anexa as areas de cada entrada.
     * Onde e usada: getCompleteProfile.
     * Dependencias chamadas: postCMModel.getByUserId e postCMModel.getAreas.
     * Efeitos colaterais: leitura em DB.
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
    },

    /**
     * O que faz: valida se a escolha de banner e permitida.
     * Onde e usada: handlers de atualizacao de perfil.
     * Dependencias chamadas: nenhuma.
     * Efeitos colaterais: nenhum.
     * @param {String} bannerChoice - Banner choice
     * @returns {Boolean} - True if valid
     */
    validateBannerChoice(bannerChoice) {
        const validBanners = ['purple', 'blue', 'green', 'red', 'orange', 'yellow'];
        return validBanners.includes(bannerChoice);
    },

    /**
     * O que faz: valida o limite de tags de um ciclo (max 5: 2 area + 3 subarea).
     * Onde e usada: handlers de adicao de tags em ciclos avancados.
     * Dependencias chamadas: advancedCyclesModel.getTags.
     * Efeitos colaterais: leitura em DB.
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
    },

    /**
     * O que faz: retorna as estatisticas de follows do usuario.
     * Onde e usada: handlers de perfil publico.
     * Dependencias chamadas: profileFollowsModel.getCounts.
     * Efeitos colaterais: leitura em DB.
     * @param {Number} userId - User ID
     * @returns {Promise<Object>} - Follow counts
     */
    async getFollowStats(userId) {
        return await profileFollowsModel.getCounts(userId);
    }
};
