const publicProfilesService = require('../services/PublicProfilesService');
const publicProfilesModel = require('../models/PublicProfilesModel');
const advancedCyclesModel = require('../models/AdvancedCyclesModel');
const profileDisciplinesModel = require('../models/ProfileDisciplinesModel');
const internationalExperiencesModel = require('../models/InternationalExperiencesModel');
const postCMModel = require('../models/PostCMModel');
const profileTagsModel = require('../models/ProfileTagsModel');
const profileFollowsModel = require('../models/ProfileFollowsModel');
const { uploadImage, deleteImage } = require('../utils/imageUpload');
const usersModel = require('../models/UsersModel');

class PublicProfilesController {
    // ==================== PROFILE MAIN ====================

    /**
     * Get complete public profile (PUBLIC - no auth required)
     */
    async getProfile(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.getProfile] Buscando perfil: ${userId}`);

            const profile = await publicProfilesService.getCompleteProfile(userId);

            console.log(`🟢 [PublicProfilesController.getProfile] Perfil retornado`);
            res.status(200).json(profile);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.getProfile] Erro:`, error.message);
            res.status(404).json({ error: error.message });
        }
    }

    /**
     * Update main profile info (stats, bio, citação, contatos)
     */
    async updateProfile(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.updateProfile] Atualizando perfil: ${userId}`);

            const updatedProfile = await publicProfilesModel.update(userId, req.body);

            console.log(`🟢 [PublicProfilesController.updateProfile] Perfil atualizado`);
            res.status(200).json(updatedProfile);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.updateProfile] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Update profile banner choice
     */
    async updateBanner(req, res) {
        try {
            const { userId } = req.params;
            const { bannerChoice } = req.body;
            console.log(`🔵 [PublicProfilesController.updateBanner] Atualizando banner: ${userId} -> ${bannerChoice}`);

            if (!publicProfilesService.validateBannerChoice(bannerChoice)) {
                console.error(`🔴 [PublicProfilesController.updateBanner] Banner inválido`);
                return res.status(400).json({ 
                    error: 'Banner inválido. Escolha entre: purple, blue, green, red, orange, yellow' 
                });
            }

            const updatedProfile = await publicProfilesModel.updateBanner(userId, bannerChoice);

            console.log(`🟢 [PublicProfilesController.updateBanner] Banner atualizado`);
            res.status(200).json(updatedProfile);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.updateBanner] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Upload profile avatar/image
     */
    async uploadAvatar(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.uploadAvatar] Upload de avatar para user: ${userId}`);

            if (!req.file) {
                console.error(`🔴 [PublicProfilesController.uploadAvatar] Nenhum arquivo enviado`);
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            console.log(`🔵 [PublicProfilesController.uploadAvatar] Arquivo recebido:`, {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.buffer.length,
                hasBuffer: !!req.file.buffer
            });

            // Get current user to delete old avatar if exists
            const user = await usersModel.getUserById(userId);
            const oldAvatar = user.profile_image;

            // Upload new avatar
            const imagePath = uploadImage(req.file.buffer, req.file.originalname, 'user-images', 5);
            console.log(`🟢 [PublicProfilesController.uploadAvatar] Imagem salva em: ${imagePath}`);

            // Delete old avatar BEFORE updating if it's a custom uploaded image
            if (oldAvatar && oldAvatar.includes('/images/user-images/')) {
                console.log(`🗑️  [PublicProfilesController.uploadAvatar] Deletando imagem antiga: ${oldAvatar}`);
                deleteImage(oldAvatar);
            }

            // Update user avatar in users table
            await usersModel.updateUserProfileImage(userId, imagePath);

            console.log(`🟢 [PublicProfilesController.uploadAvatar] Avatar atualizado: ${imagePath}`);
            res.status(200).json({ profile_image: imagePath });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.uploadAvatar] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Select default avatar (delete custom avatar if exists)
     */
    async selectDefaultAvatar(req, res) {
        try {
            const { userId } = req.params;
            const { imagePath } = req.body;
            console.log(`🔵 [PublicProfilesController.selectDefaultAvatar] Selecionando avatar padrão para user: ${userId}`);

            if (!imagePath) {
                console.error(`🔴 [PublicProfilesController.selectDefaultAvatar] imagePath não fornecido`);
                return res.status(400).json({ error: 'imagePath é obrigatório' });
            }

            // Get current user to delete old custom avatar if exists
            const user = await usersModel.getUserById(userId);
            const oldAvatar = user.profile_image;

            // Delete old custom avatar if exists BEFORE selecting default
            if (oldAvatar && oldAvatar.includes('/images/user-images/')) {
                console.log(`🗑️  [PublicProfilesController.selectDefaultAvatar] Deletando imagem customizada: ${oldAvatar}`);
                deleteImage(oldAvatar);
            }

            // Update user avatar with default path
            await usersModel.updateUserProfileImage(userId, imagePath);

            console.log(`🟢 [PublicProfilesController.selectDefaultAvatar] Avatar padrão selecionado: ${imagePath}`);
            res.status(200).json({ profile_image: imagePath });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.selectDefaultAvatar] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // ==================== ADVANCED CYCLES ====================

    /**
     * Create advanced cycle
     */
    async createAdvancedCycle(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.createAdvancedCycle] Criando ciclo para user: ${userId}`);

            const cycle = await advancedCyclesModel.create(userId, req.body);

            console.log(`🟢 [PublicProfilesController.createAdvancedCycle] Ciclo criado`);
            res.status(201).json(cycle);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.createAdvancedCycle] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Update advanced cycle
     */
    async updateAdvancedCycle(req, res) {
        try {
            const { cycleId } = req.params;
            console.log(`🔵 [PublicProfilesController.updateAdvancedCycle] Atualizando ciclo: ${cycleId}`);

            const cycle = await advancedCyclesModel.update(cycleId, req.body);

            console.log(`🟢 [PublicProfilesController.updateAdvancedCycle] Ciclo atualizado`);
            res.status(200).json(cycle);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.updateAdvancedCycle] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Delete advanced cycle
     */
    async deleteAdvancedCycle(req, res) {
        try {
            const { cycleId } = req.params;
            console.log(`🔵 [PublicProfilesController.deleteAdvancedCycle] Deletando ciclo: ${cycleId}`);

            await advancedCyclesModel.delete(cycleId);

            console.log(`🟢 [PublicProfilesController.deleteAdvancedCycle] Ciclo deletado`);
            res.status(200).json({ message: 'Ciclo deletado com sucesso' });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.deleteAdvancedCycle] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Add tag to advanced cycle
     */
    async addCycleTag(req, res) {
        try {
            const { cycleId } = req.params;
            const { label, category } = req.body;
            console.log(`🔵 [PublicProfilesController.addCycleTag] Adicionando tag ao ciclo: ${cycleId}`);

            const tag = await advancedCyclesModel.addTag(cycleId, label, category);

            console.log(`🟢 [PublicProfilesController.addCycleTag] Tag adicionada`);
            res.status(201).json(tag);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.addCycleTag] Erro:`, error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Remove tag from advanced cycle
     */
    async removeCycleTag(req, res) {
        try {
            const { tagId } = req.params;
            console.log(`🔵 [PublicProfilesController.removeCycleTag] Removendo tag: ${tagId}`);

            await advancedCyclesModel.removeTag(tagId);

            console.log(`🟢 [PublicProfilesController.removeCycleTag] Tag removida`);
            res.status(200).json({ message: 'Tag removida com sucesso' });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.removeCycleTag] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // ==================== DISCIPLINES ====================

    /**
     * Create discipline
     */
    async createDiscipline(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.createDiscipline] Criando disciplina para user: ${userId}`);

            const discipline = await profileDisciplinesModel.create(userId, req.body);

            console.log(`🟢 [PublicProfilesController.createDiscipline] Disciplina criada`);
            res.status(201).json(discipline);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.createDiscipline] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Update discipline
     */
    async updateDiscipline(req, res) {
        try {
            const { discId } = req.params;
            console.log(`🔵 [PublicProfilesController.updateDiscipline] Atualizando disciplina: ${discId}`);

            const discipline = await profileDisciplinesModel.update(discId, req.body);

            console.log(`🟢 [PublicProfilesController.updateDiscipline] Disciplina atualizada`);
            res.status(200).json(discipline);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.updateDiscipline] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Delete discipline
     */
    async deleteDiscipline(req, res) {
        try {
            const { discId } = req.params;
            console.log(`🔵 [PublicProfilesController.deleteDiscipline] Deletando disciplina: ${discId}`);

            await profileDisciplinesModel.delete(discId);

            console.log(`🟢 [PublicProfilesController.deleteDiscipline] Disciplina deletada`);
            res.status(200).json({ message: 'Disciplina deletada com sucesso' });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.deleteDiscipline] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // ==================== INTERNATIONAL EXPERIENCES ====================

    /**
     * Create international experience
     */
    async createInternational(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.createInternational] Criando experiência para user: ${userId}`);

            const experience = await internationalExperiencesModel.create(userId, req.body);

            console.log(`🟢 [PublicProfilesController.createInternational] Experiência criada`);
            res.status(201).json(experience);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.createInternational] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Update international experience
     */
    async updateInternational(req, res) {
        try {
            const { expId } = req.params;
            console.log(`🔵 [PublicProfilesController.updateInternational] Atualizando experiência: ${expId}`);

            const experience = await internationalExperiencesModel.update(expId, req.body);

            console.log(`🟢 [PublicProfilesController.updateInternational] Experiência atualizada`);
            res.status(200).json(experience);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.updateInternational] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Delete international experience
     */
    async deleteInternational(req, res) {
        try {
            const { expId } = req.params;
            console.log(`🔵 [PublicProfilesController.deleteInternational] Deletando experiência: ${expId}`);

            await internationalExperiencesModel.delete(expId);

            console.log(`🟢 [PublicProfilesController.deleteInternational] Experiência deletada`);
            res.status(200).json({ message: 'Experiência deletada com sucesso' });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.deleteInternational] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // ==================== POST-CM ====================

    /**
     * Create post-CM entry
     */
    async createPostCM(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.createPostCM] Criando pós-CM para user: ${userId}`);

            const entry = await postCMModel.create(userId, req.body);

            console.log(`🟢 [PublicProfilesController.createPostCM] Pós-CM criado`);
            res.status(201).json(entry);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.createPostCM] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Update post-CM entry
     */
    async updatePostCM(req, res) {
        try {
            const { postId } = req.params;
            console.log(`🔵 [PublicProfilesController.updatePostCM] Atualizando pós-CM: ${postId}`);

            const entry = await postCMModel.update(postId, req.body);

            console.log(`🟢 [PublicProfilesController.updatePostCM] Pós-CM atualizado`);
            res.status(200).json(entry);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.updatePostCM] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Delete post-CM entry
     */
    async deletePostCM(req, res) {
        try {
            const { postId } = req.params;
            console.log(`🔵 [PublicProfilesController.deletePostCM] Deletando pós-CM: ${postId}`);

            await postCMModel.delete(postId);

            console.log(`🟢 [PublicProfilesController.deletePostCM] Pós-CM deletado`);
            res.status(200).json({ message: 'Pós-CM deletado com sucesso' });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.deletePostCM] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Add area to post-CM
     */
    async addPostCMArea(req, res) {
        try {
            const { postId } = req.params;
            const { label } = req.body;
            console.log(`🔵 [PublicProfilesController.addPostCMArea] Adicionando área ao pós-CM: ${postId}`);

            const area = await postCMModel.addArea(postId, label);

            console.log(`🟢 [PublicProfilesController.addPostCMArea] Área adicionada`);
            res.status(201).json(area);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.addPostCMArea] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Remove area from post-CM
     */
    async removePostCMArea(req, res) {
        try {
            const { areaId } = req.params;
            console.log(`🔵 [PublicProfilesController.removePostCMArea] Removendo área: ${areaId}`);

            await postCMModel.removeArea(areaId);

            console.log(`🟢 [PublicProfilesController.removePostCMArea] Área removida`);
            res.status(200).json({ message: 'Área removida com sucesso' });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.removePostCMArea] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // ==================== PROFILE TAGS ====================

    /**
     * Add tag to profile
     */
    async addProfileTag(req, res) {
        try {
            const { userId } = req.params;
            const { label, category } = req.body;
            console.log(`🔵 [PublicProfilesController.addProfileTag] Adicionando tag ao perfil: ${userId}`);

            const tag = await profileTagsModel.add(userId, label, category);

            console.log(`🟢 [PublicProfilesController.addProfileTag] Tag adicionada`);
            res.status(201).json(tag);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.addProfileTag] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Remove tag from profile
     */
    async removeProfileTag(req, res) {
        try {
            const { tagId } = req.params;
            console.log(`🔵 [PublicProfilesController.removeProfileTag] Removendo tag: ${tagId}`);

            await profileTagsModel.remove(tagId);

            console.log(`🟢 [PublicProfilesController.removeProfileTag] Tag removida`);
            res.status(200).json({ message: 'Tag removida com sucesso' });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.removeProfileTag] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // ==================== FOLLOWS ====================

    /**
     * Follow a user
     */
    async followUser(req, res) {
        try {
            const { userId, targetId } = req.params;
            console.log(`🔵 [PublicProfilesController.followUser] User ${userId} seguindo ${targetId}`);

            const follow = await profileFollowsModel.follow(userId, targetId);

            console.log(`🟢 [PublicProfilesController.followUser] Follow criado`);
            res.status(201).json(follow);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.followUser] Erro:`, error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Unfollow a user
     */
    async unfollowUser(req, res) {
        try {
            const { userId, targetId } = req.params;
            console.log(`🔵 [PublicProfilesController.unfollowUser] User ${userId} deixando de seguir ${targetId}`);

            await profileFollowsModel.unfollow(userId, targetId);

            console.log(`🟢 [PublicProfilesController.unfollowUser] Unfollow realizado`);
            res.status(200).json({ message: 'Unfollow realizado com sucesso' });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.unfollowUser] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get list of users being followed
     */
    async getFollowing(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.getFollowing] Buscando seguindo de: ${userId}`);

            const following = await profileFollowsModel.getFollowing(userId);

            console.log(`🟢 [PublicProfilesController.getFollowing] ${following.length} usuários retornados`);
            res.status(200).json(following);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.getFollowing] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get list of followers
     */
    async getFollowers(req, res) {
        try {
            const { userId } = req.params;
            console.log(`🔵 [PublicProfilesController.getFollowers] Buscando seguidores de: ${userId}`);

            const followers = await profileFollowsModel.getFollowers(userId);

            console.log(`🟢 [PublicProfilesController.getFollowers] ${followers.length} seguidores retornados`);
            res.status(200).json(followers);
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.getFollowers] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Check if user is following another user
     */
    async checkIsFollowing(req, res) {
        try {
            const { userId, targetId } = req.params;
            console.log(`🔵 [PublicProfilesController.checkIsFollowing] Verificando se ${userId} segue ${targetId}`);

            const isFollowing = await profileFollowsModel.isFollowing(userId, targetId);

            console.log(`🟢 [PublicProfilesController.checkIsFollowing] Resultado: ${!!isFollowing}`);
            res.status(200).json({ isFollowing: !!isFollowing });
        } catch (error) {
            console.error(`🔴 [PublicProfilesController.checkIsFollowing] Erro:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PublicProfilesController();
