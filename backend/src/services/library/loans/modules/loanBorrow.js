/**
 * Responsabilidade: fluxo de criacao de emprestimos e uso interno.
 * Camada: service.
 * Entradas/Saidas: recebe dados de livro/usuario e persiste emprestimos conforme regras.
 * Dependencias criticas: LoansModel, UsersService, BooksService, RulesService e EmailService.
 */

const LoansModel = require('../../../../models/library/LoansModel');
const RulesService = require('../../../utilities/RulesService');
const EmailService = require('../../../utilities/EmailService');
const UsersService = require('../../UsersService');
const BooksService = require('../../BooksService');
const { getLogger } = require('../../../../shared/logging/logger');

const log = getLogger(__filename);

module.exports = {
    /**
     * O que faz: executa emprestimo normal validando senha do usuario.
     * Onde e usada: borrowHandlers.borrowBook.
     * Dependencias chamadas: _borrowBookCore.
     * Efeitos colaterais: persiste emprestimo e pode disparar email de confirmacao.
     */
    async borrowBook(book_id, NUSP, password) {
        log.start('Iniciando processo de emprestimo autenticado', { book_id, NUSP });
        try {
            return await this._borrowBookCore(book_id, NUSP, password, true);
        } catch (err) {
            log.error('Erro ao realizar emprestimo autenticado', { err: err.message, book_id, NUSP });
            throw err;
        }
    },

    /**
     * O que faz: executa emprestimo administrativo sem senha.
     * Onde e usada: borrowHandlers.borrowBookAsAdmin.
     * Dependencias chamadas: _borrowBookCore.
     * Efeitos colaterais: persiste emprestimo e pode disparar email de confirmacao.
     */
    async borrowBookAsAdmin(book_id, NUSP) {
        log.start('Iniciando processo de emprestimo admin', { book_id, NUSP });
        try {
            return await this._borrowBookCore(book_id, NUSP, null, false);
        } catch (err) {
            log.error('Erro ao realizar emprestimo admin', { err: err.message, book_id, NUSP });
            throw err;
        }
    },

    /**
     * O que faz: registra uso interno (emprestimo fantasma) para metricas.
     * Onde e usada: borrowHandlers.registerInternalUse.
     * Dependencias chamadas: BooksService.getBookById, LoansModel.registerInternalUse.
     * Efeitos colaterais: cria registro de emprestimo interno no banco.
     */
    async registerInternalUse(book_id) {
        log.start('Iniciando registro de uso interno', { book_id });

        let book;
        try {
            log.start('Buscando livro para uso interno', { book_id });
            book = await BooksService.getBookById(book_id);
        } catch (err) {
            log.error('Erro ao buscar livro para uso interno', { err: err.message, book_id });
            throw err;
        }

        try {
            await LoansModel.registerInternalUse(book_id);
            log.success('Uso interno registrado com sucesso', { book_id, title: book.title });
        } catch (err) {
            log.error('Erro ao registrar uso interno', { err: err.message, book_id });
            throw err;
        }
    },

    /**
     * O que faz: valida usuario/livro/regras e executa a criacao do emprestimo.
     * Onde e usada: borrowBook e borrowBookAsAdmin.
     * Dependencias chamadas: UsersService, BooksService, _checkLoanRules, LoansModel e EmailService.
     * Efeitos colaterais: persiste emprestimo, altera status do livro e envia email.
     */
    async _borrowBookCore(book_id, NUSP, password, requirePassword = true) {
        log.start('Validando pre-condicoes para criacao de emprestimo', { book_id, NUSP, requirePassword });

        let user;
        try {
            log.start('Buscando usuario por NUSP', { NUSP });
            user = await UsersService.getUserByNUSP(NUSP);
        } catch (err) {
            log.error('Erro ao buscar usuario por NUSP', { err: err.message, NUSP });
            throw err;
        }

        if (requirePassword) {
            try {
                log.start('Validando senha do usuario', { NUSP });
                await UsersService.authenticateUser(NUSP, password);
            } catch (err) {
                log.error('Erro ao validar senha do usuario', { err: err.message, NUSP });
                throw err;
            }
        }

        let book;
        try {
            log.start('Buscando livro por ID', { book_id });
            book = await BooksService.getBookById(book_id);
        } catch (err) {
            log.error('Erro ao buscar livro por ID', { err: err.message, book_id });
            throw err;
        }

        let rulesCheck;
        try {
            log.start('Validando regras de emprestimo', { user_id: user.id, book_id });
            rulesCheck = await this._checkLoanRules(user.id, book);
        } catch (err) {
            log.error('Erro ao validar regras de emprestimo', { err: err.message, user_id: user.id, book_id });
            throw err;
        }
        if (!rulesCheck.allowed) {
            log.warn('Regras de emprestimo nao atendidas', { user_id: user.id, book_id, reason: rulesCheck.reason });
            throw new Error(rulesCheck.reason);
        }

        try {
            log.start('Persistindo emprestimo aprovado', { user_id: user.id, book_id });
            await LoansModel.createLoan(book_id, user.id, rulesCheck.due_date);
        } catch (err) {
            log.error('Erro ao criar emprestimo no model', { err: err.message, user_id: user.id, book_id });
            throw err;
        }

        const activeLoans = await LoansModel.getLoansByBookId(book_id, true);
        const createdLoan = activeLoans[0] || null;
        log.success('Emprestimo criado com sucesso', { user_id: user.id, book_id, loan_id: createdLoan?.id });

        try {
            log.start('Enviando email de confirmacao de emprestimo', { user_id: user.id, book_id });
            await EmailService.sendLoanConfirmationEmail({ user, book_title: book.title });
        } catch (emailErr) {
            log.warn('Falha no envio de email de confirmacao (operacao principal concluida)', {
                err: emailErr.message,
                user_id: user.id,
                book_id
            });
        }

        return createdLoan;
    },

    /**
     * O que faz: avalia regras de limite/estado para permitir emprestimo.
     * Onde e usada: _borrowBookCore.
     * Dependencias chamadas: RulesService.getRules e getUserLoans.
     * Efeitos colaterais: nenhum; apenas validacao de negocio.
     */
    async _checkLoanRules(user_id, book) {
        let rules;
        try {
            rules = await RulesService.getRules();
        } catch (err) {
            log.error('Erro ao buscar regras de emprestimo', { err: err.message, user_id, book_id: book?.id });
            throw err;
        }

        const userActiveLoans = await this.getUserLoans(user_id, 'active');
        const maxActiveLoans = rules.max_books_per_user;
        if (userActiveLoans.length >= maxActiveLoans) {
            return {
                allowed: false,
                reason: `Limite de ${maxActiveLoans} empréstimos ativos atingido.`
            };
        }

        if (book.status != 'disponível') {
            return {
                allowed: false,
                reason: 'Este livro não está disponível para empréstimo no momento. Status: ' + book.status
            };
        }

        const maxDays = rules.max_days;
        const borrowedAt = new Date();
        const dueDate = new Date(borrowedAt);
        dueDate.setDate(borrowedAt.getDate() + maxDays);

        return {
            allowed: true,
            reason: '',
            due_date: dueDate.toISOString()
        };
    }
};
