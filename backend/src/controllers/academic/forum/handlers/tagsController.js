/**
 * Responsabilidade: handlers HTTP de tags e tópicos do Fórum.
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints de tags/tópicos; moderação restrita a admin.
 * Dependencias criticas: ForumModel, logger padronizado, helpers this.isAdmin/this.getAdminUsers (prototype)
 *                        e NotificationsModel (require inline em createTag).
 */

const ForumModel = require('../../../../models/academic/forum/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Lista todas as tags
     * GET /api/forum/tags
     */
    async getTags(req, res) {
        try {
            log.start('GET /tags - Listar tags');

            const tags = await ForumModel.getAllTags();

            log.success('Tags retornadas', { total: tags.length });
            res.json(tags);
        } catch (error) {
            log.error('Erro ao listar tags', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar tags', details: error.message });
        }
    },

    /**
     * Lista tags populares
     * GET /api/forum/tags/popular
     */
    async getPopularTags(req, res) {
        try {
            log.start('GET /tags/popular - Listar tags populares');

            const { limit = 10 } = req.query;
            const tags = await ForumModel.getPopularTags(Number(limit));

            log.success('Tags populares retornadas', { total: tags.length });
            res.json(tags);
        } catch (error) {
            log.error('Erro ao listar tags populares', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar tags', details: error.message });
        }
    },

    /**
     * Cria nova tag
     * POST /api/forum/tags
     */
    async createTag(req, res) {
        try {
            log.start('POST /tags - Criar nova tag');

            const { nome, topico, descricao } = req.body;
            const userId = req.user.id;

            // Validações
            if (!nome || nome.trim().length < 2) {
                return res.status(400).json({ error: 'Nome da tag deve ter pelo menos 2 caracteres' });
            }
            if (!topico) {
                return res.status(400).json({ error: 'Tópico é obrigatório' });
            }

            const tagId = await ForumModel.createTag({ nome, topico, descricao, userId });

            // Notificar admin sobre nova tag criada
            const NotificationsModel = require('../../../../models/utilities/NotificationsModel');
            const admins = await this.getAdminUsers();
            for (const admin of admins) {
                await NotificationsModel.createNotification({
                    user_id: admin.id,
                    type: 'forum_new_tag',
                    message: `O usuário ${req.user.name} criou a tag "${nome}" no tópico "${topico}". Valide ou remova se necessário.`,
                    metadata: { tag_id: tagId, tag_nome: nome, topico }
                });
            }

            log.success('Tag criada e notificações enviadas');
            res.status(201).json({
                id: tagId,
                message: 'Tag criada com sucesso! Já está disponível para uso.'
            });
        } catch (error) {
            log.error('Erro ao criar tag', { error: error.message });
            if (error.message === 'Tag já existe') {
                return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erro ao criar tag', details: error.message });
        }
    },

    /**
     * Lista tags pendentes (apenas admin)
     * GET /api/forum/tags/pending
     */
    async getPendingTags(req, res) {
        try {
            log.start('GET /tags/pending - Listar tags pendentes');

            // Verificar se é admin
            if (!this.isAdmin(req.user)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            const tags = await ForumModel.getPendingTags();

            log.success('Tags pendentes retornadas', { total: tags.length });
            res.json(tags);
        } catch (error) {
            log.error('Erro ao listar tags pendentes', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar tags pendentes', details: error.message });
        }
    },

    /**
     * Aprova uma tag (apenas admin)
     * POST /api/forum/tags/:id/approve
     */
    async approveTag(req, res) {
        try {
            log.start('POST /tags/:id/approve - Aprovar tag');

            const { id } = req.params;

            // Verificar se é admin
            if (!this.isAdmin(req.user)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            await ForumModel.approveTag(id);

            log.success('Tag aprovada');
            res.json({ message: 'Tag aprovada com sucesso' });
        } catch (error) {
            log.error('Erro ao aprovar tag', { error: error.message });
            res.status(500).json({ error: 'Erro ao aprovar tag', details: error.message });
        }
    },

    /**
     * Deleta uma tag (apenas admin)
     * DELETE /api/forum/tags/:id
     */
    async deleteTag(req, res) {
        try {
            log.start('DELETE /tags/:id - Deletar tag');

            const { id } = req.params;

            // Verificar se é admin
            if (!this.isAdmin(req.user)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            await ForumModel.deleteTag(id);

            log.success('Tag deletada');
            res.json({ message: 'Tag deletada com sucesso' });
        } catch (error) {
            log.error('Erro ao deletar tag', { error: error.message });
            res.status(500).json({ error: 'Erro ao deletar tag', details: error.message });
        }
    },

    /**
     * Busca tópicos disponíveis
     * GET /api/forum/topics
     */
    async getTopics(req, res) {
        try {
            log.start('GET /topics - Listar tópicos');

            const topics = ForumModel.getAvailableTopics();

            log.success('Tópicos retornados', { total: topics.length });
            res.json(topics);
        } catch (error) {
            log.error('Erro ao listar tópicos', { error: error.message });
            res.status(500).json({ error: 'Erro ao buscar tópicos', details: error.message });
        }
    }
};
