const LoansModel = require('../models/LoansModel');
const UsersModel = require('../models/UsersModel');
const BooksModel = require('../models/BooksModel');
const bcrypt = require('bcrypt');
const RulesService = require('./RulesService');
const EmailService = require('./EmailService');

/**
 * Service responsável pela lógica de negócio dos empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class LoansService {
    // Cria um novo empréstimo
    async borrowBook(book_id, NUSP, password) {
        console.log(`🔵 [LoansService] Iniciando empréstimo para NUSP: ${NUSP}, book_id: ${book_id}`);

        // 1. Verifica se o usuário existe pelo NUSP
        const user = await UsersModel.getUserByNUSP(NUSP);
        if (!user) {
            console.warn(`🟡 [LoansService] Usuário NUSP ${NUSP} não encontrado`);
            throw new Error('Usuário não encontrado');
        }

        // 2. Verifica se a senha está correta
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            console.warn(`🟡 [LoansService] Senha incorreta para NUSP ${NUSP}`);
            throw new Error('Senha incorreta');
        }

        // 2.1. Verifica se o usuário já atingiu o limite de empréstimos ativos
        const userLoans = await LoansModel.getLoansByUser(user.id);
        const activeLoans = userLoans.filter(l => !l.returned_at);
        const rules = await RulesService.getRules();
        const MAX_ACTIVE_LOANS = rules.max_books_per_user || 5;
        if (activeLoans.length >= MAX_ACTIVE_LOANS) {
            console.warn(`🟡 [LoansService] Usuário ${NUSP} já atingiu o limite de ${MAX_ACTIVE_LOANS} empréstimos ativos.`);
            throw new Error(`Limite de ${MAX_ACTIVE_LOANS} empréstimos ativos atingido.`);
        }

        // 3. Verifica se o livro existe
        const book = await BooksModel.getBookById(book_id);
        if (!book) {
            console.warn(`🟡 [LoansService] Livro id ${book_id} não encontrado`);
            throw new Error('Livro não encontrado');
        }

        // 4. Verifica se NÃO existe empréstimo ativo para este livro
        const emprestimoAtivo = await LoansModel.hasActiveLoan(book_id);
        if (emprestimoAtivo) {
            console.warn(`🟡 [LoansService] Livro ${book_id} já está emprestado`);
            throw new Error('Este livro já está emprestado');
        }

        // 5. Cria o empréstimo
        const maxDays = rules.max_days || 7;
        const borrowedAt = new Date();
        const dueDate = new Date(borrowedAt);
        dueDate.setDate(borrowedAt.getDate() + maxDays);
        const dueDateISO = dueDate.toISOString();
        const loan = await LoansModel.createLoan(book_id, user.id, dueDateISO);
        console.log(`🟢 [LoansService] Empréstimo criado com sucesso:`, loan);

        // Envia email de confirmação de novo empréstimo
        await EmailService.sendNotificationEmail({
            user_id: user.id,
            type: 'novo_emprestimo',
            subject: 'Novo empréstimo realizado na Biblioteca CM',
            message: `Você realizou um novo empréstimo do livro "${book.title}". Data de devolução: ${dueDateISO}. Fique atento ao prazo!`,
        });

        return loan;
    }

    // Lista todos os empréstimos com detalhes
    async listLoans() {
        console.log("🔵 [LoansService] Listando todos os empréstimos");
        const loans = await LoansModel.getLoansWithDetails();
        console.log(`🟢 [LoansService] Empréstimos encontrados: ${loans.length}`);
        return loans;
    }

    // Lista empréstimos de um usuário específico
    async listLoansByUser(userId) {
        console.log(`🔵 [LoansService] Listando empréstimos do usuário: userId=${userId}`);
        const loans = await LoansModel.getLoansByUser(userId);
        console.log(`🟢 [LoansService] Empréstimos do usuário ${userId} encontrados: ${loans.length}`);
        return loans;
    }

    // Registra devolução de um empréstimo
    async returnBook(loan_id) {
        console.log(`🔵 [LoansService] Registrando devolução do empréstimo: loan_id=${loan_id}`);
        const result = await LoansModel.returnLoan(loan_id);
        console.log(`🟢 [LoansService] Devolução registrada:`, result);
        return result;
    }

    // Registra devolução de um empréstimo autenticando pelo usuário e livro
    async returnBookByUserAndBook(NUSP, password, book_id) {
        console.log(`🔵 [LoansService] Iniciando devolução por NUSP=${NUSP}, book_id=${book_id}`);
        // 1. Busca usuário
        const user = await UsersModel.getUserByNUSP(NUSP);
        if (!user) {
            console.warn(`🟡 [LoansService] Usuário NUSP ${NUSP} não encontrado`);
            throw new Error('Usuário não encontrado');
        }

        // 2. Verifica senha
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            console.warn(`🟡 [LoansService] Senha incorreta para NUSP ${NUSP}`);
            throw new Error('Senha incorreta');
        }

        // 3. Busca empréstimo ativo desse usuário para o livro
        const loan = await LoansModel.getActiveLoanByUserAndBook(user.id, book_id);
        if (!loan) {
            console.warn(`🟡 [LoansService] Nenhum empréstimo ativo encontrado para usuário ${user.id} e livro ${book_id}`);
            throw new Error('Nenhum empréstimo ativo encontrado para este usuário e livro');
        }

        // 4. Marca como devolvido
        const result = await LoansModel.returnLoan(loan.loan_id || loan.id);
        console.log(`🟢 [LoansService] Devolução registrada para empréstimo:`, result);
        return result;
    }

    // Registra devolução de um empréstimo apenas pelo id do livro
    async returnBookByBookId(book_id) {
        // Busca o empréstimo ativo para o livro
        const loanRow = await LoansModel.getActiveLoanByBookId(book_id);
        if (!loanRow) {
            console.warn(`🟡 [LoansService] Nenhum empréstimo ativo encontrado para o livro ${book_id}`);
            throw new Error('Nenhum empréstimo ativo encontrado para este livro');
        }
        // Buscar detalhes do empréstimo para obter student_id
        const allLoans = await LoansModel.getLoansWithDetails();
        const loan = allLoans.find(l => l.loan_id === loanRow.loan_id);
        // Marca como devolvido
        const result = await LoansModel.returnLoan(loanRow.loan_id);
        // Envia email de confirmação de devolução
        if (loan) {
            await EmailService.sendReturnConfirmationEmail({
                user_id: loan.student_id,
                book_title: loan.book_title || book_id,
                returnedAt: new Date()
            });
        } else {
            console.warn(`[LoansService] Não foi possível encontrar detalhes do empréstimo para enviar email de devolução.`);
        }
        console.log(`🟢 [LoansService] Devolução registrada para empréstimo:`, result);
        return result;
    }

    // Lista todos os empréstimos ativos com detalhes e status de atraso
    async listActiveLoansWithOverdue() {
        console.log("🔵 [LoansService] Listando empréstimos ativos com status de atraso");
        const [loans, rules] = await Promise.all([
            LoansModel.getActiveLoansWithDetails(),
            RulesService.getRules()
        ]);
        const maxDays = rules.max_days;
        const now = new Date();
        const result = loans.map(loan => {
            const borrowedAt = new Date(loan.borrowed_at);
            const dueDate = new Date(borrowedAt);
            dueDate.setDate(borrowedAt.getDate() + maxDays);
            const is_overdue = now > dueDate;
            return { ...loan, due_date: dueDate.toISOString(), is_overdue };
        });
        console.log(`🟢 [LoansService] Empréstimos ativos processados: ${result.length}`);
        return result;
    }

    // Renova um empréstimo
    async renewLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Renovando empréstimo: loan_id=${loan_id}, user_id=${user_id}`);
        // Busca o empréstimo
        const loans = await LoansModel.getLoansByUser(user_id);
        const loan = loans.find(l => l.id === loan_id && !l.returned_at);
        if (!loan) throw new Error('Empréstimo não encontrado ou já devolvido.');
        // Busca regras
        const rules = await RulesService.getRules();
        if (loan.renewals >= rules.max_renewals) throw new Error('Limite de renovações atingido.');
        // Atualiza empréstimo
        await LoansModel.renewLoan(loan_id, rules.renewal_days);
        return { message: 'Empréstimo renovado com sucesso.' };
    }
}

module.exports = new LoansService();