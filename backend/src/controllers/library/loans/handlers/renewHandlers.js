/**
 * Responsabilidade: handlers HTTP de renovacao/extensao de emprestimos.
 * Camada: controller.
 * Entradas/Saidas: path/body para preview e confirmacao de renovacao/extensao.
 * Dependencias criticas: LoansService para regras e persistencia.
 */

const LoansService = require('../../../../services/library/loans/LoansService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: gera preview da renovacao com nova data prevista.
     * Onde e usada: POST /api/loans/:id/preview-renew em LoansRoutes.
     * Dependencias chamadas: LoansService.previewRenewLoan.
     * Efeitos colaterais: nenhum; somente validacao e simulacao.
     */
    async previewRenewLoan(req, res) {
        const loan_id = req.params.id;
        const { user_id } = req.body;
        log.start('Preview de renovacao solicitado', { loan_id, user_id });

        if (!loan_id || !user_id) {
            log.warn('Dados obrigatorios ausentes no preview de renovacao', { loan_id, user_id });
            return res.status(400).json({ error: 'ID do emprestimo e ID do usuario sao obrigatorios' });
        }

        try {
            const preview = await LoansService.previewRenewLoan(loan_id, user_id);
            log.success('Preview de renovacao calculado', { loan_id, user_id });
            return res.json(preview);
        } catch (err) {
            log.error('Erro no preview de renovacao', { err: err.message, loan_id, user_id });
            return res.status(400).json({ error: err.message });
        }
    },

    /**
     * O que faz: confirma renovacao e persiste nova data de devolucao.
     * Onde e usada: PUT /api/loans/:id/renew em LoansRoutes.
     * Dependencias chamadas: LoansService.renewLoan.
     * Efeitos colaterais: atualiza emprestimo e pode enviar email.
     */
    async renewLoan(req, res) {
        const loan_id = Number(req.params.id);
        const user_id = Number(req.body.user_id);

        if (!user_id) {
            log.warn('user_id ausente na renovacao', { loan_id, user_id: req.body.user_id });
            return res.status(400).json({ error: 'ID do usuario e obrigatorio' });
        }

        log.start('Renovacao de emprestimo solicitada', { loan_id, user_id });

        try {
            const result = await LoansService.renewLoan(loan_id, user_id);
            log.success('Emprestimo renovado com sucesso', { loan_id, user_id });
            return res.json(result);
        } catch (err) {
            log.error('Erro ao renovar emprestimo', { err: err.message, loan_id, user_id });
            return res.status(400).json({ error: err.message });
        }
    },

    /**
     * O que faz: gera preview da extensao legado de emprestimo.
     * Onde e usada: POST /api/loans/:id/preview-extend em LoansRoutes.
     * Dependencias chamadas: LoansService.previewExtendLoan.
     * Efeitos colaterais: nenhum; apenas simulacao de fluxo legado.
     */
    async previewExtendLoan(req, res) {
        const loan_id = Number(req.params.id);
        const user_id = Number(req.body.user_id);
        log.start('Preview de extensao legado solicitado', { loan_id, user_id });

        try {
            const data = await LoansService.previewExtendLoan(loan_id, user_id);
            log.success('Preview de extensao legado calculado', { loan_id, user_id });
            return res.json(data);
        } catch (err) {
            log.error('Erro no preview de extensao legado', { err: err.message, loan_id, user_id });
            return res.status(400).json({ error: err.message });
        }
    },

    /**
     * O que faz: confirma extensao legado de emprestimo.
     * Onde e usada: PUT /api/loans/:id/extend em LoansRoutes.
     * Dependencias chamadas: LoansService.extendLoan.
     * Efeitos colaterais: atualiza emprestimo no fluxo legado e pode enviar email.
     */
    async extendLoan(req, res) {
        const loan_id = Number(req.params.id);
        const user_id = Number(req.body.user_id);
        log.start('Extensao legado solicitada', { loan_id, user_id });

        try {
            const data = await LoansService.extendLoan(loan_id, user_id);
            log.success('Extensao legado concluida', { loan_id, user_id });
            return res.json(data);
        } catch (err) {
            log.error('Erro ao estender emprestimo legado', { err: err.message, loan_id, user_id });
            return res.status(400).json({ error: err.message });
        }
    }
};
