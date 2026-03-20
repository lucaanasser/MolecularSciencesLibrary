const LoansModel = require('../../../../models/library/LoansModel');
const RulesService = require('../../../utilities/RulesService');
const EmailService = require('../../../utilities/EmailService');
const UsersService = require('../../UsersService');
const BooksService = require('../../BooksService');

module.exports = {
    /**
     * Realiza emprestimo normal (com senha do usuario).
     */
    async borrowBook(book_id, NUSP, password) {
        console.log(`🔵 [LoansService] Iniciando processo de empréstimo: book_id=${book_id}, NUSP=${NUSP}`);
        try {
            await this._borrowBookCore(book_id, NUSP, password, true);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao realizar empréstimo: ${err.message}`);
            throw err;
        }
    },

    /**
     * Realiza emprestimo como admin (sem senha).
     */
    async borrowBookAsAdmin(book_id, NUSP) {
        console.log(`🔵 [LoansService] [ADMIN] Iniciando processo de empréstimo: book_id=${book_id}, NUSP=${NUSP}`);
        try {
            await this._borrowBookCore(book_id, NUSP, null, false);
        } catch (err) {
            console.error(`🔴 [LoansService] [ADMIN] Erro ao realizar empréstimo: ${err.message}`);
            throw err;
        }
    },

    /**
     * Registra uso interno de um livro.
     */
    async registerInternalUse(book_id) {
        console.log(`🔵 [LoansService] Iniciando registro de uso interno para book_id=${book_id}`);

        let book;
        try {
            console.log(`🔵 [LoansService] Buscando livro por ID: ${book_id}`);
            book = await BooksService.getBookById(book_id);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar livro: ${err.message}`);
            throw err;
        }

        try {
            console.log(`🔵 [LoansService] Registrando uso interno para livro ${book_id}`);
            await LoansModel.registerInternalUse(book_id);
            console.log(`🟢 [LoansService] Uso interno registrado com sucesso para livro ${book_id} - ${book.title}`);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao registrar uso interno: ${err.message}`);
            throw err;
        }
    },

    /**
     * Funcao auxiliar que valida e realiza a criacao do emprestimo.
     */
    async _borrowBookCore(book_id, NUSP, password, requirePassword = true) {
        console.log(`🔵 [LoansService] Iniciando processo de empréstimo: book_id=${book_id}, NUSP=${NUSP}, requirePassword=${requirePassword}`);

        let user;
        try {
            console.log(`🔵 [LoansService] Buscando usuário por NUSP: ${NUSP}`);
            user = await UsersService.getUserByNUSP(NUSP);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar usuário: ${err.message}`);
            throw err;
        }

        if (requirePassword) {
            try {
                console.log(`🔵 [LoansService] Validando senha para usuário NUSP: ${NUSP}`);
                await UsersService.authenticateUser(NUSP, password);
            } catch (err) {
                console.error(`🔴 [LoansService] Erro ao validar senha: ${err.message}`);
                throw err;
            }
        }

        let book;
        try {
            console.log(`🔵 [LoansService] Buscando livro por ID: ${book_id}`);
            book = await BooksService.getBookById(book_id);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar livro: ${err.message}`);
            throw err;
        }

        let rulesCheck;
        try {
            console.log(`🔵 [LoansService] Validando regras de empréstimo para usuário ${user.id} e livro ${book_id}`);
            rulesCheck = await this._checkLoanRules(user.id, book);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao validar regras de empréstimo: ${err.message}`);
            throw err;
        }
        if (!rulesCheck.allowed) {
            console.warn(`🟡 [LoansService] Regras de empréstimo não atendidas: ${rulesCheck.reason}`);
            throw new Error(rulesCheck.reason);
        }

        try {
            console.log(`🔵 [LoansService] Criando empréstimo para usuário ${user.id} e livro ${book_id}`);
            await LoansModel.createLoan(book_id, user.id, rulesCheck.due_date);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao criar empréstimo: ${err.message}`);
            throw err;
        }

        console.log('🟢 [LoansService] Empréstimo criado com sucesso:');

        try {
            console.log(`🔵 [LoansService] Enviando email de confirmação de empréstimo para usuário ${user.id}`);
            await EmailService.sendLoanConfirmationEmail({ user, book_title: book.title });
        } catch (emailErr) {
            console.warn(`🟡 [LoansService] Erro ao enviar email de confirmação: ${emailErr.message}`);
        }
    },

    /**
     * Verifica se o usuario pode pegar o livro emprestado, de acordo com as regras do sistema.
     */
    async _checkLoanRules(user_id, book) {
        let rules;
        try {
            rules = await RulesService.getRules();
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar regras: ${err.message}`);
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
