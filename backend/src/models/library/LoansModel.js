const { getQuery, allQuery, executeQuery } = require('../../database/db');
const UsersModel = require('./UsersModel');
const BooksModel = require('./BooksModel');
        
/**
 * Model responsável pelo acesso ao banco de dados para empréstimos de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

class LoansModel {

    constructor() {
        this.bookFields = ['id', 'code', 'area', 'subarea', 'title', 'subtitle', 'authors', 'edition', 'volume', 'language', 'status'];
        this.bookSelect = this.bookFields.map(f => `b.${f} AS book_${f}`).join(', ');
        this.userFields = ['id', 'role', 'name', 'NUSP', 'email', 'phone', 'class'];
        this.userSelect = this.userFields.map(f => `u.${f} AS user_${f}`).join(', ');
    }
    
    // Cria um novo empréstimo
    async createLoan(book_id, user_id, due_date) {
        console.log(`🔵 [LoansModel] Criando empréstimo: book_id=${book_id}, user_id=${user_id}`);
        const dueDateSql = due_date.replace('T', ' ').replace(/\..*$/, '');
        try {
            // Primeiro, insere o empréstimo
            const insertSql = `INSERT INTO loans (book_id, user_id, borrowed_at, due_date, renewals) VALUES (?, ?, CURRENT_TIMESTAMP, ?, 0)`;
            const insertParams = [book_id, user_id, dueDateSql];
            await executeQuery(insertSql, insertParams);

            // Depois, atualiza o status do livro
            const updateSql = `UPDATE books SET status = 'emprestado' WHERE id = ?`;
            await executeQuery(updateSql, [book_id]);

            console.log(`🟢 [LoansModel] Empréstimo criado e livro atualizado em transação.`);
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro na transação de empréstimo: ${err.message}`);
            throw err;
        }
    }
    
    // Registra devolução de um empréstimo
    async returnBook(loan_id, book_id) {
        console.log(`🔵 [LoansModel] Registrando devolução do empréstimo: loan_id=${loan_id}`);
        try {
            // Primeiro, atualiza o empréstimo (marca como devolvido)
            await executeQuery(
                `UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
                [loan_id]
            );
            // Depois, atualiza o status do livro
            await executeQuery(
                `UPDATE books SET status = 'disponível' WHERE id = ?`,
                [book_id]
            );
            console.log(`🟢 [LoansModel] Devolução registrada e livro atualizado para disponível: loan_id=${loan_id}`);
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao registrar devolução: ${err.message}`);
            throw err;
        }
    }

    // Cria um empréstimo de uso interno (fantasma - já devolvido)
    // Padroniza user_id = 2 (proaluno) para indicar uso interno
    async registerInternalUse(book_id) {
        console.log(`🔵 [LoansModel] Criando empréstimo de uso interno: book_id=${book_id}`);
        try {
            await executeQuery(
                `INSERT INTO loans (book_id, user_id, borrowed_at, due_date, renewals, returned_at) 
                VALUES (?, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP)`,
                [book_id]
            );
            console.log(`🟢 [LoansModel] Empréstimo de uso interno criado com sucesso para livro_id=${book_id}`);
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao criar empréstimo de uso interno: ${err.message}`);
            throw err;
        }
    }

    // Busca empréstimos de um livro específico (opcionalmente apenas ativos)
    async getLoansByBookId(book_id, activeOnly = false) {
        console.log(`🔵 [LoansModel] Buscando empréstimos para o livro ID ${book_id}${activeOnly ? " (ativos apenas)" : ""}`);
        
        let sql = `SELECT l.*, ${this.bookSelect}, ${this.userSelect}
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.book_id = ?`;
        const params = [book_id];
        if (activeOnly) {
            sql += ` AND returned_at IS NULL`;
        }
        sql += ` ORDER BY l.borrowed_at DESC`;

        try {
          const rows = await allQuery(sql, params);
          console.log(`🟢 [LoansModel] Empréstimos encontrados para o livro ID ${book_id}: ${rows.length}`);
          if(rows.length > 1 && activeOnly) {
              console.error(`🔴 [LoansModel] Atenção: mais de um empréstimo ativo encontrado para o livro ID ${book_id}. Verifique a integridade dos dados.`);
              throw new Error(`Integridade de dados comprometida: múltiplos empréstimos ativos para o mesmo livro (ID ${book_id}). Contate o suporte.`);
          }
          // Retorna objeto com detalhes do empréstimo, livro e usuário aninhados
          return rows.map(row => this._parseLoanRow(row));
        } catch (err) {
          console.error(`🔴 [LoansModel] Erro ao buscar empréstimos para o livro ID ${book_id}: ${err.message}`);
          throw err;
        } 
    }

    // Busca todos os empréstimos da DB com o status fornecido (active, returned ou all)
    async getAllLoans(status) {
        console.log("🔵 [LoansModel] Buscando todos os empréstimos com detalhes completos");
        
        // Monta SQL dinâmico com LEFT JOIN para incluir detalhes do livro e do usuário
        let sql = `
            SELECT l.*, ${this.bookSelect}, ${this.userSelect}
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            LEFT JOIN users u ON l.user_id = u.id
        `;

        // Filtra por status se necessário
        if (status === 'active') {
            sql += ` WHERE l.returned_at IS NULL`;
        } else if (status === 'returned') {
            sql += ` WHERE l.returned_at IS NOT NULL`;
        }
        sql += ` ORDER BY l.borrowed_at DESC`;

        try {
            const rows = await allQuery(sql);
            console.log(`🟢 [LoansModel] Empréstimos encontrados: ${rows.length}`);
            // Retorna objeto com detalhes do empréstimo e do livro aninhados
            return rows.map(row => this._parseLoanRow(row));
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos: ${err.message}`);
            throw err;
        }
    }

    // Busca empréstimos de um usuário específico
    async getLoansByUser(user_id, status) {
        console.log(`🔵 [LoansModel] Buscando empréstimos do usuário: ${user_id} (status=${status})`);
        
        // Monta SQL dinâmico com LEFT JOIN para incluir detalhes do livro
        let sql = `
            SELECT l.*, ${this.bookSelect}
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            WHERE l.user_id = ?
        `;
        const params = [user_id];

        // Filtra por status se necessário
        if (status === 'active') {
            sql += ` AND l.returned_at IS NULL`;
        } else if (status === 'returned') {
            sql += ` AND l.returned_at IS NOT NULL`;
        }
        sql += ` ORDER BY l.borrowed_at DESC`;

        try {
            const rows = await allQuery(sql, params);
            console.log(`🟢 [LoansModel] Empréstimos encontrados para o usuário ${user_id}: ${rows.length}`);
            // Retorna objeto com detalhes do empréstimo e do livro aninhados
            return rows.map(row => this._parseLoanRow(row));
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos do usuário: ${err.message}`);
            throw err;
        }
    }

    // Busca um empréstimo pelo ID
    async getLoanById(loan_id) {
        // Monta SQL dinâmico com LEFT JOIN para incluir detalhes do livro e do usuário
        let sql = `
            SELECT l.*, ${this.bookSelect}, ${this.userSelect}
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.id = ?
        `;
        try {
            const row = await getQuery(sql, [loan_id]);
            if (!row) {
                console.warn(`🟡 [LoansModel] Empréstimo não encontrado: loan_id=${loan_id}`);
                return null;
            }
            console.log(`🟢 [LoansModel] Empréstimo encontrado: loan_id=${loan_id}`);
            return this._parseLoanRow(row);
        } catch(err) {
            console.log(`🔴 [LoansModel] Erro ao buscar empréstimo por ID: ${err.message}`);
            throw err;
        }
    }

    // Renova um empréstimo
    async renewLoan(loan_id, new_due_date) {
        console.log(`🔵 [LoansModel] Renovando empréstimo: loan_id=${loan_id}, new_due_date=${new_due_date}`);

        try {
            await executeQuery(
                `UPDATE loans SET renewals = renewals + 1, due_date = ? WHERE id = ? AND returned_at IS NULL`,
                [new_due_date, loan_id]
            )
            console.log(`🟢 [LoansModel] Empréstimo renovado com sucesso: loan_id=${loan_id}`);
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao renovar empréstimo: ${err.message}`);
            throw err;
        }
    }

    // Conta empréstimos com status ('all', 'active', 'returned')
    async countLoans(status = 'all') {
        let sql = `SELECT COUNT(*) as count FROM loans`;
        
        // Filtra por status se necessário
        if (status === 'active') {
            sql += ` WHERE returned_at IS NULL`;
        } else if (status === 'returned') {
            sql += ` WHERE returned_at IS NOT NULL`;
        }
        sql += ` ORDER BY borrowed_at DESC`;

        try {
            const result = await getQuery(sql);
            const count = result.count;
            console.log(`🟢 [LoansModel] Total de empréstimos contados: ${count} (status: ${status})`);
            return count;
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao contar empréstimos: ${err.message} (status: ${status})`);
            throw err;
        }
    }

    // Método auxiliar para montar objeto de empréstimo com detalhes do livro e do usuário a partir de uma linha SQL
    _parseLoanRow(row) {
        const book = {};
        const user = {};
        const loan = {};
        Object.entries(row).forEach(([key, value]) => {
            if (key.startsWith('book_')) {
                book[key.replace('book_', '')] = value;
            } else if (key.startsWith('user_')) {
                user[key.replace('user_', '')] = value;
            } else {
                loan[key] = value;
            }
        });
        // Só inclui se houver campos com dados aninhados
        if (Object.keys(book).length > 1) {
            loan.book = book;
        } else { // só tem book_id, então inclui como campo simples
            loan.book_id = book[0];
        } 
        if (Object.keys(user).length > 1) {
            loan.user = user;
            loan.user_id = user.id;
        } else { // só tem user_id, então inclui como campo simples
            loan.user_id = user.id;
        }
        return loan;
    }
    /* ======================= NÃO UTILIZADAS ATUALMENTE ======================= */

    // Registra o último nudge enviado para um empréstimo
    async setLastNudged(loan_id) {
        return executeQuery(
            `UPDATE loans SET last_nudged_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [loan_id]
        ).then(() => {
            return;
        }).catch((err) => {
            throw err;
        });
    }

    // Encurta o prazo de um empréstimo estendido para 5 dias a partir de agora
    async shortenDueDateIfLongerThan(loan_id, targetDaysFromNow) {
        return executeQuery(
            `UPDATE loans
                    SET due_date = datetime('now', '+'|| ? ||' days')
                    WHERE id = ?
                      AND returned_at IS NULL
                      AND is_extended = 1
                      AND (due_date IS NULL OR due_date > datetime('now', '+'|| ? ||' days'))`,
            [targetDaysFromNow, loan_id, targetDaysFromNow]
        ).then((result) => {
            return result.changes > 0;
        }).catch((err) => {
            throw err;
        });
    }
};

module.exports = new LoansModel();