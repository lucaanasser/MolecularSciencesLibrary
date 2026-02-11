const LoansModel = require('../../models/library/LoansModel');
const UsersModel = require('../../models/library/UsersModel');
const BooksModel = require('../../models/library/BooksModel');
const bcrypt = require('bcrypt');
const RulesService = require('../utilities/RulesService');
const EmailService = require('../utilities/EmailService');

/**
 * Service responsável pela lógica de negócio dos empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class LoansService {

    /* ================= Funções de empréstimo ================= */
    
    // Função auxiliar: Valida a criação do empréstimo
    async _borrowBookCore(book_id, NUSP, password, requirePassword = true) {
        const user = await UsersModel.getUserByNUSP(NUSP);
        if (!user) {
            console.warn(`🟡 [LoansService] Usuário NUSP ${NUSP} não encontrado`);
            throw new Error('Usuário não encontrado');
        }

        if (requirePassword) {
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                console.warn(`🟡 [LoansService] Senha incorreta para NUSP ${NUSP}`);
                throw new Error('Senha incorreta');
            }
        }

        const book = await BooksModel.getBookById(book_id);
        if (!book) {
            console.warn(`🟡 [LoansService] Livro id ${book_id} não encontrado`);
            throw new Error('Livro não encontrado');
        }

        const rulesCheck = await RulesService.checkLoanRules(user, book);
        if (!rulesCheck.allowed) {
            console.warn(`🟡 [LoansService] Regras de empréstimo não atendidas: ${rulesCheck.reason}`);
            throw new Error(rulesCheck.reason);
        }

        const loan = await LoansModel.createLoan(book_id, user.id, rulesCheck.due_date);
        console.log(`🟢 [LoansService] Empréstimo criado com sucesso:`, loan);

        try {
            await EmailService.sendLoanConfirmationEmail(user.email, book, loan);
        } catch (emailErr) {
            console.error(`🔴 [LoansService] Erro ao enviar email de confirmação: ${emailErr.message}`);
        }

        return loan; // formato {success: true/false, loan_id: number}
    }

    // Empréstimo normal (com senha)
    async borrowBook(book_id, NUSP, password) {
        console.log(`🔵 [LoansService] Iniciando processo de empréstimo: book_id=${book_id}, NUSP=${NUSP}`);
        return this._borrowBookCore(book_id, NUSP, password, true);
    }

    // Empréstimo admin (sem senha)
    async borrowBookAsAdmin(book_id, NUSP) {
        console.log(`🔵 [LoansService] [ADMIN] Iniciando processo de empréstimo: book_id=${book_id}, NUSP=${NUSP}`);
        return this._borrowBookCore(book_id, NUSP, null, false);
    }
    

    /* ================= Funções de devolução ================= */

    // Função auxiliar: Registra devolução pelo loan_id
    async returnBook(loan_id) {
        console.log(`🔵 [LoansService] Registrando devolução do empréstimo: loan_id=${loan_id}`);
        const result = await LoansModel.returnBook(loan_id);
        console.log(`🟢 [LoansService] Devolução registrada:`, result);
        return result; // formato {updated: true/false}
    }
    
    // Devolução (pelo book_id)
    async returnBookByBookId(book_id) {
        
        // 1. Busca o empréstimo ativo para o livro
        const loanRow = await LoansModel.getActiveLoanByBookId(book_id);
        if (!loanRow) {
            console.warn(`🟡 [LoansService] Nenhum empréstimo ativo encontrado para o livro ${book_id}`);
            throw new Error('Nenhum empréstimo ativo encontrado para este livro');
        }
        // 2. Registra devolução usando o método padrão
        const result = await this.returnBook(loanRow.loan_id);

        // 3. Busca detalhes do empréstimo para enviar e-mail
        const loan = await LoansModel.getActiveLoanById(loanRow.loan_id);
        let bookTitle = book_id;
        if (loan && loan.book_id) {
            const book = await BooksModel.getBookById(loan.book_id);
            if (book && book.title) {
                bookTitle = book.title;
            }
        }
        if (loan) {
            try {
                await EmailService.sendReturnConfirmationEmail({
                    user_id: loan.student_id,
                    book_title: bookTitle,
                    returnedAt: new Date()
                });
            } catch (emailErr) {
                console.error(`🔴 [LoansService] Erro ao enviar email de devolução (devolução registrada com sucesso):`, emailErr.message);
            }
        } else {
            console.warn(`🟡 [LoansService] Não foi possível encontrar detalhes do empréstimo para enviar email de devolução.`);
        }
        console.log(`🟢 [LoansService] Devolução registrada para empréstimo:`, result);
        return result;
    }


    /* ================= Função de uso interno ================= */

    // Registra uso interno de livro (empréstimo fantasma - já devolvido)
    async registerInternalUse(book_id) {
        console.log(`🔵 [LoansService] [USO INTERNO] Iniciando registro de uso interno para book_id=${book_id}`);
        
        // 1. Busca o livro pelo ID
        const book = await BooksModel.getBookById(book_id);
        if (!book) {
            console.warn(`🟡 [LoansService] [USO INTERNO] Livro id ${book_id} não encontrado`);
            throw new Error('Livro não encontrado');
        }
        
        // 2. Cria o empréstimo fantasma
        const result = await LoansModel.createInternalUseLoan(book_id);
        console.log(`🟢 [LoansService] [USO INTERNO] Uso interno registrado com sucesso para livro ${book_id} - ${book.title}`);
        return result; // formato {success: true/false, loan_id: number}
    }


    /* ================= Funções de renovação ================= */

    // Preview da renovação
    async previewRenewLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Preview de renovação: loan_id=${loan_id}, user_id=${user_id}`);
        
        // 1. Busca empréstimo ativo do livro e checa se pertence ao usuário
        const loan = await LoansModel.getActiveLoanById(loan_id);
        if (!loan) {
            console.warn(`🟡 [LoansService] Empréstimo não encontrado: loan_id=${loan_id}`);
            throw new Error('Empréstimo não encontrado.');
        }
        if (user_id && loan.student_id !== user_id) {
            console.warn(`🟡 [LoansService] Este empréstimo não pertence ao usuário: user_id=${user_id}, loan_id=${loan_id}`);
            throw new Error('Este empréstimo não pertence ao usuário informado.');
        }
        
        // 2. Busca user e book a partir dos ids
        const user = await UsersModel.getUserById(user_id);
        if (!user) {
            console.warn(`🟡 [LoansService] Usuário não encontrado: user_id=${user_id}`);
            throw new Error('Usuário não encontrado.');
        }
        const book = await BooksModel.getBookById(loan.book_id);
        if (!book) {
            console.warn(`🟡 [LoansService] Livro não encontrado: book_id=${loan.book_id}`);
            throw new Error('Livro não encontrado.');
        }
        
        // 3. Checa se o empréstimo pode ser renovado de acordo com as regras
        const check = await RulesService.checkRenewRules(user, book);
        if (!check.allowed) {
            console.warn(`🟡 [LoansService] Renovação não permitida: ${check.reason}`);
            throw new Error(check.reason || 'Renovação não permitida.');
        }
        // 4. Calcula nova data de devolução
        const rules = await RulesService.getRules();
        const now = new Date();
        const newDueDate = new Date(now);
        newDueDate.setDate(now.getDate() + (rules.renewal_days || 7));
        
        console.log(`🟢 [LoansService] Preview de renovação bem-sucedido: loan_id=${loan_id}, nova due_date=${newDueDate.toISOString()}`);
        return {
            new_due_date: newDueDate.toISOString(),
            message: 'Nova data de devolução após renovação (calculada a partir de hoje).'
        };
    }
    
    // Renovação
    async renewLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Renovando empréstimo: loan_id=${loan_id}${user_id ? ", user_id=" + user_id : ''}`);
        
        // 1. Valida a renovação e calcula a nova due_date
        const preview = await this.previewRenewLoan(loan_id, user_id);

        // 2. Atualiza empréstimo usando a due_date calculada
        await LoansModel.renewLoan(loan_id, preview.new_due_date);
        
        // 3. Envia email de confirmação de renovação
        const updatedLoan = await LoansModel.getLoanById(loan_id);
        const book = await BooksModel.getBookById(updatedLoan.book_id);
           
        try {
            await EmailService.sendRenewalConfirmationEmail({
                user_id: updatedLoan.student_id,
                book_title: book.title,
                due_date: updatedLoan.due_date
            });
        } catch (emailErr) {
            console.error(`🟡 [LoansService] Erro ao enviar email de renovação (renovação realizada com sucesso):`, emailErr.message);
        }

        console.log(`🟢 [LoansService] Empréstimo renovado com sucesso:`, updatedLoan);
        return {
            message: 'Empréstimo renovado com sucesso.',
            new_due_date: updatedLoan ? updatedLoan.due_date : (preview ? preview.new_due_date : null)
        };
    }
    

    /* ================= Funções de extensão (atualmente não utilizadas) ================= */

    // Preview da extensão
    async previewExtendLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Preview de extensão: loan_id=${loan_id}, user_id=${user_id}`);
        
        // 1. Busca empréstimo, livro e usuário
        const loan = await LoansModel.getActiveLoanById(loan_id);
        if (!loan) {
            console.warn(`🟡 [LoansService] Empréstimo não encontrado ou já devolvido: loan_id=${loan_id}`);
            throw new Error('Empréstimo não encontrado ou já devolvido.');
        }
        const user = await UsersModel.getUserById(user_id);
        if (!user) {
            console.warn(`🟡 [LoansService] Usuário não encontrado: user_id=${user_id}`);
            throw new Error('Usuário não encontrado.');
        }
        const book = await BooksModel.getBookById(loan.book_id);
        if (!book) {
            console.warn(`🟡 [LoansService] Livro não encontrado: book_id=${loan.book_id}`);
            throw new Error('Livro não encontrado.');
        }

        // 2. Valida regras de extensão
        const check = await RulesService.checkExtendRules(user, book);
        if (!check.allowed) {
            console.warn(`🟡 [LoansService] Extensão não permitida: ${check.reason}`);
            throw new Error(check.reason || 'Extensão não permitida.');
        }

        // 3. Calcula nova due_date
        const rules = await RulesService.getRules();
        const now = new Date();
        const addedDays = (rules.renewal_days || 7) * (rules.extension_block_multiplier || 3);
        const newDueDate = new Date(now);
        newDueDate.setDate(now.getDate() + addedDays);
        
        console.log(`🟢 [LoansService] Preview de extensão bem-sucedido: loan_id=${loan_id}, nova due_date=${newDueDate.toISOString()}, dias adicionados=${addedDays}`);
        return {
            new_due_date: newDueDate.toISOString(),
            message: `Nova data de devolução após extensão (calculada a partir de hoje, extensão adiciona ${addedDays} dias).`
        };
    }

    // Estende um empréstimo
    async extendLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Estendendo empréstimo: loan_id=${loan_id}${user_id ? ", user_id=" + user_id : ''}`);
        
        // 1. Valida a extensão e calcula a nova due_date
        const preview = await this.previewExtendLoan(loan_id, user_id);
        
        // 2. Atualiza empréstimo usando a due_date calculada e aplica nudge se necessário
        await LoansModel.extendLoan(loan_id, preview.new_due_date);
        
        // 3. Envia email de confirmação de extensão (não bloqueia se falhar)
        const updated = await LoansModel.getLoanById(loan_id);
        const book = await BooksModel.getBookById(updated.book_id);
        try {
            await EmailService.sendExtensionConfirmationEmail({
                user_id,
                book_title: book.title,
                due_date: updated.due_date
            });
        } catch (emailErr) {
            console.error(`🟡 [LoansService] Erro ao enviar email de extensão (extensão realizada com sucesso):`, emailErr.message);
        }
        
        console.log(`🟢 [LoansService] Empréstimo estendido com sucesso:`, updated);
        return { message: 'Empréstimo estendido com sucesso.', due_date: updated?.due_date };
    }

    // Aplica nudge em empréstimo estendido 
    async applyNudgeInExtension(loan_id) {
        console.log(`🔵 [LoansService] Iniciando nudge de extensão: loan_id=${loan_id}`);

        // 1. Busca regras do sistema e o empréstimo
        const rules = await RulesService.getRules();
        const loan = await LoansModel.getLoanById(loan_id);

        // 2. Veirfica se o empréstimo é elegível para nudge (estendido e prazo maior que 5 dias)
        if (loan.is_extended !== 1) {
            console.log(`🟡 [LoansService] Nudge não aplicável: empréstimo não está estendido (loan_id=${loan_id})`);
            return { changed: false };
        }
        const shortenedTarget = rules.shortened_due_days_after_nudge || 5;
        const changed = await LoansModel.shortenDueDateIfLongerThan(loan_id, shortenedTarget);
        if (!changed) {
            console.log(`🟡 [LoansService] Nudge não necessário: prazo já está igual ou menor que ${shortenedTarget} dias (loan_id=${loan_id})`);
            return { changed: false };
        }

        // 3. Envia e-mail de notificação ao usuário
        const updatedLoan = await LoansModel.getLoanById(loan_id);
        try {
            await EmailService.sendExtensionNudgeEmail({
                user_id: updatedLoan.student_id,
                book_title: updatedLoan.book_title,
                new_due_date: updatedLoan.due_date
            });
            console.log(`🟢 [LoansService] Email de nudge enviado para user_id=${updatedLoan.student_id}, loan_id=${loan_id}`);
        } catch (emailErr) {
            console.error(`🟡 [LoansService] Erro ao enviar email de nudge (operação realizada com sucesso):`, emailErr.message);
        }

        console.log(`🟢 [LoansService] Nudge de extensão aplicado com sucesso: loan_id=${loan_id}, nova due_date=${updatedLoan.due_date}`);
        return { changed: true, new_due_date: updatedLoan.due_date };
    }


    /* ================= Funções de listagem de empréstimos ================= */

    // Lista todos os empréstimos
    async listLoans() {
        console.log("🔵 [LoansService] Listando todos os empréstimos");
        const loans = await LoansModel.getAllLoans();
        console.log(`🟢 [LoansService] Empréstimos encontrados: ${loans.length}`);
        return loans;
    }

    // Lista todos os empréstimos ativos, incluindo status de atraso
    async listActiveLoansWithOverdue() {
        console.log("🔵 [LoansService] Listando empréstimos ativos com status de atraso");
        const [allLoans, rules] = await Promise.all([
            LoansModel.getAllLoans(),
            RulesService.getRules()
        ]);
        const maxDays = rules.max_days;
        const now = new Date();
        const activeLoans = allLoans.filter(loan => !loan.returned_at);
        const result = activeLoans.map(loan => {
            const is_overdue = loan.due_date && now > new Date(loan.due_date);
            return { ...loan, is_overdue };
        });
        console.log(`🟢 [LoansService] Empréstimos ativos processados: ${result.length}`);
        return result;
    }

    // Lista todos os empréstimos de um usuário específico
    async listLoansByUser(userId) {
        console.log(`🔵 [LoansService] Listando empréstimos do usuário: userId=${userId}`);
        const loans = await LoansModel.getLoansByUser(userId);
        console.log(`🟢 [LoansService] Empréstimos do usuário ${userId} encontrados: ${loans.length}`);
        return loans;
    }

    // Lista todos os empréstimos ativos de um usuário específico
    async listActiveLoansByUser(userId) {
        console.log(`🔵 [LoansService] Listando empréstimos ativos do usuário: userId=${userId}`);
        const loans = await LoansModel.getLoansByUser(userId);
        const activeLoans = loans.filter(l => !l.returned_at);
        console.log(`🟢 [LoansService] Empréstimos ativos do usuário ${userId} encontrados: ${activeLoans.length}`);
        return activeLoans;
    }

}

module.exports = new LoansService();