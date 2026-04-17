/**
 * Responsabilidade: handlers HTTP para criacao/devolucao de emprestimos.
 * Camada: controller.
 * Entradas/Saidas: body com dados de emprestimo e respostas HTTP padronizadas.
 * Dependencias criticas: LoansService e logger compartilhado.
 */

const LoansService = require('../../../../services/library/loans/LoansService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: cria emprestimo autenticado por senha do usuario.
     * Onde e usada: POST /api/loans em LoansRoutes.
     * Dependencias chamadas: LoansService.borrowBook.
     * Efeitos colaterais: cria registro de emprestimo e dispara notificacoes no service.
     */
    async borrowBook(req, res) {
        const { book_id, NUSP, password } = req.body;
        log.start('Iniciando criacao de emprestimo', { book_id, NUSP });

        if (!book_id || !NUSP || !password) {
            log.warn('Dados obrigatorios ausentes para criar emprestimo', { book_id, NUSP });
            return res.status(400).json({ error: 'ID do livro, NUSP e senha sao obrigatorios' });
        }

        try {
            await LoansService.borrowBook(book_id, NUSP, password);
            log.success('Emprestimo criado com sucesso', { book_id, NUSP });
            return res.status(201).json({ message: 'Emprestimo criado com sucesso' });
        } catch (err) {
            log.error('Erro ao criar emprestimo', { err: err.message, book_id, NUSP });
            return res.status(400).json({ error: err.message });
        }
    },

    /**
     * O que faz: cria emprestimo administrativo sem validacao de senha.
     * Onde e usada: POST /api/loans/admin em LoansRoutes.
     * Dependencias chamadas: LoansService.borrowBookAsAdmin.
     * Efeitos colaterais: cria emprestimo e pode disparar email de confirmacao.
     */
    async borrowBookAsAdmin(req, res) {
        const { book_id, NUSP } = req.body;
        log.start('Iniciando criacao de emprestimo via admin', { book_id, NUSP });

        if (!book_id || !NUSP) {
            log.warn('Dados obrigatorios ausentes para emprestimo admin', { book_id, NUSP });
            return res.status(400).json({ error: 'ID do livro e NUSP sao obrigatorios' });
        }

        try {
            const loan = await LoansService.borrowBookAsAdmin(book_id, NUSP);
            log.success('Emprestimo admin criado com sucesso', { book_id, NUSP, loan_id: loan?.id });
            return res.status(201).json({ ...(loan || {}), is_overdue: false });
        } catch (err) {
            log.error('Erro ao criar emprestimo via admin', { err: err.message, book_id, NUSP });
            return res.status(400).json({ error: err.message });
        }
    },

    /**
     * O que faz: registra devolucao do emprestimo ativo de um livro.
     * Onde e usada: POST /api/loans/return em LoansRoutes.
     * Dependencias chamadas: LoansService.returnBook.
     * Efeitos colaterais: altera status de emprestimo/livro e dispara email de devolucao.
     */
    async returnBook(req, res) {
        const { book_id } = req.body;
        log.start('Iniciando devolucao de emprestimo', { book_id });

        if (!book_id) {
            log.warn('book_id ausente na devolucao', { book_id });
            return res.status(400).json({ error: 'ID do livro e obrigatorio' });
        }

        try {
            await LoansService.returnBook(book_id);
            log.success('Devolucao registrada com sucesso', { book_id });
            return res.json({ message: 'Devolucao registrada com sucesso' });
        } catch (err) {
            log.error('Erro ao registrar devolucao', { err: err.message, book_id });
            return res.status(400).json({ error: err.message });
        }
    },

    /**
     * O que faz: registra uso interno de livro como emprestimo fantasma.
     * Onde e usada: POST /api/loans/internal-use em LoansRoutes.
     * Dependencias chamadas: LoansService.registerInternalUse.
     * Efeitos colaterais: persiste registro interno para metricas da biblioteca.
     */
    async registerInternalUse(req, res) {
        const { book_id } = req.body;
        log.start('Iniciando registro de uso interno', { book_id });

        if (!book_id) {
            log.warn('book_id ausente para uso interno', { book_id });
            return res.status(400).json({ error: 'ID do livro e obrigatorio' });
        }

        try {
            await LoansService.registerInternalUse(book_id);
            log.success('Uso interno registrado com sucesso', { book_id });
            return res.status(201).json({ message: 'Uso interno registrado com sucesso' });
        } catch (err) {
            log.error('Erro ao registrar uso interno', { err: err.message, book_id });
            return res.status(400).json({ error: err.message });
        }
    }
};
