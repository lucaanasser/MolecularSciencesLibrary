/**
 * Responsabilidade: handlers HTTP do perfil publico principal (dados, banner).
 * Camada: controller.
 * Entradas/Saidas: req/res de leitura e atualizacao do perfil; delega a service/model e traduz status.
 * Dependencias criticas: PublicProfilesService, PublicProfilesModel e logger padronizado.
 */

const publicProfilesService = require('../../../../services/academic/publicProfiles/PublicProfilesService');
const publicProfilesModel = require('../../../../models/academic/publicProfiles/PublicProfilesModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: retorna o perfil publico completo (rota publica, sem auth).
     * Onde e usada: GET /:userId.
     * Dependencias chamadas: publicProfilesService.getCompleteProfile.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getProfile(req, res) {
        try {
            const { userId } = req.params;
            log.start('Buscando perfil', { userId });

            const profile = await publicProfilesService.getCompleteProfile(userId);

            log.success('Perfil retornado', { userId });
            res.status(200).json(profile);
        } catch (error) {
            log.error('Erro ao buscar perfil', { err: error.message });
            res.status(404).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza dados principais do perfil (stats, bio, citacao, contatos).
     * Onde e usada: PUT /:userId.
     * Dependencias chamadas: publicProfilesModel.update.
     * Efeitos colaterais: persiste alteracoes do perfil em DB.
     */
    async updateProfile(req, res) {
        try {
            const { userId } = req.params;
            log.start('Atualizando perfil', { userId });

            const updatedProfile = await publicProfilesModel.update(userId, req.body);

            log.success('Perfil atualizado', { userId });
            res.status(200).json(updatedProfile);
        } catch (error) {
            log.error('Erro ao atualizar perfil', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza a escolha de banner do perfil apos validacao.
     * Onde e usada: PUT /:userId/banner.
     * Dependencias chamadas: publicProfilesService.validateBannerChoice, publicProfilesModel.updateBanner.
     * Efeitos colaterais: persiste banner do perfil em DB.
     */
    async updateBanner(req, res) {
        try {
            const { userId } = req.params;
            const { bannerChoice } = req.body;
            log.start('Atualizando banner', { userId, bannerChoice });

            if (!publicProfilesService.validateBannerChoice(bannerChoice)) {
                log.warn('Banner invalido', { userId, bannerChoice });
                return res.status(400).json({
                    error: 'Banner inválido. Escolha entre: purple, blue, green, red, orange, yellow'
                });
            }

            const updatedProfile = await publicProfilesModel.updateBanner(userId, bannerChoice);

            log.success('Banner atualizado', { userId });
            res.status(200).json(updatedProfile);
        } catch (error) {
            log.error('Erro ao atualizar banner', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    }
};
