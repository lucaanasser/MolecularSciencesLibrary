/**
 * Responsabilidade: handlers HTTP de escrita de perguntas do Fórum (criar/editar/excluir).
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints POST/PUT/DELETE de perguntas.
 * Dependencias criticas: ForumService (criação), ForumModel (leitura/edição) e logger padronizado.
 */

const ForumService = require('../../../../services/academic/forum/ForumService');
const ForumModel = require('../../../../models/academic/forum/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Cria nova pergunta
     * POST /api/forum/questions
     */
    async createQuestion(req, res) {
        try {
            log.start('POST /questions - Criar pergunta');

            const { titulo, conteudo, tags = [], is_anonymous = false, disciplina_codigo = null } = req.body;
            const autor_id = req.user.id;

            // Validações básicas
            if (!titulo || titulo.trim().length < 10) {
                return res.status(400).json({ error: 'Título deve ter pelo menos 10 caracteres' });
            }
            if (!conteudo || conteudo.trim().length < 20) {
                return res.status(400).json({ error: 'Conteúdo deve ter pelo menos 20 caracteres' });
            }
            if (titulo.length > 255) {
                return res.status(400).json({ error: 'Título deve ter no máximo 255 caracteres' });
            }

            const questionId = await ForumService.createQuestion({
                titulo: titulo.trim(),
                conteudo: conteudo.trim(),
                autor_id,
                tags,
                is_anonymous: is_anonymous ? 1 : 0,
                disciplina_codigo: disciplina_codigo || null
            });

            log.success('Pergunta criada', { id: questionId });
            res.status(201).json({
                success: true,
                id: questionId,
                message: 'Pergunta criada com sucesso'
            });
        } catch (error) {
            log.error('Erro ao criar pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao criar pergunta', details: error.message });
        }
    },

    /**
     * Atualiza pergunta
     * PUT /api/forum/questions/:id
     */
    async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            log.start('PUT /questions/:id - Atualizar pergunta', { id });

            const question = await ForumModel.getQuestionById(Number(id));

            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            // Verificar permissão: autor ou admin
            const isAdmin = req.user.role === 'admin';
            const isAuthor = question.autor_id === req.user.id;

            if (!isAdmin && !isAuthor) {
                log.warn('Usuário sem permissão para editar');
                return res.status(403).json({ error: 'Você não tem permissão para editar esta pergunta' });
            }

            const { titulo, conteudo, tags, disciplina_codigo } = req.body;

            // Validações
            if (titulo && titulo.trim().length < 10) {
                return res.status(400).json({ error: 'Título deve ter pelo menos 10 caracteres' });
            }
            if (conteudo && conteudo.trim().length < 20) {
                return res.status(400).json({ error: 'Conteúdo deve ter pelo menos 20 caracteres' });
            }

            const updateFields = {
                titulo: titulo?.trim() || question.titulo,
                conteudo: conteudo?.trim() || question.conteudo,
                tags
            };
            // Só altera o vínculo de disciplina se o cliente enviar o campo
            if ('disciplina_codigo' in req.body) {
                updateFields.disciplina_codigo = disciplina_codigo || null;
            }

            await ForumModel.updateQuestion(Number(id), updateFields);

            log.success('Pergunta atualizada');
            res.json({ success: true, message: 'Pergunta atualizada com sucesso' });
        } catch (error) {
            log.error('Erro ao atualizar pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao atualizar pergunta', details: error.message });
        }
    },

    /**
     * Deleta pergunta (autor ou admin)
     * DELETE /api/forum/questions/:id
     */
    async deleteQuestion(req, res) {
        try {
            const { id } = req.params;
            log.start('DELETE /questions/:id - Deletar pergunta', { id });

            const question = await ForumModel.getQuestionById(Number(id));

            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            // Verificar permissão: autor ou admin
            const isAdmin = req.user.role === 'admin';
            const isAuthor = question.autor_id === req.user.id;

            if (!isAdmin && !isAuthor) {
                log.warn('Usuário sem permissão para deletar');
                return res.status(403).json({ error: 'Você não tem permissão para deletar esta pergunta' });
            }

            await ForumModel.deleteQuestion(Number(id));

            log.success('Pergunta deletada');
            res.json({ success: true, message: 'Pergunta deletada com sucesso' });
        } catch (error) {
            log.error('Erro ao deletar pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao deletar pergunta', details: error.message });
        }
    }
};
