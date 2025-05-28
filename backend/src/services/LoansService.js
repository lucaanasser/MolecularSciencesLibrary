const LoansModel = require('../models/LoansModel');
const UsersModel = require('../models/UsersModel');
const BooksModel = require('../models/BooksModel');
const bcrypt = require('bcrypt');

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
        const loan = await LoansModel.createLoan(book_id, user.id);
        console.log(`🟢 [LoansService] Empréstimo criado com sucesso:`, loan);
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
}

module.exports = new LoansService();