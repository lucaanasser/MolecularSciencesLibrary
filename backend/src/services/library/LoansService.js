const LoansModel = require('../../models/library/LoansModel');
const UsersModel = require('../../models/library/UsersModel');
const BooksModel = require('../../models/library/BooksModel');
const RulesService = require('../utilities/RulesService');
const EmailService = require('../utilities/EmailService');
const UsersService = require('./UsersService');
const BooksService = require('./BooksService');

/**
 * Service responsável pela lógica de negócio dos empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
class LoansService {

    /**
     * Realiza empréstimo normal (com senha do usuário).
     * @param {number} book_id - ID do livro
     * @param {number} NUSP - Identificador do usuário
     * @param {string} password - Senha do usuário
     */
    async borrowBook(book_id, NUSP, password) {
        console.log(`🔵 [LoansService] Iniciando processo de empréstimo: book_id=${book_id}, NUSP=${NUSP}`);
        try {
            await this._borrowBookCore(book_id, NUSP, password, true);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao realizar empréstimo: ${err.message}`);
            throw err;
        }
    }

    /**
     * Realiza empréstimo como admin (sem senha).
     * @param {number} book_id - ID do livro
     * @param {number} NUSP - Identificador do usuário
     * @returns {Promise<Object>} Dados do empréstimo criado
     */
    async borrowBookAsAdmin(book_id, NUSP) {
        console.log(`🔵 [LoansService] [ADMIN] Iniciando processo de empréstimo: book_id=${book_id}, NUSP=${NUSP}`);
        try {
            await this._borrowBookCore(book_id, NUSP, null, false);
        } catch (err) {
            console.error(`🔴 [LoansService] [ADMIN] Erro ao realizar empréstimo: ${err.message}`);
            throw err;
        }
    }
 
    /**
     * Registra a devolução de um livro.
     * Busca o empréstimo ativo do livro, registra a devolução,
     * atualiza o status do livro para disponível e envia email de confirmação.
     * @param {number} book_id - ID do livro a ser devolvido
     * @returns {Promise<Object>} Dados do empréstimo devolvido
     * @throws {Error} Caso não encontre empréstimo ativo ou ocorra erro na devolução
     */
    async returnBook(book_id) {
        
        // Busca o empréstimo do livro
        const loans = await LoansModel.getLoansByBookId(book_id, true); // activeOnly = true
        if (!loans || loans.length === 0) {
            console.warn(`🟡 [LoansService] Nenhum empréstimo ativo encontrado para o livro ${book_id}`);
            throw new Error('Nenhum empréstimo ativo encontrado para este livro.');
        }
        
        // Registra a devolução
        const loan = loans[0];
        try {
            await LoansModel.returnBook(loan.id, book_id);
            console.log(`🟢 [LoansService] Devolução registrada com sucesso para loan_id=${loan.id}`);
        } catch(err) {
            console.error(`🔴 [LoansService] Erro ao registrar devolução: ${err.message}`);
            throw err;
        }

        // Envia email de confirmação de devolução
        try {
            console.log(`🔵 [LoansService] Enviando email de confirmação de devolução para usuário ${loan.user.name}`);
            await EmailService.sendReturnConfirmationEmail({ user: loan.user, book_title: loan.book.title });
        } catch (emailErr) {
            console.warn(`🟡 [LoansService] Erro ao enviar email de devolução (devolução registrada com sucesso):`, emailErr.message);
        }
        
        console.log(`🟢 [LoansService] Devolução registrada para empréstimo:`, loan.id);
    }

    /**
     * Registra uso interno de um livro.
     * Cria um registro de empréstimo para controle interno, marcando o livro como utilizado,
     * mas já devolvido, sem alterar o status para 'emprestado' nem enviar e-mail ao usuário.
     * 
     * @param {number} book_id - ID do livro utilizado internamente
     * @returns {Promise<Object>} Resultado do registro ({success: true/false, loan_id: number})
     * @throws {Error} Caso o livro não seja encontrado ou ocorra erro no processo
     */
    async registerInternalUse(book_id) {
        console.log(`🔵 [LoansService] Iniciando registro de uso interno para book_id=${book_id}`);
        
        // Busca o livro pelo ID
        try {
            console.log(`🔵 [LoansService] Buscando livro por ID: ${book_id}`);
            await BooksModel.getBookById(book_id);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar livro: ${err.message}`);
            throw err;
        }
        
        // Cria o empréstimo fantasma
        try {
            console.log(`🔵 [LoansService] Registrando uso interno para livro ${book_id}`);
            await LoansModel.registerInternalUse(book_id);
            console.log(`🟢 [LoansService] Uso interno registrado com sucesso para livro ${book_id} - ${book.title}`);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao registrar uso interno: ${err.message}`);
            throw err;
        }
    }

    /**
     * Busca empréstimos com filtro de status.
     * @param {'all'|'active'|'returned'} status
     */
    async getLoans(status = 'all') {
        console.log(`🔵 [LoansService] Buscando empréstimos (status=${status})`);
        try {
            const loans = await LoansModel.getAllLoans(status);
            console.log(`🟢 [LoansService] Empréstimos buscados com sucesso: ${loans.length} encontrados`);
            return loans;
        }
        catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar empréstimos: ${err.message}`);
            throw err;
        }
    }

    /**
     * Busca empréstimos de um usuário com filtro de status.
     * @param {number} userId
     * @param {'all'|'active'|'returned'} status
     */
    async getUserLoans(userId, status = 'all') {
        console.log(`🔵 [LoansService] Buscando empréstimos do usuário ${userId} (status=${status})`);
        try {
            const loans = await LoansModel.getLoansByUser(userId, status);
            console.log(`🟢 [LoansService] Empréstimos encontrados para o usuário ${userId}: ${loans.length}`);
            return loans;
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar empréstimos do usuário ${userId}: ${err.message}`);
            throw err;
        }
    }

    /**
     * Gera uma prévia da renovação de um empréstimo.
     * Verifica se o empréstimo pode ser renovado de acordo com as regras do sistema,
     * retorna a nova data de devolução sugerida e o número de renovações restantes.
     * Não realiza a renovação, apenas informa ao usuário o resultado possível.
     * 
     * @param {number} loan_id - ID do empréstimo
     * @param {number} user_id - ID do usuário solicitante
     * @returns {Promise<{ new_due_date: string, renewals_left: number, message: string }>}
     * @throws {Error} Caso o empréstimo não seja encontrado, já tenha sido devolvido, não pertença ao usuário ou não possa ser renovado
     */
    async previewRenewLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Preview de renovação: loan_id=${loan_id}, user_id=${user_id}`);
        
        // Busca empréstimo do livro e checa se está ativo e pertence ao usuário
        const loan = await LoansModel.getLoanById(loan_id);
        if (!loan) {
            console.warn(`🟡 [LoansService] Empréstimo não encontrado: loan_id=${loan_id}`);
            throw new Error('Empréstimo não encontrado.');
        }
        if (loan.returned_at) {
            console.warn(`🟡 [LoansService] Empréstimo já devolvido: loan_id=${loan_id}`);
            throw new Error('Empréstimo já foi devolvido.');
        }
        if (Number(loan.user_id) !== Number(user_id)) {
            console.warn(`🟡 [LoansService] Este empréstimo não pertence ao usuário: user_id=${user_id}, loan_id=${loan_id}`);
            throw new Error('Este empréstimo não pertence ao usuário informado.');
        }
        
        // Checa se o empréstimo pode ser renovado de acordo com as regras
        const check = await this._checkRenewRules(user_id, loan);
        if (!check.allowed) {
            console.warn(`🟡 [LoansService] Renovação não permitida: ${check.reason}`);
            throw new Error(check.reason || 'Renovação não permitida.');
        }
        
        console.log(`🟢 [LoansService] Preview de renovação bem-sucedido: loan_id=${loan_id}, nova due_date=${check.new_due_date}`);
        return {
            new_due_date: check.new_due_date,
            renewals_left: check.renewals_left,
            message: 'Nova data de devolução após renovação (calculada a partir de hoje).'
        };
    }

    /**
     * Realiza a renovação de um empréstimo.
     * Valida se a renovação é permitida, atualiza a data de devolução,
     * envia email de confirmação e retorna informações relevantes.
     * 
     * @param {number} loan_id - ID do empréstimo
     * @param {number} user_id - ID do usuário solicitante
     * @returns {Promise<{ message: string, new_due_date: string, renewals_left?: number }>}
     * @throws {Error} Caso a renovação não seja permitida ou ocorra erro no processo
     */
    async renewLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Renovando empréstimo: loan_id=${loan_id}${user_id ? ", user_id=" + user_id : ''}`);

        // Valida a renovação e calcula a nova due_date
        let preview;
        try {
            console.log(`🔵 [LoansService] Validando renovação para loan_id=${loan_id}, user_id=${user_id}`);
            preview = await this.previewRenewLoan(loan_id, user_id);
        } catch (err) {
            console.error(`🔴 [LoansService] Renovação não permitida: ${err.message}`);
            throw err;
        }

        // Atualiza empréstimo usando a due_date calculada
        try {
            console.log(`🔵 [LoansService] Atualizando empréstimo com nova due_date: loan_id=${loan_id}, new_due_date=${preview.new_due_date}`);
            await LoansModel.renewLoan(loan_id, preview.new_due_date);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao atualizar empréstimo: ${err.message}`);
            throw err;
        }

        // Busca dados do empréstimo atualizado
        let loan;
        try {
            console.log(`🔵 [LoansService] Buscando dados do empréstimo atualizado: loan_id=${loan_id}`);
            loan = await LoansModel.getLoanById(loan_id);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar dados do empréstimo atualizado: ${err.message}`);
            throw err;
        }

        // Envia email de confirmação de renovação
        try {
            await EmailService.sendRenewalConfirmationEmail({
                user: loan.user,
                book_title: loan.book.title,
                due_date: preview.new_due_date
            });
        } catch (emailErr) {
            console.error(`🟡 [LoansService] Erro ao enviar email de renovação (renovação realizada com sucesso):`, emailErr.message);
        }

        console.log(`🟢 [LoansService] Empréstimo renovado com sucesso: loan_id=${loan_id}`);
        return loan;
    }  

    /**
     * Verifica se um empréstimo está atrasado.
     * Considera atrasado se não foi devolvido e a data de devolução já passou em relação à data atual.
     * 
     * @param {Object} loan - Objeto do empréstimo
     * @returns {boolean} true se o empréstimo está atrasado, false caso contrário
     */
    isLoanOverdue(loan) {
        if (!loan || loan.returned_at) return false;
        if (!loan.due_date){
            console.warn(`🟡 [LoansService] Empréstimo sem due_date definido: loan_id=${loan.id}`);
            throw new Error('Empréstimo sem data de devolução definida.');
        }
        const due = new Date(loan.due_date.replace(' ', 'T'));
        return due < new Date();
    }

    /**
     * Conta empréstimos com filtro de status.
     * @param {'all'|'active'|'returned'} status
     * 
     * OBSERVAÇÃO: Atualmente não está na rota pois só é usada internamente por ReportsService
     */
    async countLoans(status = 'all') {
        console.log(`🔵 [LoansService] Contando total de empréstimos com status "${status}"`);
        try {
            const result =  await LoansModel.countLoans(status);
            console.log(`🟢 [LoansService] Contagem de empréstimos concluída: ${result}`);
            return result;
        } catch (error) {
            console.error(`🔴 [LoansService] Erro ao contar empréstimos: ${error.message}`);
            throw error;
        }
    }

    /* ==================== Funções auxiliares ==================== */
    
    /**
     * Função auxiliar que valida e realiza a criação do empréstimo.
     * Responsável por todas as regras de negócio, validações,
     * criação do empréstimo, atualização do status do livro para 'emprestado'
     * e envio do e-mail de confirmação ao usuário.
     * É utilizada tanto por borrowBook (usuário) quanto por borrowBookAsAdmin (admin).
     * 
     * @param {number} book_id - ID do livro a ser emprestado
     * @param {string} NUSP - Identificador do usuário
     * @param {string|null} password - Senha do usuário (ou null para admin)
     * @param {boolean} requirePassword - Se true, exige validação de senha
     * @returns {Promise<Object>} Dados do empréstimo criado
     * @throws {Error} Caso alguma validação falhe ou ocorra erro no processo
     */
    async _borrowBookCore(book_id, NUSP, password, requirePassword = true) {
        console.log(`🔵 [LoansService] Iniciando processo de empréstimo: book_id=${book_id}, NUSP=${NUSP}, requirePassword=${requirePassword}`);
        
        // Valida usuário
        let user;
        try {
            console.log(`🔵 [LoansService] Buscando usuário por NUSP: ${NUSP}`);
            user = await UsersService.getUserByNUSP(NUSP);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar usuário: ${err.message}`);
            throw err;
        }

        // Valida senha (se requirePassword)
        if (requirePassword){
          try {
              console.log(`🔵 [LoansService] Validando senha para usuário NUSP: ${NUSP}`);
              await UsersService.authenticateUser(NUSP, password);
          } catch(err) {
              console.error(`🔴 [LoansService] Erro ao validar senha: ${err.message}`);
              throw err;
          }
        }

        // Valida livro
        let book;
        try {
            console.log(`🔵 [LoansService] Buscando livro por ID: ${book_id}`);
            book = await BooksService.getBookById(book_id);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar livro: ${err.message}`);
            throw err;
        }

        // Valida regras de empréstimo
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

        // Realiza o empréstimo
        try {
            console.log(`🔵 [LoansService] Criando empréstimo para usuário ${user.id} e livro ${book_id}`);
            await LoansModel.createLoan(book_id, user.id, rulesCheck.due_date);
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao criar empréstimo: ${err.message}`);
            throw err;
        }
        
        console.log(`🟢 [LoansService] Empréstimo criado com sucesso:`);

        try {
            console.log(`🔵 [LoansService] Enviando email de confirmação de empréstimo para usuário ${user.id}`);
            await EmailService.sendLoanConfirmationEmail({user, book_title: book.title});
        } catch (emailErr) {
            console.warn(`🟡 [LoansService] Erro ao enviar email de confirmação: ${emailErr.message}`);
        }
    }

    /**
     * Verifica se o usuário pode pegar o livro emprestado, de acordo com as regras do sistema.
     * Recebe user e book, retorna objeto com allowed, reason e due_date calculada.
     * Regras:
     * 1. Limite de empréstimos ativos por usuário
     * 2. Livro disponível (não reservado didaticamente e não emprestado)
     * 3. Calcula due_date segundo as regras
     * 
     * @param {number} user_id - ID do usuário
     * @param {Object} book - Livro
     * @returns {Promise<{ allowed: boolean, reason: string, due_date?: string }>}
     */
    async _checkLoanRules(user_id, book) {
        let rules;
        try {
            rules = await RulesService.getRules();
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar regras: ${err.message}`);
            throw err;
        }

        // 1. Verifica se o usuário atingiu o limite de empréstimos ativos
        const userActiveLoans = await this.getUserLoans(user_id, 'active');
        const maxActiveLoans = rules.max_books_per_user;
        if (userActiveLoans.length >= maxActiveLoans) {
            return {
                allowed: false,
                reason: `Limite de ${maxActiveLoans} empréstimos ativos atingido.`,
            };
        }

        // 2. Verifica se o livro está disponível
        if (book.status != 'disponível') {
            return {
                allowed: false,
                reason: 'Este livro não está disponível para empréstimo no momento. Status: ' + book.status,
            };
        }

        // 3. Calcula due_date de acordo com as regras
        const maxDays = rules.max_days;
        const borrowedAt = new Date();
        const dueDate = new Date(borrowedAt);
        dueDate.setDate(borrowedAt.getDate() + maxDays);
        const dueDateISO = dueDate.toISOString();

        return {
            allowed: true,
            reason: '',
            due_date: dueDateISO,
        };
    }

    /**
     * Verifica se o empréstimo pode ser renovado, de acordo com as regras do sistema.
     * Regras:
     * 1. Usuário não pode ter empréstimos atrasados
     * 2. Não pode exceder o limite de renovações do livro
     * 3. Calcula nova due_date segundo as regras
     * 
     * @param {number} user_id - ID do usuário
     * @param {Object} loan - Empréstimo a ser renovado
     * @returns {Promise<{ allowed: boolean, reason: string, renewals_left?: number, new_due_date?: string }>}
     */
    async _checkRenewRules(user_id, loan) {
        const rules = await RulesService.getRules();

        // 1. Busca empréstimos atrasados do usuário
        let userLoans;
        try {
            console.log(`🔵 [LoansService] Verificando empréstimos atrasados para usuário ${user_id}`);
            userLoans = await this.getUserLoans(user_id, 'active');
        } catch (err) {
            console.error(`🔴 [LoansService] Erro ao buscar empréstimos do usuário para verificação de atrasos: ${err.message}`);
            throw err;
        }
        const hasOverdue = userLoans.some(l => l.is_overdue);
        if (hasOverdue) {
            return { 
              allowed: false, 
              reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de renovar qualquer empréstimo.' 
            };
        }

        // 2. Verifica se usuário atingiu limite de renovações
        const maxRenewals = rules.max_renewals;
        const renewalsDone = loan.renewals;
        const renewalsLeft = maxRenewals - renewalsDone;
        if (renewalsDone >= maxRenewals) {
            return { allowed: false, reason: 'Limite de renovações atingido.', renewals_left: 0 };
        }

        // 3. Calcula nova due_date pelas regras
        const renewalDays = rules.renewal_days || 7;
        const nowDate = new Date();
        const newDueDate = new Date(nowDate);
        newDueDate.setDate(nowDate.getDate() + renewalDays);

        return {
            allowed: true,
            reason: '',
            renewals_left: renewalsLeft,
            new_due_date: newDueDate.toISOString()
        };
    }


    /* ================= Funções de extensão (atualmente não utilizadas) ================= */

    // Preview da extensão
    async previewExtendLoan(loan_id, user_id) {
        console.log(`🔵 [LoansService] Preview de extensão: loan_id=${loan_id}, user_id=${user_id}`);
        
        // 1. Busca empréstimo, livro e usuário
        const loan = await LoansModel.getLoanById(loan_id);
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
        const check = await this._checkExtensionRules(user, book);
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
                user_id: updatedLoan.user_id,
                book_title: updatedLoan.book_title,
                new_due_date: updatedLoan.due_date
            });
            console.log(`🟢 [LoansService] Email de nudge enviado para user_id=${updatedLoan.user_id}, loan_id=${loan_id}`);
        } catch (emailErr) {
            console.error(`🟡 [LoansService] Erro ao enviar email de nudge (operação realizada com sucesso):`, emailErr.message);
        }

        console.log(`🟢 [LoansService] Nudge de extensão aplicado com sucesso: loan_id=${loan_id}, nova due_date=${updatedLoan.due_date}`);
        return { changed: true, new_due_date: updatedLoan.due_date };
    }

    /**
     * Verifica se o empréstimo pode ser estendido, de acordo com as regras do sistema.
     * RECEBE user, book e loan.
     * RETORNA { allowed: boolean, reason: string }
     */
    async _checkExtensionRules(user, book) {
        const rules = await RulesService.getRules();
       
        // Busca empréstimo do livro e checa se está ativo e pertence ao usuário
        const loan = await LoansModel.getLoanById(loan_id);
        if (!loan) {
            console.warn(`🟡 [LoansService] Empréstimo não encontrado: loan_id=${loan_id}`);
            throw new Error('Empréstimo não encontrado.');
        }
        if (loan.returned_at) {
            console.warn(`🟡 [LoansService] Empréstimo já devolvido: loan_id=${loan_id}`);
            throw new Error('Empréstimo já foi devolvido.');
        }
        if (Number(loan.user_id) !== Number(user_id)) {
            console.warn(`🟡 [LoansService] Este empréstimo não pertence ao usuário: user_id=${user_id}, loan_id=${loan_id}`);
            throw new Error('Este empréstimo não pertence ao usuário informado.');
        }
        
        // 2. Verifica se o empréstimo já foi estendido
        if (loan.is_extended === 1) {
            return { allowed: false, reason: 'Empréstimo já está estendido.' };
        }
        // 3. Verifica se atingiu o limite de renovações
        if ((loan.renewals ?? 0) < rules.max_renewals) {
            return { allowed: false, reason: 'Extensão só disponível após atingir o limite de renovações.' };
        }
        // 4. Verifica se a data de devolução está definida e não está atrasado
        if (!loan.due_date) {
            return { allowed: false, reason: 'Data de devolução não definida.' };
        }
        const now = new Date();
        const dueDate = new Date(loan.due_date);
        if (dueDate < now) {
            return { allowed: false, reason: 'Empréstimo atrasado, não pode estender.' };
        }
        // 5. Verifica se o usuário tem empréstimos atrasados
        const allLoans = await LoansModel.getLoansByUser(user.id);
        const hasOverdue = allLoans.some(l => l.book.status);
        if (hasOverdue) {
            return { allowed: false, reason: 'Você possui livro(s) atrasado(s). Devolva-o(s) antes de estender qualquer empréstimo.' };
        }
        // Outras regras podem ser adicionadas aqui...
        return { allowed: true, reason: '' };
    }


}

module.exports = new LoansService();