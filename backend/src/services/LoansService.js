const LoansModel = require('../models/LoansModel');
const UsersModel = require('../models/UsersModel');
const BooksModel = require('../models/BooksModel');
const bcrypt = require('bcrypt');

class LoansService {
    // Cria um novo empréstimo
    async borrowBook(book_id, NUSP, password) {
        console.log(`[LoansService] Iniciando empréstimo para NUSP: ${NUSP}, book_id: ${book_id}`);

        // 1. Verifica se o usuário existe pelo NUSP
        const user = await UsersModel.getUserByNUSP(NUSP);
        if (!user) {
            console.log(`[LoansService] Usuário NUSP ${NUSP} não encontrado`);
            throw new Error('Usuário não encontrado');
        }

        // 2. Verifica se a senha está correta
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            console.log(`[LoansService] Senha incorreta para NUSP ${NUSP}`);
            throw new Error('Senha incorreta');
        }

        // 3. Verifica se o livro existe
        const book = await BooksModel.getBookById(book_id);
        if (!book) {
            console.log(`[LoansService] Livro id ${book_id} não encontrado`);
            throw new Error('Livro não encontrado');
        }

        // 4. Verifica se NÃO existe empréstimo ativo para este livro
        const emprestimoAtivo = await LoansModel.hasActiveLoan(book_id);
        if (emprestimoAtivo) {
            throw new Error('Este livro já está emprestado');
        }

        // 5. Cria o empréstimo
        return await LoansModel.createLoan(book_id, user.id);
    }

    // Lista todos os empréstimos com detalhes
    async listLoans() {
        return await LoansModel.getLoansWithDetails();
    }

    // Lista empréstimos de um usuário específico
    async listLoansByUser(userId) {
        return await LoansModel.getLoansByUser(userId);
    }

    // Registra devolução de um empréstimo
    async returnBook(loan_id) {
        return await LoansModel.returnLoan(loan_id);
    }

    // Registra devolução de um empréstimo autenticando pelo usuário e livro
    async returnBookByUserAndBook(NUSP, password, book_id) {
        // 1. Busca usuário
        const user = await UsersModel.getUserByNUSP(NUSP);
        if (!user) throw new Error('Usuário não encontrado');

        // 2. Verifica senha
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) throw new Error('Senha incorreta');

        // 3. Busca empréstimo ativo desse usuário para o livro
        const loan = await LoansModel.getActiveLoanByUserAndBook(user.id, book_id);
        if (!loan) throw new Error('Nenhum empréstimo ativo encontrado para este usuário e livro');

        // 4. Marca como devolvido
        return await LoansModel.returnLoan(loan.loan_id || loan.id);
    }
}

module.exports = new LoansService();