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

module.exports = {

    /* ======================= Funções usadas em LoansService ======================= */

    // Cria um novo empréstimo
    createLoan: async (book_id, student_id, due_date) => {
        console.log(`🔵 [LoansModel] Criando empréstimo (transação): book_id=${book_id}, student_id=${student_id}`);
        
        // 1. Converte due_date para formato SQL
        let dueDateSql = due_date;
        if (due_date && typeof due_date === 'string') {
            dueDateSql = due_date.replace('T', ' ').replace(/\..*$/, '');
        }
        // 2. Executa a transação para criar o empréstimo
        try {
            const result = await executeQuery(
                `INSERT INTO loans (book_id, student_id, due_date, renewals) VALUES (?, ?, ?, 0)`,
                [book_id, student_id, dueDateSql]
            );
            console.log(`🟢 [LoansModel] Empréstimo criado e livro atualizado em transação.`);
            return { success: true, loan_id: result.lastID, updated: true };
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro na transação de empréstimo: ${err.message}`);
            return { success: false, loan_id: null, updated: false, error: err.message };
        }
    },

    // Busca empréstimo ativo para um livro
    getActiveLoanByBookId: (bookId) => {
        console.log(`🔵 [LoansModel] Buscando empréstimo ativo para o livro ${bookId}`);
        return getQuery(
            `SELECT id as loan_id FROM loans WHERE book_id = ? AND returned_at IS NULL`,
            [bookId]
        ).then((row) => {
            if (row) {
                console.log(`🟢 [LoansModel] Empréstimo ativo encontrado:`, row);
            } else {
                console.warn(`🟡 [LoansModel] Nenhum empréstimo ativo encontrado para o livro ${bookId}`);
            }
            return row;
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimo ativo: ${err.message}`);
            throw err;
        });
    },

    // Registra devolução de um empréstimo
    returnBook: (loan_id) => {
        console.log(`🔵 [LoansModel] Registrando devolução do empréstimo: loan_id=${loan_id}`);
        return executeQuery(
            `UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ? AND returned_at IS NULL`,
            [loan_id]
        ).then((result) => {
            const updated = result.changes > 0;
            console.log(`🟢 [LoansModel] Devolução registrada para empréstimo id: ${loan_id}`);
            return { success: updated, loan_id, updated };
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao registrar devolução: ${err.message}`);
            return { success: false, loan_id, updated: false, error: err.message };
        });
    },

    // Cria um empréstimo de uso interno (fantasma - já devolvido)
    // Usa student_id = 2 (proaluno) para indicar uso interno
    createInternalUseLoan: async (book_id) => {
        console.log(`🔵 [LoansModel] Criando empréstimo de uso interno: book_id=${book_id}`);
        return executeQuery(
            `INSERT INTO loans (book_id, student_id, due_date, renewals, returned_at) 
             VALUES (?, 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP)`,
            [book_id]
        ).then((result) => {
            console.log(`🟢 [LoansModel] Empréstimo de uso interno criado com ID: ${result.lastID}`);
            return { success: true, loan_id: result.lastID, updated: true };
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao criar empréstimo de uso interno: ${err.message}`);
            return { success: false, loan_id: null, updated: false, error: err.message };
        });
    },

    // Busca um empréstimo pelo ID
    getLoanById: (loan_id) => {
        return getQuery(`SELECT * FROM loans WHERE id = ?`, [loan_id]).then((row) => {
            return row;
        }).catch((err) => {
            throw err;
        });
    },

    // Busca um empréstimo ativo pelo ID (retorna null se não encontrado ou já devolvido)
    getActiveLoanById: (loan_id) => {
        return getQuery(`SELECT * FROM loans WHERE id = ? AND returned_at IS NULL`, [loan_id]).then((row) => {
            return row;
        }).catch((err) => {
            throw err;
        });
    },

    // Renova um empréstimo
    renewLoan: (loan_id, new_due_date) => {
        console.log(`🔵 [LoansModel] Renovando empréstimo: loan_id=${loan_id}, new_due_date=${new_due_date}`);
        // Atualiza due_date para a data informada
        return executeQuery(
            `UPDATE loans SET renewals = renewals + 1, due_date = ? WHERE id = ? AND returned_at IS NULL`,
            [new_due_date, loan_id]
        ).then((result) => {
            if (result.changes === 0) {
                throw new Error('Empréstimo não encontrado ou já devolvido.');
            }
            console.log(`🟢 [LoansModel] Empréstimo renovado com sucesso: loan_id=${loan_id}`);
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao renovar empréstimo: ${err.message}`);
            throw err;
        });
    },

    // Registra o último nudge enviado para um empréstimo
    // NÃO UTILIZADO ATUALMENTE
    setLastNudged: (loan_id) => {
        return executeQuery(
            `UPDATE loans SET last_nudged_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [loan_id]
        ).then(() => {
            return;
        }).catch((err) => {
            throw err;
        });
    },

    // Encurta o prazo de um empréstimo estendido para 5 dias a partir de agora
    shortenDueDateIfLongerThan: (loan_id, targetDaysFromNow) => {
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
    },

    // Busca todos os empréstimos
    getAllLoans: async function () {
        console.log("🔵 [LoansModel] Buscando todos os empréstimos com detalhes completos");
        try {
            const rows = await allQuery(
                `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date, l.is_extended, l.last_nudged_at
                 FROM loans l
                 LEFT JOIN users u ON l.student_id = u.id
                 LEFT JOIN books b ON l.book_id = b.id
                 ORDER BY l.borrowed_at DESC`,
                []
            );
            console.log(`🟢 [LoansModel] Empréstimos encontrados: ${rows.length}`);
            return await Promise.all(rows.map(async (row) => {
                const user = await UsersModel.getUserById(row.student_id);
                const book = await BooksModel.getBookById(row.book_id);
                return {
                    id: row.loan_id,
                    book,
                    user,
                    borrowed_at: row.borrowed_at,
                    returned_at: row.returned_at,
                    due_date: row.due_date,
                    renewals: row.renewals,
                    is_extended: !!row.is_extended,
                    last_nudged_at: row.last_nudged_at
                };
            }));
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos: ${err.message}`);
            throw err;
        }
    },

    // Busca empréstimos de um usuário específico
    getLoansByUser: async function (user_id) {
        console.log(`🔵 [LoansModel] Buscando empréstimos do usuário: ${user_id}`);
        try {
            const rows = await allQuery(
                `SELECT l.id as loan_id, l.book_id, l.student_id, l.borrowed_at, l.returned_at, l.renewals, l.due_date, l.is_extended, l.last_nudged_at
                 FROM loans l
                 LEFT JOIN books b ON l.book_id = b.id
                 WHERE l.student_id = ?
                 ORDER BY l.borrowed_at DESC`,
                [user_id]
            );
            return await Promise.all(rows.map(async (row) => {
                const user = await UsersModel.getUserById(row.student_id);
                const book = await BooksModel.getBookById(row.book_id);
                return {
                    id: row.loan_id,
                    book,
                    user,
                    borrowed_at: row.borrowed_at,
                    returned_at: row.returned_at,
                    due_date: row.due_date,
                    renewals: row.renewals,
                    is_extended: !!row.is_extended,
                    last_nudged_at: row.last_nudged_at
                };
            }));
        } catch (err) {
            console.error(`🔴 [LoansModel] Erro ao buscar empréstimos do usuário: ${err.message}`);
            throw err;
        }
    },

    /* ======================= Funções usadas em RulesService ======================= */
    
    // Verifica se existe empréstimo ativo para um livro
    hasActiveLoan: (book_id) => {
        console.log(`🔵 [LoansModel] Verificando empréstimo ativo para book_id=${book_id}`);
        return getQuery(
            `SELECT id FROM loans WHERE book_id = ? AND returned_at IS NULL`,
            [book_id]
        ).then((row) => {
            if (row) {
                console.warn(`🟡 [LoansModel] Livro ${book_id} já está emprestado`);
            } else {
                console.log(`🟢 [LoansModel] Livro ${book_id} disponível para empréstimo`);
            }
            return !!row; // true se existe empréstimo ativo
        }).catch((err) => {
            console.error(`🔴 [LoansModel] Erro ao verificar empréstimo ativo: ${err.message}`);
            throw err;
        });
    },

    // Busca empréstimo ativo de um usuário para um livro
    getActiveLoanByUserAndBook: (user_id, book_id) => {
        return getQuery(
            `SELECT id as loan_id FROM loans WHERE student_id = ? AND book_id = ? AND returned_at IS NULL`,
            [user_id, book_id]
        ).then((row) => {
            return row;
        }).catch((err) => {
            throw err;
        });
    },
};