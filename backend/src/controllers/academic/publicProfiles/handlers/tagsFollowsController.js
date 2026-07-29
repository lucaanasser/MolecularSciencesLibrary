/**
 * Responsabilidade: handlers HTTP de tags do perfil e relacoes de follow entre usuarios.
 * Camada: controller.
 * Entradas/Saidas: req/res de tags e follows; delega aos models e traduz status.
 * Dependencias criticas: ProfileTagsModel, ProfileFollowsModel e logger padronizado.
 */

const profileTagsModel = require('../../../../models/academic/publicProfiles/ProfileTagsModel');
const profileFollowsModel = require('../../../../models/academic/publicProfiles/ProfileFollowsModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: adiciona uma tag ao perfil do usuario.
     * Onde e usada: POST /:userId/tags.
     * Dependencias chamadas: profileTagsModel.add.
     * Efeitos colaterais: persiste tag do perfil em DB.
     */
    async addProfileTag(req, res) {
        try {
            const { userId } = req.params;
            const { label, category } = req.body;
            log.start('Adicionando tag ao perfil', { userId });

            const tag = await profileTagsModel.add(userId, label, category);

            log.success('Tag adicionada', { userId });
            res.status(201).json(tag);
        } catch (error) {
            log.error('Erro ao adicionar tag ao perfil', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove uma tag do perfil.
     * Onde e usada: DELETE /:userId/tags/:tagId.
     * Dependencias chamadas: profileTagsModel.remove.
     * Efeitos colaterais: remove tag do perfil do DB.
     */
    async removeProfileTag(req, res) {
        try {
            const { tagId } = req.params;
            log.start('Removendo tag', { tagId });

            await profileTagsModel.remove(tagId);

            log.success('Tag removida', { tagId });
            res.status(200).json({ message: 'Tag removida com sucesso' });
        } catch (error) {
            log.error('Erro ao remover tag do perfil', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: cria uma relacao de follow do usuario para um alvo.
     * Onde e usada: POST /:userId/follow/:targetId.
     * Dependencias chamadas: profileFollowsModel.follow.
     * Efeitos colaterais: persiste follow em DB.
     */
    async followUser(req, res) {
        try {
            const { userId, targetId } = req.params;
            log.start('Seguindo usuario', { userId, targetId });

            const follow = await profileFollowsModel.follow(userId, targetId);

            log.success('Follow criado', { userId, targetId });
            res.status(201).json(follow);
        } catch (error) {
            log.error('Erro ao seguir usuario', { err: error.message });
            res.status(400).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove a relacao de follow do usuario para um alvo.
     * Onde e usada: DELETE /:userId/follow/:targetId.
     * Dependencias chamadas: profileFollowsModel.unfollow.
     * Efeitos colaterais: remove follow do DB.
     */
    async unfollowUser(req, res) {
        try {
            const { userId, targetId } = req.params;
            log.start('Deixando de seguir usuario', { userId, targetId });

            await profileFollowsModel.unfollow(userId, targetId);

            log.success('Unfollow realizado', { userId, targetId });
            res.status(200).json({ message: 'Unfollow realizado com sucesso' });
        } catch (error) {
            log.error('Erro ao deixar de seguir usuario', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: lista os usuarios que o perfil esta seguindo.
     * Onde e usada: GET /:userId/following.
     * Dependencias chamadas: profileFollowsModel.getFollowing.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getFollowing(req, res) {
        try {
            const { userId } = req.params;
            log.start('Buscando seguindo', { userId });

            const following = await profileFollowsModel.getFollowing(userId);

            log.success('Seguindo retornados', { userId, count: following.length });
            res.status(200).json(following);
        } catch (error) {
            log.error('Erro ao buscar seguindo', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: lista os seguidores do perfil.
     * Onde e usada: GET /:userId/followers.
     * Dependencias chamadas: profileFollowsModel.getFollowers.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async getFollowers(req, res) {
        try {
            const { userId } = req.params;
            log.start('Buscando seguidores', { userId });

            const followers = await profileFollowsModel.getFollowers(userId);

            log.success('Seguidores retornados', { userId, count: followers.length });
            res.status(200).json(followers);
        } catch (error) {
            log.error('Erro ao buscar seguidores', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: verifica se um usuario segue outro.
     * Onde e usada: GET /:userId/follow/:targetId/status.
     * Dependencias chamadas: profileFollowsModel.isFollowing.
     * Efeitos colaterais: nenhum alem de leitura.
     */
    async checkIsFollowing(req, res) {
        try {
            const { userId, targetId } = req.params;
            log.start('Verificando follow', { userId, targetId });

            const isFollowing = await profileFollowsModel.isFollowing(userId, targetId);

            log.success('Resultado de follow', { userId, targetId, isFollowing: !!isFollowing });
            res.status(200).json({ isFollowing: !!isFollowing });
        } catch (error) {
            log.error('Erro ao verificar follow', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    }
};
