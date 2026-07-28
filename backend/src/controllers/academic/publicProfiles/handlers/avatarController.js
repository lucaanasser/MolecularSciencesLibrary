/**
 * Responsabilidade: handlers HTTP de avatar do perfil (opcoes, upload, padrao, remocao).
 * Camada: controller.
 * Entradas/Saidas: req/res de operacoes de avatar; delega a service/model/utils e traduz status.
 * Dependencias criticas: PublicProfilesService, UsersModel, utils/imageUpload e logger padronizado.
 */

const publicProfilesService = require('../../../../services/academic/publicProfiles/PublicProfilesService');
const usersModel = require('../../../../models/library/UsersModel');
const { uploadImage, deleteImage } = require('../../../../utils/imageUpload');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: lista opcoes de roster para escolha de avatar.
     * Onde e usada: GET /:userId/avatar/roster-options.
     * Dependencias chamadas: publicProfilesService.getSandboxRosterOptions.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getAvatarRosterOptions(req, res) {
        try {
            const { userId } = req.params;
            log.start('Buscando opcoes de roster para avatar', { userId });

            const options = await publicProfilesService.getSandboxRosterOptions(userId);

            log.success('Opcoes de roster retornadas', { userId, count: options.students.length });
            res.status(200).json(options);
        } catch (error) {
            log.error('Erro ao buscar opcoes de roster para avatar', { err: error.message });
            res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: faz upload do avatar, aplicando convencao de nome do CCM quando ha rosterName.
     * Onde e usada: PUT /:userId/avatar.
     * Dependencias chamadas: usersModel, publicProfilesService, ProfileTransformer, uploadImage/deleteImage.
     * Efeitos colaterais: grava nova imagem, remove avatar customizado antigo e atualiza usuario.
     */
    async uploadAvatar(req, res) {
        try {
            const { userId } = req.params;
            const rosterName = req.query.rosterName;
            log.start('Upload de avatar', { userId, rosterName });

            if (!req.file) {
                log.warn('Nenhum arquivo enviado', { userId });
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            log.start('Arquivo recebido', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.buffer.length,
                hasBuffer: !!req.file.buffer
            });

            // Get current user to delete old avatar if exists
            const user = await usersModel.getUserById(userId);
            const oldAvatar = user.profile_image;

            // If rosterName is provided, use CCM website naming convention
            let imagePath;
            if (rosterName) {
                const { ProfileTransformer } = require('../../../../services/academic/profileTransformer/ProfileTransformer');
                const completeProfile = await publicProfilesService.getCompleteProfile(userId);
                const profileTransformer = new ProfileTransformer();
                const turma = profileTransformer.resolveClassYear(completeProfile.turma);
                const slug = ProfileTransformer.generateSlug(rosterName);
                const isHighRes = String(req.file.originalname || '').includes('@2x');

                // Save with ccm-website naming convention
                const fileName = isHighRes ? `${slug}@2x.jpg` : `${slug}.jpg`;

                // Save to user-images for backend storage
                imagePath = uploadImage(req.file.buffer, fileName, 'user-images', 5, { preserveOriginalName: true });
                log.success('Imagem salva com nome correto', { imagePath });
            } else {
                // Fallback to original naming if no rosterName provided
                imagePath = uploadImage(req.file.buffer, req.file.originalname, 'user-images', 5);
                log.success('Imagem salva com nome original', { imagePath });
            }

            // Delete old avatar BEFORE updating if it's a custom uploaded image
            if (oldAvatar && oldAvatar.includes('/images/user-images/')) {
                log.start('Deletando imagem antiga', { oldAvatar });
                deleteImage(oldAvatar);
            }

            // Update user avatar in users table
            await usersModel.updateUserProfileImage(userId, imagePath);

            log.success('Avatar atualizado', { imagePath });
            res.status(200).json({ profile_image: imagePath });
        } catch (error) {
            log.error('Erro ao fazer upload de avatar', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: seleciona um avatar padrao, removendo o customizado se existir.
     * Onde e usada: PUT /:userId/avatar/default.
     * Dependencias chamadas: usersModel.getUserById, deleteImage, usersModel.updateUserProfileImage.
     * Efeitos colaterais: remove avatar customizado antigo e atualiza usuario.
     */
    async selectDefaultAvatar(req, res) {
        try {
            const { userId } = req.params;
            const { imagePath } = req.body;
            log.start('Selecionando avatar padrao', { userId });

            if (!imagePath) {
                log.warn('imagePath nao fornecido', { userId });
                return res.status(400).json({ error: 'imagePath é obrigatório' });
            }

            // Get current user to delete old custom avatar if exists
            const user = await usersModel.getUserById(userId);
            const oldAvatar = user.profile_image;

            // Delete old custom avatar if exists BEFORE selecting default
            if (oldAvatar && oldAvatar.includes('/images/user-images/')) {
                log.start('Deletando imagem customizada', { oldAvatar });
                deleteImage(oldAvatar);
            }

            // Update user avatar with default path
            await usersModel.updateUserProfileImage(userId, imagePath);

            log.success('Avatar padrao selecionado', { imagePath });
            res.status(200).json({ profile_image: imagePath });
        } catch (error) {
            log.error('Erro ao selecionar avatar padrao', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove o avatar atual apenas quando e foto customizada enviada pelo usuario.
     * Onde e usada: DELETE /:userId/avatar.
     * Dependencias chamadas: usersModel.getUserById, deleteImage, usersModel.updateUserProfileImage.
     * Efeitos colaterais: remove imagem customizada e zera avatar do usuario.
     */
    async removeAvatar(req, res) {
        try {
            const { userId } = req.params;
            log.start('Removendo avatar', { userId });

            const user = await usersModel.getUserById(userId);
            const oldAvatar = user?.profile_image;

            if (oldAvatar && oldAvatar.includes('/images/user-images/')) {
                log.start('Deletando imagem customizada', { oldAvatar });
                deleteImage(oldAvatar);
            }

            await usersModel.updateUserProfileImage(userId, null);

            log.success('Avatar removido', { userId });
            res.status(200).json({ profile_image: null });
        } catch (error) {
            log.error('Erro ao remover avatar', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    }
};
