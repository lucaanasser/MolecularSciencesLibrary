/**
 * Responsabilidade: handlers HTTP de moderação do Fórum (fechar/fixar perguntas e denúncias).
 * Camada: controller.
 * Entradas/Saidas: req/res dos endpoints de moderação; ações restritas a admin.
 * Dependencias criticas: ForumModel, logger padronizado e helper this.isAdmin (prototype).
 */

const ForumModel = require('../../../../models/academic/ForumModel');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * Fecha/reabre uma pergunta (apenas admin)
     * POST /api/forum/questions/:id/close
     */
    async toggleCloseQuestion(req, res) {
        try {
            const { id } = req.params;
            log.start('POST /questions/:id/close - Fechar pergunta', { id });

            // Verificar se é admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Apenas administradores podem fechar perguntas' });
            }

            const question = await ForumModel.getQuestionById(Number(id));
            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            const newStatus = question.is_closed === 1 ? 0 : 1;
            await ForumModel.updateQuestion(Number(id), { is_closed: newStatus });

            log.success('Pergunta ' + (newStatus ? 'fechada' : 'reaberta'));
            res.json({
                success: true,
                isClosed: newStatus === 1,
                message: newStatus ? 'Pergunta fechada' : 'Pergunta reaberta'
            });
        } catch (error) {
            log.error('Erro ao fechar pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao fechar pergunta', details: error.message });
        }
    },

    /**
     * Fixa/desafixa uma pergunta no topo do fórum (apenas admin)
     * POST /api/forum/questions/:id/pin
     */
    async togglePinQuestion(req, res) {
        try {
            const { id } = req.params;
            log.start('POST /questions/:id/pin - Fixar pergunta', { id });

            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Apenas administradores podem fixar perguntas' });
            }

            const question = await ForumModel.getQuestionById(Number(id));
            if (!question) {
                return res.status(404).json({ error: 'Pergunta não encontrada' });
            }

            const newStatus = question.is_pinned === 1 ? 0 : 1;
            await ForumModel.updateQuestion(Number(id), { is_pinned: newStatus });

            log.success('Pergunta ' + (newStatus ? 'fixada' : 'desfixada'));
            res.json({
                success: true,
                isPinned: newStatus === 1,
                message: newStatus ? 'Pergunta fixada' : 'Pergunta desfixada'
            });
        } catch (error) {
            log.error('Erro ao fixar pergunta', { error: error.message });
            res.status(500).json({ error: 'Erro ao fixar pergunta', details: error.message });
        }
    },

    /**
     * Registra uma denúncia de pergunta ou resposta (autenticado)
     * POST /api/forum/reports
     */
    async createReport(req, res) {
        try {
            log.start('POST /reports - Criar denúncia');

            const { target_type, target_id, motivo } = req.body;

            if (!['question', 'answer'].includes(target_type)) {
                return res.status(400).json({ error: 'Tipo de conteúdo inválido' });
            }
            if (!target_id) {
                return res.status(400).json({ error: 'Conteúdo denunciado não informado' });
            }
            if (!motivo || motivo.trim().length < 5) {
                return res.status(400).json({ error: 'Descreva o motivo (mínimo 5 caracteres)' });
            }

            const reportId = await ForumModel.createReport({
                reporter_id: req.user.id,
                target_type,
                target_id: Number(target_id),
                motivo: motivo.trim()
            });

            log.success('Denúncia criada', { id: reportId });
            res.status(201).json({ success: true, id: reportId, message: 'Denúncia registrada. Obrigado!' });
        } catch (error) {
            log.error('Erro ao criar denúncia', { error: error.message });
            res.status(500).json({ error: 'Erro ao registrar denúncia', details: error.message });
        }
    },

    /**
     * Lista denúncias (apenas admin). ?status=pending|resolved|dismissed|all
     * GET /api/forum/reports
     */
    async getReports(req, res) {
        try {
            log.start('GET /reports - Listar denúncias');

            if (!this.isAdmin(req.user)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            const { status = 'pending' } = req.query;
            const reports = await ForumModel.getReports({ status: status === 'all' ? null : status });

            log.success('Denúncias retornadas', { total: reports.length });
            res.json(reports);
        } catch (error) {
            log.error('Erro ao listar denúncias', { error: error.message });
            res.status(500).json({ error: 'Erro ao listar denúncias', details: error.message });
        }
    },

    /**
     * Marca uma denúncia como resolvida ou descartada (apenas admin)
     * POST /api/forum/reports/:id/resolve
     */
    async resolveReport(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            log.start('POST /reports/:id/resolve - Resolver denúncia', { id, status });

            if (!this.isAdmin(req.user)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            if (!['resolved', 'dismissed'].includes(status)) {
                return res.status(400).json({ error: 'Status inválido' });
            }

            await ForumModel.updateReportStatus(Number(id), status);

            log.success('Denúncia atualizada');
            res.json({ success: true, message: 'Denúncia atualizada' });
        } catch (error) {
            log.error('Erro ao resolver denúncia', { error: error.message });
            res.status(500).json({ error: 'Erro ao resolver denúncia', details: error.message });
        }
    }
};
