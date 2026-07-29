/**
 * Responsabilidade: handlers HTTP da secao pos-CM do perfil (CRUD e areas).
 * Camada: controller.
 * Entradas/Saidas: req/res de CRUD de pos-CM e areas; delega ao PostCMModel e traduz status.
 * Dependencias criticas: PostCMModel e logger padronizado.
 */

const postCMModel = require('../../../../models/academic/publicProfiles/PostCMModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria uma entrada pos-CM para o usuario.
     * Onde e usada: POST /:userId/post-cm.
     * Dependencias chamadas: postCMModel.create.
     * Efeitos colaterais: persiste entrada pos-CM em DB.
     */
    async createPostCM(req, res) {
        try {
            const { userId } = req.params;
            log.start('Criando pos-CM', { userId });

            const entry = await postCMModel.create(userId, req.body);

            log.success('Pos-CM criado', { userId });
            res.status(201).json(entry);
        } catch (error) {
            log.error('Erro ao criar pos-CM', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: atualiza uma entrada pos-CM existente.
     * Onde e usada: PUT /:userId/post-cm/:postId.
     * Dependencias chamadas: postCMModel.update.
     * Efeitos colaterais: persiste alteracoes da entrada pos-CM em DB.
     */
    async updatePostCM(req, res) {
        try {
            const { postId } = req.params;
            log.start('Atualizando pos-CM', { postId });

            const entry = await postCMModel.update(postId, req.body);

            log.success('Pos-CM atualizado', { postId });
            res.status(200).json(entry);
        } catch (error) {
            log.error('Erro ao atualizar pos-CM', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove uma entrada pos-CM.
     * Onde e usada: DELETE /:userId/post-cm/:postId.
     * Dependencias chamadas: postCMModel.delete.
     * Efeitos colaterais: remove entrada pos-CM do DB.
     */
    async deletePostCM(req, res) {
        try {
            const { postId } = req.params;
            log.start('Deletando pos-CM', { postId });

            await postCMModel.delete(postId);

            log.success('Pos-CM deletado', { postId });
            res.status(200).json({ message: 'Pós-CM deletado com sucesso' });
        } catch (error) {
            log.error('Erro ao deletar pos-CM', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: adiciona uma area a uma entrada pos-CM.
     * Onde e usada: POST /:userId/post-cm/:postId/areas.
     * Dependencias chamadas: postCMModel.addArea.
     * Efeitos colaterais: persiste area do pos-CM em DB.
     */
    async addPostCMArea(req, res) {
        try {
            const { postId } = req.params;
            const { label } = req.body;
            log.start('Adicionando area ao pos-CM', { postId });

            const area = await postCMModel.addArea(postId, label);

            log.success('Area adicionada', { postId });
            res.status(201).json(area);
        } catch (error) {
            log.error('Erro ao adicionar area ao pos-CM', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * O que faz: remove uma area de uma entrada pos-CM.
     * Onde e usada: DELETE /:userId/post-cm/:postId/areas/:areaId.
     * Dependencias chamadas: postCMModel.removeArea.
     * Efeitos colaterais: remove area do pos-CM do DB.
     */
    async removePostCMArea(req, res) {
        try {
            const { areaId } = req.params;
            log.start('Removendo area', { areaId });

            await postCMModel.removeArea(areaId);

            log.success('Area removida', { areaId });
            res.status(200).json({ message: 'Área removida com sucesso' });
        } catch (error) {
            log.error('Erro ao remover area do pos-CM', { err: error.message });
            res.status(500).json({ error: error.message });
        }
    }
};
