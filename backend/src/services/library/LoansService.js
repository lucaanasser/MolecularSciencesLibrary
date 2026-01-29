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
        // Verifica se o livro está reservado didaticamente
        if (book.is_reserved === 1) {
            console.warn(`🟡 [LoansService] Livro ${book_id} está reservado didaticamente e não pode ser emprestado.`);
            throw new Error('Este livro está reservado didaticamente e não pode ser emprestado durante o semestre.');
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

        // Envia email de confirmação de novo empréstimo (não bloqueia se falhar)
        try {
            await EmailService.sendLoanConfirmationEmail({
                user_id: user.id,
                book_title: book.title,
                borrowedAt: borrowedAt
            });
        } catch (emailErr) {
            console.error(`🟡 [LoansService] Erro ao enviar email de confirmação (empréstimo criado com sucesso):`, emailErr.message);
        }

        return loan;
    }

    // Cria um novo empréstimo como admin (sem validação de senha)
    async borrowBookAsAdmin(book_id, NUSP) {
        console.log(`🔵 [LoansService] [ADMIN] Iniciando empréstimo para NUSP: ${NUSP}, book_id: ${book_id}`);

        // 1. Verifica se o usuário existe pelo NUSP
        const user = await UsersModel.getUserByNUSP(NUSP);
        if (!user) {
            console.warn(`🟡 [LoansService] [ADMIN] Usuário NUSP ${NUSP} não encontrado`);
            throw new Error('Usuário não encontrado');
        }

        // 2. Verifica se o usuário já atingiu o limite de empréstimos ativos
        const userLoans = await LoansModel.getLoansByUser(user.id);
        const activeLoans = userLoans.filter(l => !l.returned_at);
        const rules = await RulesService.getRules();
        const MAX_ACTIVE_LOANS = rules.max_books_per_user || 5;
        if (activeLoans.length >= MAX_ACTIVE_LOANS) {
            console.warn(`🟡 [LoansService] [ADMIN] Usuário ${NUSP} já atingiu o limite de ${MAX_ACTIVE_LOANS} empréstimos ativos.`);
            throw new Error(`Limite de ${MAX_ACTIVE_LOANS} empréstimos ativos atingido.`);
        }

        // 3. Verifica se o livro existe
        const book = await BooksModel.getBookById(book_id);
        if (!book) {
            console.warn(`🟡 [LoansService] [ADMIN] Livro id ${book_id} não encontrado`);
            throw new Error('Livro não encontrado');
        }
        // Verifica se o livro está reservado didaticamente
        if (book.is_reserved === 1) {
            console.warn(`🟡 [LoansService] [ADMIN] Livro ${book_id} está reservado didaticamente e não pode ser emprestado.`);
            throw new Error('Este livro está reservado didaticamente e não pode ser emprestado durante o semestre.');
        }

        // 4. Verifica se NÃO existe empréstimo ativo para este livro
        const emprestimoAtivo = await LoansModel.hasActiveLoan(book_id);
        if (emprestimoAtivo) {
            console.warn(`🟡 [LoansService] [ADMIN] Livro ${book_id} já está emprestado`);
            throw new Error('Este livro já está emprestado');
        }

        // 5. Cria o empréstimo
        const maxDays = rules.max_days || 7;
        const borrowedAt = new Date();
        const dueDate = new Date(borrowedAt);
        dueDate.setDate(borrowedAt.getDate() + maxDays);
        const dueDateISO = dueDate.toISOString();
        const loan = await LoansModel.createLoan(book_id, user.id, dueDateISO);
        console.log(`🟢 [LoansService] [ADMIN] Empréstimo criado com sucesso:`, loan);

        // Envia email de confirmação de novo empréstimo (não bloqueia se falhar)
        try {
            await EmailService.sendLoanConfirmationEmail({
                user_id: user.id,
                book_title: book.title,
                borrowedAt: borrowedAt
            });
        } catch (emailErr) {
            console.error(`🟡 [LoansService] [ADMIN] Erro ao enviar email de confirmação (empréstimo criado com sucesso):`, emailErr.message);
        }

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

    // Lista empréstimos ativos de um usuário específico
    async listActiveLoansByUser(userId) {
        console.log(`🔵 [LoansService] Listando empréstimos ativos do usuário: userId=${userId}`);
        const loans = await LoansModel.getLoansByUser(userId);
        const activeLoans = loans.filter(l => !l.returned_at);
        console.log(`🟢 [LoansService] Empréstimos ativos do usuário ${userId} encontrados: ${activeLoans.length}`);
        return activeLoans;
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
        // Envia email de confirmação de devolução (não bloqueia se falhar)
        if (loan) {
            try {
                await EmailService.sendReturnConfirmationEmail({
                    user_id: loan.student_id,
                    book_title: loan.book_title || book_id,
                    returnedAt: new Date()
                });
            } catch (emailErr) {
                console.error(`🟡 [LoansService] Erro ao enviar email de devolução (devolução registrada com sucesso):`, emailErr.message);
            }
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
        console.log('[DEBUG] Empréstimos do usuário:', JSON.stringify(loans, null, 2));
        console.log('[DEBUG] Lista de loan_id e returned_at:', loans.map(l => ({ loan_id: l.loan_id, typeof_loan_id: typeof l.loan_id, returned_at: l.returned_at, typeof_returned_at: typeof l.returned_at })));
        const loanIdNum = Number(loan_id);
        const loan = loans.find(l => Number(l.loan_id) === loanIdNum && (l.returned_at === null || l.returned_at === 'null'));
        console.log('[DEBUG] Tentando encontrar empréstimo ativo: loan_id=', loanIdNum, 'Encontrado:', loan);
        if (!loan) {
            console.error('[ERROR] Empréstimo não encontrado ou já devolvido. loan_id:', loan_id, 'user_id:', user_id);
            throw new Error('Empréstimo não encontrado ou já devolvido.');
        }
        // Verifica se o usuário tem algum empréstimo atrasado
        const now = new Date();
        const hasOverdue = loans.some(l => !l.returned_at && l.due_date && new Date(l.due_date) < now);
        if (hasOverdue) {
            console.error('[ERROR] Usuário possui empréstimo(s) atrasado(s). Não pode renovar.');
            throw new Error('Você possui livro(s) atrasado(s). Devolva-o(s) antes de renovar qualquer empréstimo.');
        }
        // Busca regras
        const rules = await RulesService.getRules();
        console.log('[DEBUG] Valor de renewals:', loan.renewals, 'Max:', rules.max_renewals);
        if ((loan.renewals ?? 0) >= rules.max_renewals) {
            console.error('[ERROR] Limite de renovações atingido. loan_id:', loan_id, 'renewals:', loan.renewals, 'max_renewals:', rules.max_renewals);
            throw new Error('Limite de renovações atingido.');
        }
        // Atualiza empréstimo
        await LoansModel.renewLoan(loan_id, rules.renewal_days);
        // Busca o empréstimo atualizado para pegar a nova data
        const updatedLoans = await LoansModel.getLoansByUser(user_id);
        const updatedLoan = updatedLoans.find(l => l.loan_id === loan_id && !l.returned_at);
        console.log('[DEBUG] Empréstimo após renovação:', updatedLoan);
        // Envia email de confirmação de renovação (não bloqueia se falhar)
        if (updatedLoan) {
            try {
                await EmailService.sendRenewalConfirmationEmail({
                    user_id,
                    book_title: updatedLoan.book_title,
                    due_date: updatedLoan.due_date
                });
            } catch (emailErr) {
                console.error(`🟡 [LoansService] Erro ao enviar email de renovação (renovação realizada com sucesso):`, emailErr.message);
            }
        }
        return {
            message: 'Empréstimo renovado com sucesso.',
            due_date: updatedLoan ? updatedLoan.due_date : null
        };
    }

    // Preview da renovação
    async previewRenewLoan(loan_id, user_id) {
        // Busca o empréstimo
        const loans = await LoansModel.getLoansByUser(user_id);
        const loanIdNum = Number(loan_id);
        const loan = loans.find(l => Number(l.loan_id) === loanIdNum && (l.returned_at === null || l.returned_at === 'null'));
        if (!loan) {
            throw new Error('Empréstimo não encontrado ou já devolvido.');
        }
        // Verifica se o usuário tem algum empréstimo atrasado
        const now = new Date();
        const hasOverdue = loans.some(l => !l.returned_at && l.due_date && new Date(l.due_date) < now);
        if (hasOverdue) {
            throw new Error('Você possui livro(s) atrasado(s). Devolva-o(s) antes de renovar qualquer empréstimo.');
        }
        // Busca regras
        const rules = await RulesService.getRules();
        if ((loan.renewals ?? 0) >= rules.max_renewals) {
            throw new Error('Limite de renovações atingido.');
        }
        // Calcula nova data de devolução (sempre a partir de hoje + renewal_days)
        const newDueDate = new Date(now);
        newDueDate.setDate(now.getDate() + (rules.renewal_days || 7));
        return {
            due_date: newDueDate.toISOString(),
            message: 'Nova data de devolução após renovação (calculada a partir de hoje).'
        };
    }

    // Preview da extensão
    async previewExtendLoan(loan_id, user_id) {
        const rules = await RulesService.getRules();
        const loans = await LoansModel.getLoansByUser(user_id);
        const loan = loans.find(l => Number(l.loan_id) === Number(loan_id) && !l.returned_at);
        if (!loan) throw new Error('Empréstimo não encontrado ou já devolvido.');
        // Verifica se o usuário tem algum empréstimo atrasado
        const now = new Date();
        const hasOverdue = loans.some(l => !l.returned_at && l.due_date && new Date(l.due_date) < now);
        if (hasOverdue) {
            throw new Error('Você possui livro(s) atrasado(s). Devolva-o(s) antes de estender qualquer empréstimo.');
        }
        if ((loan.renewals ?? 0) < rules.max_renewals) throw new Error('Extensão só disponível após atingir o limite de renovações.');
        if (loan.is_extended === 1) throw new Error('Empréstimo já está estendido.');
        if (!loan.due_date) throw new Error('Data de devolução não definida.');
        const dueDate = new Date(loan.due_date);
        if (dueDate < now) throw new Error('Empréstimo atrasado, não pode estender.');
        // Extensão será aplicada imediatamente: nova data = hoje + bloco
        const addedDays = (rules.renewal_days || 7) * (rules.extension_block_multiplier || 3);
        const newDue = new Date(now); newDue.setDate(now.getDate() + addedDays);
        return { new_due_date: newDue.toISOString(), added_days: addedDays };
    }

    // Extensão imediata
    async requestExtensionLoan(loan_id, user_id) {
        const rules = await RulesService.getRules();
        const loans = await LoansModel.getLoansByUser(user_id);
        const loan = loans.find(l => Number(l.loan_id) === Number(loan_id) && !l.returned_at);
        if (!loan) throw new Error('Empréstimo não encontrado ou já devolvido.');
        // Verifica se o usuário tem algum empréstimo atrasado
        const now = new Date();
        const hasOverdue = loans.some(l => !l.returned_at && l.due_date && new Date(l.due_date) < now);
        if (hasOverdue) {
            throw new Error('Você possui livro(s) atrasado(s). Devolva-o(s) antes de estender qualquer empréstimo.');
        }
        if ((loan.renewals ?? 0) < rules.max_renewals) throw new Error('Extensão só disponível após atingir o limite de renovações.');
        if (loan.is_extended === 1) throw new Error('Empréstimo já estendido.');
        if (!loan.due_date) throw new Error('Data de devolução não definida.');
        const dueDate = new Date(loan.due_date);
        if (dueDate < now) throw new Error('Empréstimo atrasado, não pode estender.');
        const addedDays = (rules.renewal_days || 7) * (rules.extension_block_multiplier || 3);
        await LoansModel.extendLoanBlock(loan_id, addedDays);
        const updated = await LoansModel.getLoanById(loan_id);
        // Envia email de confirmação de extensão (não bloqueia se falhar)
        if (updated) {
            try {
                await EmailService.sendExtensionConfirmationEmail({
                    user_id,
                    book_title: updated.book_title,
                    due_date: updated.due_date
                });
            } catch (emailErr) {
                console.error(`🟡 [LoansService] Erro ao enviar email de extensão (extensão realizada com sucesso):`, emailErr.message);
            }
        }
        return { message: 'Empréstimo estendido com sucesso.', due_date: updated?.due_date };
    }

    async processPendingExtensions() {
        return 0;
    }

    // Estende um empréstimo (aplicação manual/forçada)
    async extendLoan(loan_id, user_id) {
        const loan = await LoansModel.getLoanById(loan_id);
        const rules = await RulesService.getRules();
        if (!loan || loan.returned_at) throw new Error('Empréstimo não encontrado ou devolvido.');
        if (loan.is_extended === 1) throw new Error('Empréstimo já estendido.');
        if ((loan.renewals ?? 0) < rules.max_renewals) throw new Error('Extensão só após máximo de renovações.');
        const addedDays = (rules.renewal_days || 7) * (rules.extension_block_multiplier || 3);
        await LoansModel.extendLoanBlock(loan_id, addedDays);
        const updated = await LoansModel.getLoanById(loan_id);
        // Envia email de confirmação de extensão (não bloqueia se falhar)
        if (updated) {
            try {
                await EmailService.sendExtensionConfirmationEmail({
                    user_id,
                    book_title: updated.book_title,
                    due_date: updated.due_date
                });
            } catch (emailErr) {
                console.error(`🟡 [LoansService] Erro ao enviar email de extensão (extensão realizada com sucesso):`, emailErr.message);
            }
        }
        return { message: 'Empréstimo estendido com sucesso.', due_date: updated?.due_date };
    }

    async applyNudgeImpactIfNeeded(loan_id) {
        const rules = await RulesService.getRules();
        const loan = await LoansModel.getLoanById(loan_id);
        if (!loan || loan.returned_at) return { changed: false };
        // Nudge só se aplica a empréstimos estendidos
        if (loan.is_extended !== 1) return { changed: false };
        // Reduz o prazo para 5 dias apenas se o prazo atual for maior que 5 dias
        const shortenedTarget = rules.shortened_due_days_after_nudge || 5;
        const changed = await LoansModel.shortenDueDateIfLongerThan(loan_id, shortenedTarget);
        if (changed) {
            const updatedLoan = await LoansModel.getLoanById(loan_id);
            // Envia email de nudge de extensão (não bloqueia se falhar)
            try {
                await EmailService.sendExtensionNudgeEmail({
                    user_id: updatedLoan.student_id,
                    book_title: updatedLoan.book_title,
                    new_due_date: updatedLoan.due_date
                });
            } catch (emailErr) {
                console.error(`🟡 [LoansService] Erro ao enviar email de nudge (operação realizada com sucesso):`, emailErr.message);
            }
            return { changed: true, new_due_date: updatedLoan.due_date };
        }
        return { changed: false };
    }

    // Registra uso interno de livro (empréstimo fantasma - já devolvido)
    // Não verifica reserva didática pois é uso interno na biblioteca
    async registerInternalUse(book_id, book_code) {
        console.log(`🔵 [LoansService] [USO INTERNO] === INÍCIO DO REGISTRO ===`);
        console.log(`🔵 [LoansService] [USO INTERNO] book_id recebido: ${book_id} (tipo: ${typeof book_id})`);
        console.log(`🔵 [LoansService] [USO INTERNO] book_code recebido: ${book_code} (tipo: ${typeof book_code})`);

        // 1. Busca o livro pelo código ou ID
        let book;
        if (book_code) {
            // Primeiro tenta buscar como ID numérico direto
            if (!isNaN(book_code)) {
                console.log(`🟡 [LoansService] [USO INTERNO] Tentando buscar como ID: ${book_code}`);
                book = await BooksModel.getBookById(Number(book_code));
                if (book) {
                    book_id = book.id;
                    console.log(`🟢 [LoansService] [USO INTERNO] Livro encontrado por ID. ID: ${book_id}, Código: ${book.code}, Título: ${book.title}`);
                }
            }
            
            // Se não encontrou por ID, busca pelo código
            if (!book) {
                console.log(`🟡 [LoansService] [USO INTERNO] Buscando pelo código: "${book_code}"`);
                const books = await BooksModel.getBooks(null, null, null, null);
                book = books.find(b => String(b.code) === String(book_code));
                
                if (!book) {
                    console.warn(`🔴 [LoansService] [USO INTERNO] Livro não encontrado`);
                    console.warn(`🔴 [LoansService] [USO INTERNO] Valor buscado: "${book_code}"`);
                    console.warn(`🟡 [LoansService] [USO INTERNO] Formato esperado de código: "BIO-01.01", "FIS-01.01", etc.`);
                    throw new Error(`Livro não encontrado. Use o ID do livro ou código no formato "AREA-XX.XX"`);
                }
                book_id = book.id;
                console.log(`🟢 [LoansService] [USO INTERNO] Livro encontrado por código. ID: ${book_id}, Título: ${book.title}`);
            }
        } else {
            // Busca pelo ID
            book = await BooksModel.getBookById(book_id);
            if (!book) {
                console.warn(`🟡 [LoansService] [USO INTERNO] Livro id ${book_id} não encontrado`);
                throw new Error('Livro não encontrado');
            }
        }

        // Log se o livro está em reserva didática (apenas informativo)
        if (book.is_reserved === 1) {
            console.log(`🟡 [LoansService] [USO INTERNO] Registrando uso de livro em reserva didática: ${book.title}`);
        }

        // 2. Cria um empréstimo de uso interno (já devolvido) em uma única operação
        const rules = await RulesService.getRules();
        const maxDays = rules.max_days || 7;
        const borrowedAt = new Date();
        const dueDate = new Date(borrowedAt);
        dueDate.setDate(borrowedAt.getDate() + maxDays);
        const dueDateISO = dueDate.toISOString();

        // Cria o empréstimo já com returned_at preenchido
        const result = await LoansModel.createInternalUseLoan(book_id, dueDateISO);
        
        console.log(`🟢 [LoansService] [USO INTERNO] Uso interno registrado com sucesso para livro ${book_id} - ${book.title}`);
        
        return { 
            success: true, 
            message: 'Uso interno registrado com sucesso',
            book_id,
            book_title: book.title,
            was_reserved: book.is_reserved === 1
        };
    }
}

module.exports = new LoansService();